import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Wallet, Receipt, Bell, CreditCard, ScrollText, MessageSquare, X } from 'lucide-react'
import * as walletService from '../../services/walletService.js'
import * as merchantService from '../../services/merchantService.js'
import * as paymentRequestService from '../../services/paymentRequestService.js'
import * as alertService from '../../services/alertService.js'
import * as virtualCardService from '../../services/virtualCardService.js'
import * as auditLogService from '../../services/auditLogService.js'
import * as conversationService from '../../services/conversationService.js'
import { formatCurrency } from '../../utils/formatCurrency.js'
import Spinner from '../common/Spinner.jsx'
import { useEscapeKey } from '../../hooks/useEscapeKey.js'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'

const GROUP_META = {
  wallets: { label: 'Wallets', icon: Wallet },
  payments: { label: 'Payment Requests', icon: Receipt },
  alerts: { label: 'Alerts', icon: Bell },
  cards: { label: 'Virtual Cards', icon: CreditCard },
  auditLogs: { label: 'Audit Logs', icon: ScrollText },
  conversations: { label: 'Conversations', icon: MessageSquare },
}

const MAX_PER_GROUP = 5

function matches(text, query) {
  return typeof text === 'string' && text.toLowerCase().includes(query)
}

function SearchPalette({ isOpen, onClose }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const dialogRef = useRef(null)
  const [query, setQuery] = useState('')
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!isOpen) return
    setQuery('')
    setActiveIndex(0)
    setIsLoading(true)
    Promise.all([
      walletService.getWallets(),
      merchantService.getMerchants(),
      paymentRequestService.getPaymentRequests(),
      alertService.getAlerts(),
      virtualCardService.getVirtualCards(),
      auditLogService.getAuditLogs(),
      conversationService.getConversations({ limit: 50 }),
    ])
      .then(([wallets, merchants, payments, alerts, cards, auditLogs, conversationsResult]) => {
        setData({ wallets, merchants, payments, alerts, cards, auditLogs, conversations: conversationsResult.conversations })
      })
      .catch(() => setData({ wallets: [], merchants: [], payments: [], alerts: [], cards: [], auditLogs: [], conversations: [] }))
      .finally(() => setIsLoading(false))
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      const id = requestAnimationFrame(() => inputRef.current?.focus())
      return () => cancelAnimationFrame(id)
    }
  }, [isOpen])

  useEscapeKey(isOpen, onClose)
  useFocusTrap(dialogRef, isOpen)

  const groups = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    const merchantNameById = data.merchants.reduce((map, m) => ({ ...map, [m.id]: m.name }), {})
    const walletNameById = data.wallets.reduce((map, w) => ({ ...map, [w.id]: w.name }), {})

    function limit(items) {
      return q ? items.slice(0, MAX_PER_GROUP * 2) : items.slice(0, MAX_PER_GROUP)
    }

    const wallets = limit(
      data.wallets.filter((w) => !q || matches(w.name, q) || matches(w.description, q)).map((w) => ({
        id: w.id,
        title: w.name,
        subtitle: `${w.category === 'ai' ? 'AI Wallet' : 'Main Wallet'} · ${formatCurrency(w.balance)}`,
        onSelect: () => navigate(w.isMain ? '/dashboard' : `/wallets/${w.id}`),
      })),
    )

    const payments = limit(
      data.payments
        .filter((p) => !q || matches(merchantNameById[p.merchantId], q) || matches(p.category, q) || matches(p.status, q))
        .map((p) => ({
          id: p.id,
          title: merchantNameById[p.merchantId] ?? 'Unknown Merchant',
          subtitle: `${formatCurrency(p.amount)} · ${p.status}`,
          onSelect: () => navigate(`/payment-requests/${p.id}`),
        })),
    )

    const alerts = limit(
      data.alerts.filter((a) => !q || matches(a.title, q) || matches(a.message, q)).map((a) => ({
        id: a.id,
        title: a.title,
        subtitle: a.message,
        onSelect: () => navigate('/dashboard'),
      })),
    )

    const cards = limit(
      data.cards
        .filter((c) => !q || matches(merchantNameById[c.merchantId], q) || matches(walletNameById[c.walletId], q))
        .map((c) => ({
          id: c.id,
          title: `•••• ${c.cardNumber.slice(-4)}`,
          subtitle: `${merchantNameById[c.merchantId] ?? 'Unknown Merchant'} · ${c.status}`,
          onSelect: () => navigate(`/virtual-cards/${c.id}`),
        })),
    )

    const auditLogs = limit(
      data.auditLogs.filter((log) => !q || matches(log.action, q)).map((log) => ({
        id: log.id,
        title: log.action,
        subtitle: new Date(log.createdAt).toLocaleString('en-GB'),
        onSelect: () => navigate('/dashboard'),
      })),
    )

    const conversations = limit(
      data.conversations.filter((c) => !q || matches(c.title, q) || matches(c.lastMessagePreview, q)).map((c) => ({
        id: c.id,
        title: c.title,
        subtitle: c.lastMessagePreview || 'No messages yet',
        onSelect: () => navigate(`/ai-assistant?conversation=${c.id}`),
      })),
    )

    return [
      { key: 'wallets', items: wallets },
      { key: 'payments', items: payments },
      { key: 'cards', items: cards },
      { key: 'alerts', items: alerts },
      { key: 'auditLogs', items: auditLogs },
      { key: 'conversations', items: conversations },
    ].filter((group) => group.items.length > 0)
  }, [data, query, navigate])

  const flatItems = useMemo(() => groups.flatMap((g) => g.items), [groups])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const item = flatItems[activeIndex]
      if (item) {
        item.onSelect()
        onClose()
      }
    } else if (event.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  let runningIndex = -1

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 pt-[12vh]" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
          <Search size={18} className="shrink-0 text-slate-400" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="search-palette-results"
            aria-activedescendant={flatItems[activeIndex] ? `search-result-${flatItems[activeIndex].id}` : undefined}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search wallets, payments, alerts, cards, audit logs, conversations…"
            aria-label="Search"
            className="flex-1 border-none text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
          {isLoading && <Spinner size={16} className="text-slate-400" />}
          <button
            type="button"
            aria-label="Close search"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>

        <div id="search-palette-results" role="listbox" aria-label="Search results" className="max-h-[60vh] overflow-y-auto p-2">
          {isLoading ? (
            <p className="py-10 text-center text-sm text-slate-400">Loading…</p>
          ) : flatItems.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              {query ? 'No results found.' : 'Start typing to search.'}
            </p>
          ) : (
            groups.map((group) => {
              const Meta = GROUP_META[group.key]
              return (
                <div key={group.key} className="mb-2">
                  <p className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {Meta.label}
                  </p>
                  {group.items.map((item) => {
                    runningIndex += 1
                    const index = runningIndex
                    const isActive = index === activeIndex
                    return (
                      <button
                        id={`search-result-${item.id}`}
                        key={item.id}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => {
                          item.onSelect()
                          onClose()
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors ${
                          isActive ? 'bg-indigo-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <Meta.icon size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-800">{item.title}</p>
                          <p className="truncate text-xs text-slate-500">{item.subtitle}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchPalette
