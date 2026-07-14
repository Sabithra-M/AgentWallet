import { Routes, Route } from 'react-router-dom'
import Login from '../pages/Login.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import Wallets from '../pages/Wallets.jsx'
import CreateWallet from '../pages/CreateWallet.jsx'
import WalletDetails from '../pages/WalletDetails.jsx'
import AiAssistant from '../pages/AiAssistant.jsx'
import Transactions from '../pages/Transactions.jsx'
import Approvals from '../pages/Approvals.jsx'
import PaymentRequest from '../pages/PaymentRequest.jsx'
import Settings from '../pages/Settings.jsx'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/wallets" element={<Wallets />} />
      <Route path="/wallets/new" element={<CreateWallet />} />
      <Route path="/wallets/:walletId" element={<WalletDetails />} />
      <Route path="/ai-assistant" element={<AiAssistant />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/approvals" element={<Approvals />} />
      <Route path="/payment-request" element={<PaymentRequest />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}

export default AppRoutes
