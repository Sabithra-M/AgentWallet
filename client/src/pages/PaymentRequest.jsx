import { Link } from 'react-router-dom'
import { CheckCircle2, XCircle } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout.jsx'
import Card from '../components/common/Card.jsx'
import SectionHeader from '../components/common/SectionHeader.jsx'
import Button from '../components/common/Button.jsx'
import Input from '../components/common/Input.jsx'
import Dropdown from '../components/common/Dropdown.jsx'
import Badge from '../components/common/Badge.jsx'
import BackLink from '../components/common/BackLink.jsx'
import WalletIcon from '../components/wallet/WalletIcon.jsx'
import Skeleton from '../components/common/Skeleton.jsx'
import { useSimulatedLoading } from '../hooks/useSimulatedLoading.js'
import { paymentRequest } from '../data/paymentRequest.js'
import { wallets } from '../data/wallets.js'
import { formatCurrency } from '../utils/formatCurrency.js'

function PurposeField({ label, id, defaultValue }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-slate-700">
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        defaultValue={defaultValue}
        className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400/90 transition-all duration-200 hover:border-slate-300 focus:border-indigo-500 focus:shadow-sm focus:outline-none focus:ring-[4px] focus:ring-indigo-500/15"
      />
    </div>
  )
}

function PolicyCheckRow({ label, passed, detail }) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 py-3 last:border-0">
      {passed ? (
        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
      ) : (
        <XCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
      )}
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="mt-0.5 text-xs text-slate-500">{detail}</p>
      </div>
    </div>
  )
}

function SummaryFieldSkeleton() {
  return (
    <div className="flex flex-col gap-1.5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  )
}

function RequestSummarySkeleton() {
  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <SummaryFieldSkeleton />
        <SummaryFieldSkeleton />
      </div>
      <SummaryFieldSkeleton />
    </Card>
  )
}

function PolicyValidationSkeleton() {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </Card>
  )
}

function PaymentSummarySkeleton() {
  return (
    <Card className="flex flex-col gap-4">
      <Skeleton className="h-4 w-32" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </Card>
  )
}

function PaymentRequest() {
  const isLoading = useSimulatedLoading()

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <BackLink to="/approvals" label="Back to Approvals" />

        <div>
          <h1 className="text-xl font-semibold text-slate-800">Payment Request</h1>
          <p className="mt-1 text-sm text-slate-500">Review the AI-generated request before approving.</p>
        </div>

        {isLoading ? (
          <>
            <RequestSummarySkeleton />
            <PolicyValidationSkeleton />
            <PaymentSummarySkeleton />
          </>
        ) : (
          <>
            <Card className="flex flex-col gap-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <WalletIcon category={paymentRequest.category} />
                  <div>
                    <p className="text-lg font-semibold text-slate-800">{paymentRequest.merchant}</p>
                    <p className="text-xs text-slate-500">Requested {paymentRequest.requestedTime}</p>
                  </div>
                </div>
                <Badge status={paymentRequest.confidenceLevel} />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Dropdown label="Wallet" id="request-wallet" defaultValue={paymentRequest.wallet}>
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.name}>
                      {wallet.name}
                    </option>
                  ))}
                </Dropdown>
                <Input
                  label="Amount"
                  id="request-amount"
                  type="number"
                  defaultValue={paymentRequest.amount}
                />
              </div>

              <PurposeField label="Purpose" id="request-purpose" defaultValue={paymentRequest.purpose} />
            </Card>

            <Card className="flex flex-col gap-2">
              <SectionHeader
                title="Policy Validation"
                action={<Badge status={paymentRequest.riskLevel} />}
              />
              <div className="flex flex-col">
                {paymentRequest.policyChecks.map((check) => (
                  <PolicyCheckRow key={check.label} {...check} />
                ))}
              </div>
            </Card>

            <Card className="flex flex-col gap-4">
              <SectionHeader title="Payment Summary" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Merchant</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">{paymentRequest.merchant}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Wallet</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">{paymentRequest.wallet}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Amount</p>
                  <p className="mt-1 text-xl font-semibold text-slate-800">
                    {formatCurrency(paymentRequest.amount)}
                  </p>
                </div>
              </div>
            </Card>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link to="/approvals" className="w-full sm:w-auto">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button type="button" variant="primary" className="w-full sm:w-auto">
                Request Approval
              </Button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}

export default PaymentRequest
