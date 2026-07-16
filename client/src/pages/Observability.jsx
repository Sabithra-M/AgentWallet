import { useEffect, useState } from 'react'
import {
  Receipt,
  CheckCircle2,
  ShieldAlert,
  TrendingUp,
  XCircle,
  AlertTriangle,
  CreditCard,
  Bell,
  ScrollText,
  Download,
} from 'lucide-react'
import AppLayout from '../components/layout/AppLayout.jsx'
import StatCard from '../components/common/StatCard.jsx'
import StatCardSkeleton from '../components/common/StatCardSkeleton.jsx'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import ObservabilityFilters from '../components/observability/ObservabilityFilters.jsx'
import ObservabilityCharts from '../components/observability/ObservabilityCharts.jsx'
import * as analyticsService from '../services/analyticsService.js'
import * as walletService from '../services/walletService.js'
import * as merchantService from '../services/merchantService.js'
import * as alertService from '../services/alertService.js'
import { downloadFile } from '../utils/downloadFile.js'
import { getErrorMessage } from '../utils/errorMessage.js'

const DEFAULT_FILTERS = {
  range: '30d',
  customFrom: '',
  customTo: '',
  walletId: '',
  merchantId: '',
  status: '',
  riskLevel: '',
}

function computeDateRange(filters) {
  const now = new Date()
  if (filters.range === 'today') {
    return { from: new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString(), to: now.toISOString() }
  }
  if (filters.range === '7d') {
    return { from: new Date(now.getTime() - 7 * 86400000).toISOString(), to: now.toISOString() }
  }
  if (filters.range === '30d') {
    return { from: new Date(now.getTime() - 30 * 86400000).toISOString(), to: now.toISOString() }
  }
  if (filters.range === 'custom') {
    return {
      from: filters.customFrom ? new Date(filters.customFrom).toISOString() : null,
      to: filters.customTo ? new Date(`${filters.customTo}T23:59:59`).toISOString() : null,
    }
  }
  return { from: null, to: null }
}

function Observability() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [wallets, setWallets] = useState([])
  const [merchants, setMerchants] = useState([])
  const [summary, setSummary] = useState(null)
  const [charts, setCharts] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState('')
  const [loadError, setLoadError] = useState(null)

  function apiFilters() {
    const { from, to } = computeDateRange(filters)
    return { from, to, walletId: filters.walletId, merchantId: filters.merchantId, status: filters.status, riskLevel: filters.riskLevel }
  }

  function loadAnalytics() {
    const query = apiFilters()
    return Promise.all([analyticsService.getSummary(query), analyticsService.getCharts(query)]).then(
      ([summaryData, chartsData]) => {
        setSummary(summaryData)
        setCharts(chartsData)
      },
    )
  }

  useEffect(() => {
    let isMounted = true
    Promise.all([walletService.getWallets(), merchantService.getMerchants()]).then(([walletsData, merchantsData]) => {
      if (isMounted) {
        setWallets(walletsData)
        setMerchants(merchantsData)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setError('')
    setLoadError(null)
    loadAnalytics()
      .catch((err) => {
        if (isMounted) setLoadError(err)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  // Realtime, via the existing SSE alerts stream — every payment decision and
  // every virtual card use already fires an alert, so any new alert arriving
  // is a reliable "something just happened" signal. Debounced so a burst of
  // alerts (e.g. several payments in a row) triggers one refetch, not many.
  useEffect(() => {
    let debounceTimer = null
    const unsubscribe = alertService.subscribeToAlerts(() => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        loadAnalytics().catch(() => {})
      }, 400)
    })
    return () => {
      clearTimeout(debounceTimer)
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  async function handleExport(format) {
    setIsExporting(true)
    setError('')
    try {
      const { blob, filename } = await analyticsService.exportPayments(format, apiFilters())
      downloadFile(blob, filename)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Observability</h1>
            <p className="mt-1 text-sm text-slate-500">
              Payment activity, security posture, and AI risk scoring across your wallets.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              icon={<Download size={16} />}
              disabled={isExporting}
              onClick={() => handleExport('csv')}
            >
              CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              icon={<Download size={16} />}
              disabled={isExporting}
              onClick={() => handleExport('xlsx')}
            >
              Excel
            </Button>
            <Button
              type="button"
              variant="outline"
              icon={<Download size={16} />}
              disabled={isExporting}
              onClick={() => handleExport('pdf')}
            >
              PDF
            </Button>
          </div>
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

        <ObservabilityFilters filters={filters} onChange={setFilters} wallets={wallets} merchants={merchants} />

        {loadError && !isLoading ? (
          <ErrorState error={loadError} onRetry={() => setFilters((f) => ({ ...f }))} />
        ) : summary && !isLoading && summary.totalPayments === 0 ? (
          <EmptyState
            icon={<Receipt size={22} />}
            title="No payment activity yet"
            description="Once AI payments start flowing, your analytics will show up here."
            actionLabel="Open AI Assistant"
            actionHref="/ai-assistant"
            className="rounded-2xl bg-white shadow-sm"
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {isLoading || !summary ? (
                Array.from({ length: 10 }).map((_, index) => <StatCardSkeleton key={index} />)
              ) : (
                <>
                  <StatCard variant="highlighted" icon={<Receipt size={18} />} label="Total Payments" value={summary.totalPayments} />
                  <StatCard icon={<CheckCircle2 size={18} />} label="Approved" value={summary.approved} />
                  <StatCard icon={<ShieldAlert size={18} />} label="Blocked" value={summary.blocked} />
                  <StatCard icon={<TrendingUp size={18} />} label="Approval Rate" value={`${summary.approvalRate}%`} />
                  <StatCard icon={<XCircle size={18} />} label="Block Rate" value={`${summary.blockRate}%`} />
                  <StatCard icon={<AlertTriangle size={18} />} label="Average Risk Score" value={summary.averageRiskScore} />
                  <StatCard icon={<CreditCard size={18} />} label="Virtual Cards Generated" value={summary.virtualCardsGenerated} />
                  <StatCard icon={<CreditCard size={18} />} label="Virtual Cards Used" value={summary.virtualCardsUsed} />
                  <StatCard icon={<Bell size={18} />} label="Alerts Today" value={summary.alertsToday} />
                  <StatCard icon={<ScrollText size={18} />} label="Audit Events Today" value={summary.auditEventsToday} />
                </>
              )}
            </div>

            {isLoading || !charts ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <StatCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <ObservabilityCharts charts={charts} />
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}

export default Observability
