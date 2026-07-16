import Badge from '../common/Badge.jsx'
import { formatDateTime } from '../../utils/formatDateTime.js'

function PolicySummary({ policy }) {
  if (!policy) {
    return <p className="text-xs text-slate-400">No policy configured yet.</p>
  }

  return (
    <div className="flex flex-col gap-1.5 text-xs text-slate-500">
      <div className="flex items-center justify-between">
        <span className="font-medium text-slate-600">Policy Status</span>
        <Badge status={policy.isEnabled ? 'Enabled' : 'Disabled'} />
      </div>
      <div className="flex items-center justify-between">
        <span>Last Updated</span>
        <span className="text-slate-600">{formatDateTime(policy.updatedAt)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span>Allowed Merchants</span>
        <span className="text-slate-600">{policy.allowedMerchantIds.length}</span>
      </div>
      <div className="flex items-center justify-between">
        <span>Blocked Categories</span>
        <span className="text-slate-600">{policy.blockedCategories.length}</span>
      </div>
    </div>
  )
}

export default PolicySummary
