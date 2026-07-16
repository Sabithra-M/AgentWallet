import * as walletsRepository from '../repositories/wallets.repository.js'
import * as paymentTransactionsRepository from '../repositories/paymentTransactions.repository.js'
import * as notificationsService from './notifications.service.js'
import { pool } from '../db/index.js'
import { fail } from '../utils/httpError.js'

function assertOwnership(wallet, userId) {
  if (wallet.user_id !== userId) {
    const error = new Error('You do not have access to this wallet')
    error.status = 403
    throw error
  }
}


export async function create(userId, data) {
  try {
    const wallet = await walletsRepository.create({ ...data, userId })
    await notificationsService.notify(userId, 'Wallet created', `${wallet.name} was created successfully`, {
      walletId: wallet.id,
    })
    return wallet
  } catch (error) {
    throw error
  }
}

export async function findById(id, userId) {
  try {
    const wallet = await walletsRepository.findById(id)
    if (!wallet) return null
    assertOwnership(wallet, userId)
    return wallet
  } catch (error) {
    throw error
  }
}

export async function findAll(userId) {
  try {
    return await walletsRepository.findAllByUserId(userId)
  } catch (error) {
    throw error
  }
}

export async function update(id, userId, data) {
  try {
    const wallet = await walletsRepository.findById(id)
    if (!wallet) return null
    assertOwnership(wallet, userId)
    return await walletsRepository.update(id, data)
  } catch (error) {
    throw error
  }
}

export async function addMoney(walletId, userId, amount) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const wallet = await walletsRepository.findByIdForUpdate(walletId, client)
    if (!wallet) {
      const error = new Error('Wallet not found')
      error.status = 404
      throw error
    }
    assertOwnership(wallet, userId)
    if (wallet.status !== 'active') {
      const error = new Error('Wallet is not active')
      error.status = 403
      throw error
    }

    const newBalance = Number(wallet.balance) + Number(amount)
    const updatedWallet = await walletsRepository.update(walletId, { balance: newBalance }, client)

    const transaction = await paymentTransactionsRepository.create(
      { walletId, amount, type: 'credit', status: 'completed', paymentMethod: 'Top-up' },
      client,
    )

    await client.query('COMMIT')

    return { wallet: updatedWallet, transaction }
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    throw error
  } finally {
    client.release()
  }
}

// Creates an AI Wallet funded by reserving `budget` out of the user's Main
// Wallet balance — the reservation and the new wallet row are one transaction,
// so a failure at either step rolls back both.
export async function createAiWallet(userId, { name, description, budget, expiresAt }) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const mainWallet = await walletsRepository.findMainByUserIdForUpdate(userId, client)
    if (!mainWallet) fail(404, 'Main Wallet not found')
    if (Number(budget) > Number(mainWallet.balance)) {
      fail(403, 'Budget cannot exceed your Main Wallet balance')
    }

    await walletsRepository.update(
      mainWallet.id,
      { balance: Number(mainWallet.balance) - Number(budget) },
      client,
    )

    const aiWallet = await walletsRepository.create(
      {
        userId,
        name,
        category: 'ai',
        description,
        balance: budget,
        budget,
        status: 'active',
        isMain: false,
        expiresAt,
      },
      client,
    )

    await client.query('COMMIT')

    await notificationsService.notify(userId, 'AI Wallet created', `${aiWallet.name} was allocated ${budget}`, {
      walletId: aiWallet.id,
    })

    return aiWallet
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    throw error
  } finally {
    client.release()
  }
}

export async function remove(id, userId) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const wallet = await walletsRepository.findByIdForUpdate(id, client)
    if (!wallet) {
      await client.query('ROLLBACK')
      return null
    }
    assertOwnership(wallet, userId)
    if (wallet.is_main) fail(403, 'The Main Wallet cannot be deleted')

    // AI Wallets were funded by reserving money out of the Main Wallet — any
    // unspent balance goes back there before the wallet itself is removed.
    if (wallet.category === 'ai' && Number(wallet.balance) > 0) {
      const mainWallet = await walletsRepository.findMainByUserIdForUpdate(userId, client)
      if (mainWallet) {
        await walletsRepository.update(
          mainWallet.id,
          { balance: Number(mainWallet.balance) + Number(wallet.balance) },
          client,
        )
      }
    }

    const removed = await walletsRepository.remove(id, client)
    await client.query('COMMIT')
    return removed
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    throw error
  } finally {
    client.release()
  }
}
