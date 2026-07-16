import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  CreditCard,
  ShieldAlert,
  Bell,
  ScrollText,
} from 'lucide-react'
import AppLayout from '../components/layout/AppLayout.jsx'
import Card from '../components/common/Card.jsx'
import SectionHeader from '../components/common/SectionHeader.jsx'
import Badge from '../components/common/Badge.jsx'
import BackLink from '../components/common/BackLink.jsx'
import Skeleton from '../components/common/Skeleton.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import * as paymentRequestService from '../services/paymentRequestService.js'
import * as walletService from '../services/walletService.js'
import * as merchantService from '../services/merchantService.js'
import * as virtualCardService from '../services/virtualCardService.js'
import * as auditLogService from '../services/auditLogService.js'
import * as alertService from '../services/alertService.js'
import { getErrorMessage } from '../utils/errorMessage.js'
import { formatCurrency } from '../utils/formatCurrency.js'
import { capitalize } from '../utils/capitalize.js'
import { formatDateTime as formatDateTimeBase } from '../utils/formatDateTime.js'

const TIMELINE_ICONS = {
  created: FileText,
  evaluation_started: Search,
  approved: CheckCircle2,
  rejected: XCircle,
  blocked: ShieldAlert,
  card_generated: CreditCard,
  card_used: CreditCard,
  payment_completed: CheckCircle2,
}

const AUDIT_ACTION_LABELS = {
  'payment_request.approved': 'Payment request approved',
  'payment_request.rejected': 'Payment request rejected',
  'payment_request.executed': 'Payment executed',
  'virtual_card.used': 'Virtual Card Used',
  'virtual_card.use_failed': 'Virtual Card Use Failed',
}

function formatDateTime(value) {
  return formatDateTimeBase(value, { includeSeconds: true })
}

