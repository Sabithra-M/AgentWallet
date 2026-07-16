import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from '../pages/Login.jsx'
import Spinner from '../components/common/Spinner.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'

const Signup = lazy(() => import('../pages/Signup.jsx'))
const ForgotPassword = lazy(() => import('../pages/ForgotPassword.jsx'))
const ResetPassword = lazy(() => import('../pages/ResetPassword.jsx'))
const Dashboard = lazy(() => import('../pages/Dashboard.jsx'))
const WalletDetails = lazy(() => import('../pages/WalletDetails.jsx'))
const AiAssistant = lazy(() => import('../pages/AiAssistant.jsx'))
const AiActivity = lazy(() => import('../pages/AiActivity.jsx'))
const Transactions = lazy(() => import('../pages/Transactions.jsx'))
const Approvals = lazy(() => import('../pages/Approvals.jsx'))
const PaymentRequest = lazy(() => import('../pages/PaymentRequest.jsx'))
const PaymentRequests = lazy(() => import('../pages/PaymentRequests.jsx'))
const PaymentDetails = lazy(() => import('../pages/PaymentDetails.jsx'))
const VirtualCardDetails = lazy(() => import('../pages/VirtualCardDetails.jsx'))
const Observability = lazy(() => import('../pages/Observability.jsx'))
const Settings = lazy(() => import('../pages/Settings.jsx'))

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Spinner size={24} className="text-indigo-500" />
    </div>
  )
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallets/:walletId"
          element={
            <ProtectedRoute>
              <WalletDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-assistant"
          element={
            <ProtectedRoute>
              <AiAssistant />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-activity"
          element={
            <ProtectedRoute>
              <AiActivity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/approvals"
          element={
            <ProtectedRoute>
              <Approvals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-request"
          element={
            <ProtectedRoute>
              <PaymentRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-requests"
          element={
            <ProtectedRoute>
              <PaymentRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-requests/:id"
          element={
            <ProtectedRoute>
              <PaymentDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/virtual-cards/:id"
          element={
            <ProtectedRoute>
              <VirtualCardDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/observability"
          element={
            <ProtectedRoute>
              <Observability />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
