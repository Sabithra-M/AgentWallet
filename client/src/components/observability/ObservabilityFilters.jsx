import FilterSelect from '../common/FilterSelect.jsx'
import Input from '../common/Input.jsx'

const RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: 'custom', label: 'Custom Range' },
]

function ObservabilityFilters({ filters, onChange, wallets, merchants }) {
  function update(patch) {
    onChange({ ...filters, ...patch })
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <FilterSelect
        aria-label="Date range"
        value={filters.range}
        onChange={(event) => update({ range: event.target.value })}
      >
        {RANGE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </FilterSelect>

      {filters.range === 'custom' && (
        <>
          <Input
            aria-label="From date"
            type="date"
            className="sm:w-40"
            value={filters.customFrom}
            onChange={(event) => update({ customFrom: event.target.value })}
          />
          <Input
            aria-label="To date"
            type="date"
            className="sm:w-40"
            value={filters.customTo}
            onChange={(event) => update({ customTo: event.target.value })}
          />
        </>
      )}

      <FilterSelect
        aria-label="Filter by wallet"
        value={filters.walletId}
        onChange={(event) => update({ walletId: event.target.value })}
      >
        <option value="">All Wallets</option>
        {wallets.map((wallet) => (
          <option key={wallet.id} value={wallet.id}>
            {wallet.name}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect
        aria-label="Filter by merchant"
        value={filters.merchantId}
        onChange={(event) => update({ merchantId: event.target.value })}
      >
        <option value="">All Merchants</option>
        {merchants.map((merchant) => (
          <option key={merchant.id} value={merchant.id}>
            {merchant.name}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect
        aria-label="Filter by status"
        value={filters.status}
        onChange={(event) => update({ status: event.target.value })}
      >
        <option value="">All Statuses</option>
        <option value="approved">Approved</option>
        <option value="blocked">Blocked</option>
        <option value="pending">Pending</option>
        <option value="rejected">Rejected</option>
      </FilterSelect>

      <FilterSelect
        aria-label="Filter by risk level"
        value={filters.riskLevel}
        onChange={(event) => update({ riskLevel: event.target.value })}
      >
        <option value="">All Risk Levels</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </FilterSelect>
    </div>
  )
}

export default ObservabilityFilters
