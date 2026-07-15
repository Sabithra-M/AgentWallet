import * as paymentRequestsRepository from '../repositories/paymentRequests.repository.js'
import * as walletsRepository from '../repositories/wallets.repository.js'
import * as merchantsRepository from '../repositories/merchants.repository.js'
import * as walletPoliciesRepository from '../repositories/walletPolicies.repository.js'
import * as paymentApprovalsRepository from '../repositories/paymentApprovals.repository.js'
import * as paymentTransactionsRepository from '../repositories/paymentTransactions.repository.js'
import * as auditLogsRepository from '../repositories/auditLogs.repository.js'
import { pool } from '../db/index.js'

const ACTIVE_REQUEST_STATUSES = ['pending', 'approved']

function fail(status, message) {
  const error = new Error(message)
  error.status = status
  throw error
}

function isSameMonth(dateA, dateB) {
  return dateA.getFullYear() === dateB.getFullYear() && dateA.getMonth() === dateB.getMonth()
}

async function enforceWalletPolicies({ wallet, merchant, amount }) {
  const policies = await walletPoliciesRepository.findAllByWalletId(wallet.id)
  const activePolicies = policies.filter((policy) => policy.is_active)
  if (activePolicies.length === 0) return

  const now = new Date()

  for (const policy of activePolicies) {
    switch (policy.policy_type) {
      case 'per_transaction_limit': {
        if (policy.threshold_amount !== null && amount > Number(policy.threshold_amount)) {
          fail(403, `Amount exceeds the per-transaction limit of ${policy.threshold_amount} for this wallet`)
        }
        break
      }
      case 'monthly_limit': {
        if (policy.threshold_amount === null) break
        const existingRequests = await paymentRequestsRepository.findAllByWalletId(wallet.id)
        const monthToDate = existingRequests
          .filter((r) => ACTIVE_REQUEST_STATUSES.includes(r.status))
          .filter((r) => isSameMonth(new Date(r.created_at), now))
          .reduce((sum, r) => sum + Number(r.amount), 0)
        if (monthToDate + amount > Number(policy.threshold_amount)) {
          fail(403, `Amount would exceed the monthly limit of ${policy.threshold_amount} for this wallet`)
        }
        break
      }
      case 'merchant_blocklist': {
        const blockedMerchantIds = policy.config?.merchantIds ?? []
        if (blockedMerchantIds.includes(merchant.id)) {
          fail(403, 'This merchant is blocked by wallet policy')
        }
        break
      }
      case 'category_restriction': {
        const blockedCategories = policy.config?.blockedCategories ?? []
        if (merchant.category && blockedCategories.includes(merchant.category)) {
          fail(403, `Merchant category "${merchant.category}" is blocked by wallet policy`)
        }
        break
      }
      default:
        break
    }
  }
}

export async function create(userId, data) {
  try {
    const wallet = await walletsRepository.findById(data.walletId)
    if (!wallet) fail(404, 'Wallet not found')

    const merchant = await merchantsRepository.findById(data.merchantId)
    if (!merchant) fail(404, 'Merchant not found')

    if (wallet.user_id !== userId) fail(403, 'You do not own this wallet')
    if (wallet.status !== 'active') fail(403, 'Wallet is not active')

    const amount = Number(data.amount)
    if (Number(wallet.balance) < amount) fail(403, 'Insufficient wallet balance')

    await enforceWalletPolicies({ wallet, merchant, amount })

    return await paymentRequestsRepository.create({ ...data, requestedBy: userId })
  } catch (error) {
    throw error
  }
}

async function decidePayment(requestId, userId, decision, reason) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const paymentRequest = await paymentRequestsRepository.findByIdForUpdate(requestId, client)
    if (!paymentRequest) fail(404, 'Payment request not found')

    const wallet = await walletsRepository.findByIdForUpdate(paymentRequest.wallet_id, client)
    if (!wallet) fail(404, 'Wallet not found')

    if (wallet.user_id !== userId) fail(403, 'Only the wallet owner can approve or reject this request')
    if (paymentRequest.status !== 'pending') {
      fail(409, `Payment request has already been ${paymentRequest.status}`)
    }

    const approval = await paymentApprovalsRepository.create(
      { paymentRequestId: requestId, decidedBy: userId, decision, reason },
      client,
    )

    const updatedRequest = await paymentRequestsRepository.update(requestId, { status: decision }, client)

    let transaction = null
    if (decision === 'approved') {
      if (Number(wallet.balance) < Number(paymentRequest.amount)) {
        fail(403, 'Insufficient wallet balance to approve this request')
      }

      const newBalance = Number(wallet.balance) - Number(paymentRequest.amount)
      await walletsRepository.update(wallet.id, { balance: newBalance }, client)

      transaction = await paymentTransactionsRepository.create(
        {
          paymentRequestId: requestId,
          walletId: wallet.id,
          merchantId: paymentRequest.merchant_id,
          amount: paymentRequest.amount,
          type: 'debit',
          status: 'completed',
        },
        client,
      )
    }

    await auditLogsRepository.create(
      {
        userId,
        action: `payment_request.${decision}`,
        entityType: 'payment_request',
        entityId: requestId,
        metadata: { reason: reason ?? null },
      },
      client,
    )

    await client.query('COMMIT')

    return { paymentRequest: updatedRequest, approval, transaction }
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    throw error
  } finally {
    client.release()
  }
}

export async function approvePayment(requestId, userId, reason = null) {
  return decidePayment(requestId, userId, 'approved', reason)
}

export async function rejectPayment(requestId, userId, reason = null) {
  return decidePayment(requestId, userId, 'rejected', reason)
}

export async function findById(id, userId) {
  try {
    const paymentRequest = await paymentRequestsRepository.findById(id)
    if (!paymentRequest) return null
    if (paymentRequest.requested_by !== userId) fail(403, 'You do not have access to this payment request')
    return paymentRequest
  } catch (error) {
    throw error
  }
}

export async function findAll(userId) {
  try {
    return await paymentRequestsRepository.findAllByRequestedBy(userId)
  } catch (error) {
    throw error
  }
}

export async function update(id, userId, data) {
  try {
    const paymentRequest = await paymentRequestsRepository.findById(id)
    if (!paymentRequest) return null
    if (paymentRequest.requested_by !== userId) fail(403, 'You do not have access to this payment request')
    return await paymentRequestsRepository.update(id, data)
  } catch (error) {
    throw error
  }
}

export async function remove(id, userId) {
  try {
    const paymentRequest = await paymentRequestsRepository.findById(id)
    if (!paymentRequest) return null
    if (paymentRequest.requested_by !== userId) fail(403, 'You do not have access to this payment request')
    return await paymentRequestsRepository.remove(id)
  } catch (error) {
    throw error
  }
}
