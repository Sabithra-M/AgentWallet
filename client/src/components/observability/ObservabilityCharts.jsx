import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import Card from '../common/Card.jsx'
import SectionHeader from '../common/SectionHeader.jsx'
import { STATUS_COLORS, RISK_COLORS, SEVERITY_COLORS, CATEGORICAL_PALETTE, PRIMARY } from '../../utils/chartColors.js'
import { capitalize } from '../../utils/capitalize.js'

function formatDay(value) {
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function ChartCard({ title, isEmpty, children }) {
  return (
    <Card>
      <SectionHeader title={title} />
      {isEmpty ? (
        <div className="flex h-64 items-center justify-center text-sm text-slate-400">No data for this range.</div>
      ) : (
        <div className="h-64">{children}</div>
      )}
    </Card>
  )
}

function ObservabilityCharts({ charts }) {
  const paymentsPerDay = charts.paymentsPerDay.map((row) => ({ ...row, label: formatDay(row.day) }))
  const approvedVsBlocked = charts.approvedVsBlocked.map((row) => ({ ...row, label: capitalize(row.status) }))
  const alertsBySeverity = charts.alertsBySeverity.map((row) => ({ ...row, label: capitalize(row.severity) }))
  const riskDistribution = charts.riskDistribution.map((row) => ({ ...row, label: capitalize(row.riskLevel) }))

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ChartCard title="Payments per Day" isEmpty={paymentsPerDay.length === 0}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={paymentsPerDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke={PRIMARY} strokeWidth={2} dot={{ r: 3 }} name="Payments" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Approved vs Blocked" isEmpty={approvedVsBlocked.length === 0}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={approvedVsBlocked} dataKey="count" nameKey="label" innerRadius={50} outerRadius={80}>
              {approvedVsBlocked.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? PRIMARY} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Alerts by Severity" isEmpty={alertsBySeverity.length === 0}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={alertsBySeverity} dataKey="count" nameKey="label" innerRadius={50} outerRadius={80}>
              {alertsBySeverity.map((entry) => (
                <Cell key={entry.severity} fill={SEVERITY_COLORS[entry.severity] ?? PRIMARY} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Risk Distribution" isEmpty={riskDistribution.length === 0}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={riskDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" name="Payment Requests" radius={[4, 4, 0, 0]}>
              {riskDistribution.map((entry) => (
                <Cell key={entry.riskLevel} fill={RISK_COLORS[entry.riskLevel] ?? PRIMARY} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Top Merchants" isEmpty={charts.topMerchants.length === 0}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={charts.topMerchants} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" name="Payments" radius={[0, 4, 4, 0]}>
              {charts.topMerchants.map((entry, index) => (
                <Cell key={entry.name} fill={CATEGORICAL_PALETTE[index % CATEGORICAL_PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Top Categories" isEmpty={charts.topCategories.length === 0}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={charts.topCategories} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="category" width={100} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" name="Payments" radius={[0, 4, 4, 0]}>
              {charts.topCategories.map((entry, index) => (
                <Cell key={entry.category} fill={CATEGORICAL_PALETTE[index % CATEGORICAL_PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Wallet Usage" isEmpty={charts.walletUsage.length === 0}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={charts.walletUsage}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value, name) => (name === 'spent' ? `₹${value.toLocaleString('en-IN')}` : value)} />
            <Legend />
            <Bar dataKey="requestCount" name="Requests" fill={PRIMARY} radius={[4, 4, 0, 0]} />
            <Bar dataKey="spent" name="Spent (₹)" fill={CATEGORICAL_PALETTE[1]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

export default ObservabilityCharts
