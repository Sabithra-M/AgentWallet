import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Receipt } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout.jsx'
import Card from '../components/common/Card.jsx'
import Badge from '../components/common/Badge.jsx'
import TableSkeleton from '../components/common/TableSkeleton.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import * as walletService from '../services/walletService.js'
import * as merchantService from '../services/merchantService.js'
import * as paymentRequestService from '../services/paymentRequestService.js'
import { formatCurrency } from '../utils/formatCurrency.js'
import { capitalize } from '../utils/capitalize.js'
import { formatDateTime } from '../utils/formatDateTime.js'
import { toLookup } from '../utils/toLookup.js'

function PaymentRequests() {
  const navigate = useNavigate()
  const [wallets, setWallets] = useState([])
  const [merchants, setMerchants] = useState([])
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadRequests = useCallback(() => {
    setIsLoading(true)
    setError(null)
    return Promise.all([
      walletService.getWallets(),
      merchantService.getMerchants(),
      paymentRequestService.getPaymentRequests(),
    ])
      .then(([walletsData, merchantsData, requestsData]) => {
        setWallets(walletsData)
        setMerchants(merchantsData)
        setRequests(requestsData)
      })
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  const walletNameById = toLookup(wallets)
  const merchantNameById = toLookup(merchants)

  const sortedRequests = [...requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Payment Requests</h1>
          <p className="mt-1 text-sm text-slate-500">
            Every payment request created for your AI Wallets, newest first.
          </p>
        </div>

        <Card>
          {isLoading ? (
            <TableSkeleton rows={6} columns={7} />
          ) : error ? (
            <ErrorState error={error} onRetry={loadRequests} />
          ) : sortedRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400">
                    <th className="whitespace-nowrap py-2 font-medium">Merchant</th>
                    <th className="whitespace-nowrap py-2 font-medium">Category</th>
                    <th className="whitespace-nowrap py-2 font-medium">Amount</th>
                    <th className="whitespace-nowrap py-2 font-medium">Wallet</th>
                    <th className="whitespace-nowrap py-2 font-medium">Status</th>
                    <th className="whitespace-nowrap py-2 font-medium">Risk</th>
                    <th className="whitespace-nowrap py-2 font-medium">Block Reason</th>
                    <th className="whitespace-nowrap py-2 font-medium">Evaluation Time</th>
                    <th className="whitespace-nowrap py-2 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedRequests.map((request) => (
                    <tr
                      key={request.id}
                      onClick={() => navigate(`/payment-requests/${request.id}`)}
                      className="cursor-pointer transition-colors hover:bg-slate-50"
                    >
                      <td className="py-3 font-medium text-slate-700">
                        {merchantNameById[request.merchantId] ?? 'Unknown Merchant'}
                      </td>
                      <td className="py-3 text-slate-500">{request.category ?? '—'}</td>
                      <td className="py-3 font-medium text-slate-700">{formatCurrency(request.amount)}</td>
                      <td className="py-3 text-slate-500">{walletNameById[request.walletId] ?? 'Unknown Wallet'}</td>
                      <td className="py-3">
                        <Badge status={request.status} />
                      </td>
                      <td className="py-3">
                        {request.riskLevel ? (
                          <Badge status={capitalize(request.riskLevel)} />
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 text-slate-500">{request.blockReason ?? '—'}</td>
                      <td className="py-3 text-slate-500">
                        {request.evaluationTime ? formatDateTime(request.evaluationTime) : '—'}
                      </td>
                      <td className="py-3 text-slate-500">{formatDateTime(request.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<Receipt size={22} />}
              title="No payment requests yet"
              description="Ask the AI Assistant to book, buy, or pay for something."
              actionLabel="Open AI Assistant"
              actionHref="/ai-assistant"
            />
          )}
        </Card>
      </div>
    </AppLayout>
  )
}

export default PaymentRequests
