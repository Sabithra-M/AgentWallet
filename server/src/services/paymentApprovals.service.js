import * as paymentApprovalsRepository from '../repositories/paymentApprovals.repository.js'
import * as paymentRequestsRepository from '../repositories/paymentRequests.repository.js'
import { fail } from '../utils/httpError.js'


async function assertRequestOwnership(paymentRequestId, userId) {
  const paymentRequest = await paymentRequestsRepository.findById(paymentRequestId)
  if (!paymentRequest) fail(404, 'Payment request not found')
  if (paymentRequest.requested_by !== userId) fail(403, 'You do not have access to this payment approval')
  return paymentRequest
}

export async function create(userId, data) {
  try {
    await assertRequestOwnership(data.paymentRequestId, userId)
    return await paymentApprovalsRepository.create({ ...data, decidedBy: userId })
  } catch (error) {
    throw error
  }
}

export async function findById(id, userId) {
  try {
    const approval = await paymentApprovalsRepository.findById(id)
    if (!approval) return null
    await assertRequestOwnership(approval.payment_request_id, userId)
    return approval
  } catch (error) {
    throw error
  }
}

export async function findAll(userId) {
  try {
    return await paymentApprovalsRepository.findAllByRequestedBy(userId)
  } catch (error) {
    throw error
  }
}

export async function update(id, userId, data) {
  try {
    const approval = await paymentApprovalsRepository.findById(id)
    if (!approval) return null
    await assertRequestOwnership(approval.payment_request_id, userId)
    return await paymentApprovalsRepository.update(id, data)
  } catch (error) {
    throw error
  }
}

export async function remove(id, userId) {
  try {
    const approval = await paymentApprovalsRepository.findById(id)
    if (!approval) return null
    await assertRequestOwnership(approval.payment_request_id, userId)
    return await paymentApprovalsRepository.remove(id)
  } catch (error) {
    throw error
  }
}
