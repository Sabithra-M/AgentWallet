import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout.jsx'
import Card from '../components/common/Card.jsx'
import SectionHeader from '../components/common/SectionHeader.jsx'
import Badge from '../components/common/Badge.jsx'
import BackLink from '../components/common/BackLink.jsx'
import Skeleton from '../components/common/Skeleton.jsx'
import Button from '../components/common/Button.jsx'
import Input from '../components/common/Input.jsx'
import * as virtualCardService from '../services/virtualCardService.js'
import * as walletService from '../services/walletService.js'
import * as merchantService from '../services/merchantService.js'
import { getErrorMessage } from '../utils/errorMessage.js'
import { formatCurrency } from '../utils/formatCurrency.js'
import { capitalize } from '../utils/capitalize.js'
import { formatDateTime } from '../utils/formatDateTime.js'

function formatCardNumber(cardNumber) {
  return cardNumber.match(/.{1,4}/g).join(' ')
}

function useCountdown(expiresAt, status) {
  const [remainingMs, setRemainingMs] = useState(null)

  useEffect(() => {
    if (status !== 'active') return undefined

    function tick() {
      setRemainingMs(new Date(expiresAt).getTime() - Date.now())
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [expiresAt, status])

  if (remainingMs === null || remainingMs <= 0) return null
  const minutes = Math.floor(remainingMs / 60000)
  const seconds = Math.floor((remainingMs % 60000) / 1000)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function VirtualCardDetails() {
  const { id } = useParams()

  const [card, setCard] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [merchant, setMerchant] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCvvRevealed, setIsCvvRevealed] = useState(false)
  const [revealedCard, setRevealedCard] = useState(null)

  const [useMerchant, setUseMerchant] = useState('')
  const [useAmount, setUseAmount] = useState('')
  const [isUsing, setIsUsing] = useState(false)
  const [useResult, setUseResult] = useState(null)

  function loadAll() {
    return virtualCardService.getVirtualCard(id).then((cardData) => {
      setCard(cardData)
      setUseMerchant((prev) => prev || '')
      setUseAmount((prev) => prev || String(cardData.spendingLimit))
      return Promise.all([
        walletService.getWallet(cardData.walletId),
        merchantService.getMerchants(),
      ]).then(([walletData, merchantsData]) => {
        setWallet(walletData)
        setMerchant(merchantsData.find((m) => m.id === cardData.merchantId) ?? null)
        setUseMerchant((prev) => prev || merchantsData.find((m) => m.id === cardData.merchantId)?.name || '')
      })
    })
  }

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setError('')
    loadAll()
      .catch((err) => {
        if (isMounted) setError(getErrorMessage(err))
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const countdown = useCountdown(card?.expiresAt, card?.status)

  async function handleRevealStart() {
    setIsCvvRevealed(true)
    if (!revealedCard) {
      try {
        const revealed = await virtualCardService.revealVirtualCard(id)
        setRevealedCard(revealed)
      } catch {
        setIsCvvRevealed(false)
      }
    }
  }

  function handleRevealEnd() {
    setIsCvvRevealed(false)
  }

  async function handleUseCard(event) {
    event.preventDefault()
    setUseResult(null)
    setIsUsing(true)
    try {
      const updatedCard = await virtualCardService.useVirtualCard(id, {
        merchant: useMerchant,
        amount: Number(useAmount),
      })
      setCard(updatedCard)
      setUseResult({ ok: true, message: 'Payment completed successfully.' })
    } catch (err) {
      setUseResult({ ok: false, message: getErrorMessage(err) })
      await loadAll().catch(() => {})
    } finally {
      setIsUsing(false)
    }
  }

  if (!isLoading && (error || !card)) {
    return (
      <AppLayout>
        <div className="flex flex-col gap-4">
          <BackLink to="/dashboard" label="Back to Dashboard" />
          <Card className="flex flex-col items-center gap-2 py-16 text-center">
            <p className="text-base font-semibold text-slate-700">Virtual card not found</p>
            <p className="max-w-sm text-sm text-slate-500">
              This card doesn&apos;t exist or may have been removed.
            </p>
            <Link to="/dashboard" className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Go back to Dashboard
            </Link>
          </Card>
        </div>
      </AppLayout>
    )
  }

  if (isLoading || !card) {
    return (
      <AppLayout>
        <div className="flex flex-col gap-6">
          <BackLink to="/dashboard" label="Back to Dashboard" />
          <Card className="flex flex-col gap-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </Card>
        </div>
      </AppLayout>
    )
  }

  const displayStatus = card.status === 'active' && countdown === null ? 'Expired' : capitalize(card.status)

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <BackLink to="/dashboard" label="Back to Dashboard" />

        {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

        <Card className="flex flex-col gap-6 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-indigo-100">Virtual Card</p>
            <Badge status={displayStatus} />
          </div>
          <p className="text-2xl font-mono tracking-widest">
            {isCvvRevealed && revealedCard ? formatCardNumber(revealedCard.cardNumber) : card.cardNumber}
          </p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-indigo-200">Card Holder</p>
              <p className="text-sm font-medium">{card.cardHolder}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-indigo-200">Expiry</p>
              <p className="text-sm font-medium">
                {String(card.expiryMonth).padStart(2, '0')}/{String(card.expiryYear).slice(-2)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-indigo-200">CVV</p>
              <p
                className="text-sm font-medium select-none"
                onMouseDown={handleRevealStart}
                onMouseUp={handleRevealEnd}
                onMouseLeave={handleRevealEnd}
                onTouchStart={handleRevealStart}
                onTouchEnd={handleRevealEnd}
              >
                {isCvvRevealed && revealedCard ? revealedCard.cvv : '•••'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onMouseDown={handleRevealStart}
            onMouseUp={handleRevealEnd}
            onMouseLeave={handleRevealEnd}
            onTouchStart={handleRevealStart}
            onTouchEnd={handleRevealEnd}
            className="flex w-fit items-center gap-1.5 self-start rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/25"
          >
            <Eye size={14} />
            Show CVV
          </button>
        </Card>

        <Card className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Merchant Lock</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{merchant?.name ?? 'Unknown Merchant'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Wallet</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{wallet?.name ?? 'Unknown Wallet'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Amount</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{formatCurrency(card.spendingLimit)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Currency</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{card.currency}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Created Time</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{formatDateTime(card.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Expiry Time</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {formatDateTime(card.expiresAt)}
              {card.status === 'active' && countdown !== null && (
                <span className="ml-2 text-xs font-normal text-slate-400">({countdown} left)</span>
              )}
            </p>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Use Card (Simulation)" />
          {card.status !== 'active' || countdown === null ? (
            <p className="py-4 text-sm text-slate-400">
              This card is {displayStatus.toLowerCase()} and can no longer be used.
            </p>
          ) : (
            <form onSubmit={handleUseCard} className="flex flex-col gap-4">
              <p className="text-sm text-slate-500">
                Simulate a merchant charging this card. The masked number{' '}
                <span className="font-mono">{card.cardNumber}</span> is what a merchant would see.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Merchant"
                  id="use-card-merchant"
                  value={useMerchant}
                  onChange={(event) => setUseMerchant(event.target.value)}
                />
                <Input
                  label="Amount (₹)"
                  id="use-card-amount"
                  type="number"
                  step="0.01"
                  value={useAmount}
                  onChange={(event) => setUseAmount(event.target.value)}
                />
              </div>
              {useResult && (
                <p className={`text-sm ${useResult.ok ? 'text-emerald-600' : 'text-red-600'}`}>
                  {useResult.message}
                </p>
              )}
              <Button type="submit" disabled={isUsing} className="self-start">
                {isUsing ? 'Processing…' : 'Use Card'}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </AppLayout>
  )
}

export default VirtualCardDetails
