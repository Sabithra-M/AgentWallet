import api from './api.js'
import { capitalize } from '../utils/capitalize.js'

function normalizePaymentRequest(request) {
  return {
    id: request.id,
    walletId: request.wallet_id,
    merchantId: request.merchant_id,
    requestedBy: request.requested_by,
    amount: Number(request.amount),
    purpose: request.purpose,
    aiConfidence: request.ai_confidence === null ? null : Number(request.ai_confidence),
    riskLevel: request.risk_level,
    riskScore: request.risk_score === null || request.risk_score === undefined ? null : Number(request.risk_score),
    riskFactors: request.risk_factors ?? [],
    status: capitalize(request.status),
    category: request.category,
    currency: request.currency,
    aiReason: request.ai_reason,
    evaluationResult: request.evaluation_result,
    blockReason: request.block_reason,
    evaluationTime: request.evaluation_time,
    remainingBudgetAfter:
      request.remaining_budget_after === null ? null : Number(request.remaining_budget_after),
    createdAt: request.created_at,
    updatedAt: request.updated_at,
  }
}

export async function getPaymentRequests() {
  const response = await api.get('/payment-requests')
  return response.data.map(normalizePaymentRequest)
}

export async function getPaymentRequest(id) {
  const response = await api.get(`/payment-requests/${id}`)
  return normalizePaymentRequest(response.data)
}

function normalizeTimelineEvent(event) {
  return {
    id: event.id,
    paymentRequestId: event.payment_request_id,
    eventType: event.event_type,
    message: event.message,
    createdAt: event.created_at,
  }
}

export async function getPaymentRequestTimeline(id) {
  const response = await api.get(`/payment-requests/${id}/timeline`)
  return response.data.map(normalizeTimelineEvent)
}

export async function createPaymentRequest(data) {
  const response = await api.post('/payment-requests', data)
  return normalizePaymentRequest(response.data)
}

export async function approvePaymentRequest(id, reason) {
  const response = await api.post(`/payment-requests/${id}/approve`, reason ? { reason } : {})
  return normalizePaymentRequest(response.data.paymentRequest)
}

export async function rejectPaymentRequest(id, reason) {
  const response = await api.post(`/payment-requests/${id}/reject`, reason ? { reason } : {})
  return normalizePaymentRequest(response.data.paymentRequest)
}