function PaymentDetails() {
  const { id } = useParams()

  const [request, setRequest] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [wallet, setWallet] = useState(null)
  const [merchant, setMerchant] = useState(null)
  const [virtualCard, setVirtualCard] = useState(null)
  const [auditLogs, setAuditLogs] = useState([])
  const [alerts, setAlerts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setError('')

    Promise.all([
      paymentRequestService.getPaymentRequest(id),
      paymentRequestService.getPaymentRequestTimeline(id),
      merchantService.getMerchants(),
      virtualCardService.getVirtualCards(),
      auditLogService.getAuditLogs(),
      alertService.getAlerts(),
    ])
      .then(([requestData, timelineData, merchantsData, cardsData, auditLogsData, alertsData]) => {
        if (!isMounted) return
        setRequest(requestData)
        setTimeline(timelineData)
        setMerchant(merchantsData.find((m) => m.id === requestData.merchantId) ?? null)
        const card = cardsData.find((c) => c.paymentRequestId === id) ?? null
        setVirtualCard(card)
        setAuditLogs(
          auditLogsData.filter(
            (log) =>
              (log.entityType === 'payment_request' && log.entityId === id) ||
              (card && log.entityType === 'virtual_card' && log.entityId === card.id),
          ),
        )
        setAlerts(alertsData.filter((alert) => alert.paymentRequestId === id))
        return walletService.getWallet(requestData.walletId)
      })
      .then((walletData) => {
        if (isMounted && walletData) setWallet(walletData)
      })
      .catch((err) => {
        if (isMounted) setError(getErrorMessage(err))
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id])

  if (!isLoading && (error || !request)) {
    return (
      <AppLayout>
        <div className="flex flex-col gap-4">
          <BackLink to="/payment-requests" label="Back to Payment Requests" />
          <Card className="flex flex-col items-center gap-2 py-16 text-center">
            <p className="text-base font-semibold text-slate-700">Payment request not found</p>
            <Link to="/payment-requests" className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Go back
            </Link>
          </Card>
        </div>
      </AppLayout>
    )
  }

  if (isLoading || !request) {
    return (
      <AppLayout>
        <div className="flex flex-col gap-6">
          <BackLink to="/payment-requests" label="Back to Payment Requests" />
          <Card className="flex flex-col gap-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <BackLink to="/payment-requests" label="Back to Payment Requests" />

        {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

        <Card className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold text-slate-800">{merchant?.name ?? 'Unknown Merchant'}</h1>
              <p className="mt-1 text-sm text-slate-500">{wallet?.name ?? 'Unknown Wallet'}</p>
            </div>
            <Badge status={request.status} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Amount</p>
              <p className="mt-1 text-xl font-semibold text-slate-800">{formatCurrency(request.amount)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Risk Score</p>
              <p className="mt-1 text-xl font-semibold text-slate-800">
                {request.riskScore ?? '—'}
                {request.riskLevel && (
                  <span className="ml-2">
                    <Badge status={capitalize(request.riskLevel)} />
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Created</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{formatDateTime(request.createdAt)}</p>
            </div>
          </div>
        </Card>

        {request.riskFactors?.length > 0 && (
          <Card>
            <SectionHeader title="Risk Factors" />
            <div className="flex flex-col divide-y divide-slate-100">
              {request.riskFactors.map((factor, index) => (
                <div key={index} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-slate-600">{factor.label}</span>
                  <span className={factor.delta > 0 ? 'font-semibold text-red-600' : 'font-semibold text-emerald-600'}>
                    {factor.delta > 0 ? '+' : ''}
                    {factor.delta}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <SectionHeader title="Policy Evaluation" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Evaluation Result</p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {request.evaluationResult ? capitalize(request.evaluationResult) : 'Not yet evaluated'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Evaluation Time</p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {request.evaluationTime ? formatDateTime(request.evaluationTime) : '—'}
              </p>
            </div>
          </div>
          {request.blockReason && (
            <p className="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600">
              Block Reason: {request.blockReason}
            </p>
          )}
        </Card>

        <Card>
          <SectionHeader title="Timeline" />
          {timeline.length > 0 ? (
            <div className="flex flex-col divide-y divide-slate-100">
              {timeline.map((event) => {
                const Icon = TIMELINE_ICONS[event.eventType] ?? FileText
                return (
                  <div key={event.id} className="flex items-start gap-3 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{event.message}</p>
                      <p className="text-xs text-slate-400">{formatDateTime(event.createdAt)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState icon={<FileText size={22} />} title="No timeline events recorded" />
          )}
        </Card>

        {virtualCard && (
          <Card>
            <SectionHeader
              title="Virtual Card"
              action={
                <Link to={`/virtual-cards/${virtualCard.id}`} className="text-sm font-medium text-indigo-600">
                  View card
                </Link>
              }
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Card Number</p>
                <p className="mt-1 text-sm font-medium text-slate-700">•••• {virtualCard.cardNumber.slice(-4)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Status</p>
                <p className="mt-1">
                  <Badge status={capitalize(virtualCard.status)} />
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Spending Limit</p>
                <p className="mt-1 text-sm font-medium text-slate-700">{formatCurrency(virtualCard.spendingLimit)}</p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <SectionHeader title="Audit Events" />
            {auditLogs.length > 0 ? (
              <div className="flex flex-col divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 py-3">
                    <ScrollText size={16} className="mt-0.5 shrink-0 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{AUDIT_ACTION_LABELS[log.action] ?? log.action}</p>
                      <p className="text-xs text-slate-400">{formatDateTime(log.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<ScrollText size={22} />} title="No audit events for this payment" />
            )}
          </Card>

          <Card>
            <SectionHeader title="Alerts" />
            {alerts.length > 0 ? (
              <div className="flex flex-col divide-y divide-slate-100">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 py-3">
                    <Bell size={16} className="mt-0.5 shrink-0 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{alert.title}</p>
                      <p className="text-xs text-slate-500">{alert.message}</p>
                      <p className="text-xs text-slate-400">{formatDateTime(alert.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Bell size={22} />} title="No alerts for this payment" />
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

export default PaymentDetails
