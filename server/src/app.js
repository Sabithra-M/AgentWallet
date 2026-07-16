import express from 'express'
import cors from 'cors'
import healthRoutes from './routes/health.routes.js'
import authRoutes from './routes/auth.routes.js'
import usersRoutes from './routes/users.routes.js'
import merchantsRoutes from './routes/merchants.routes.js'
import walletsRoutes from './routes/wallets.routes.js'
import walletPoliciesRoutes from './routes/walletPolicies.routes.js'
import aiWalletPoliciesRoutes from './routes/aiWalletPolicies.routes.js'
import paymentRequestsRoutes from './routes/paymentRequests.routes.js'
import paymentApprovalsRoutes from './routes/paymentApprovals.routes.js'
import paymentTransactionsRoutes from './routes/paymentTransactions.routes.js'
import auditLogsRoutes from './routes/auditLogs.routes.js'
import notificationsRoutes from './routes/notifications.routes.js'
import conversationsRoutes from './routes/conversations.routes.js'
import alertsRoutes from './routes/alerts.routes.js'
import virtualCardsRoutes from './routes/virtualCards.routes.js'
import analyticsRoutes from './routes/analytics.routes.js'
import { authenticate } from './middleware/authenticate.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'

const app = express()

// Content-Disposition isn't on the browser's default CORS-safelisted response
// headers — without this, the frontend can't read the export filename back out.
app.use(cors({ exposedHeaders: ['Content-Disposition'] }))
app.use(express.json())

app.use('/health', healthRoutes)

app.use('/api/auth', authRoutes)
app.use('/api/users', authenticate, usersRoutes)
app.use('/api/merchants', authenticate, merchantsRoutes)
app.use('/api/wallets', authenticate, walletsRoutes)
app.use('/api/wallet-policies', authenticate, walletPoliciesRoutes)
app.use('/api/ai-wallet-policies', authenticate, aiWalletPoliciesRoutes)
app.use('/api/payment-requests', authenticate, paymentRequestsRoutes)
app.use('/api/payment-approvals', authenticate, paymentApprovalsRoutes)
app.use('/api/payment-transactions', authenticate, paymentTransactionsRoutes)
app.use('/api/audit-logs', authenticate, auditLogsRoutes)
app.use('/api/notifications', authenticate, notificationsRoutes)
app.use('/api/conversations', authenticate, conversationsRoutes)
app.use('/api/alerts', authenticate, alertsRoutes)
app.use('/api/virtual-cards', authenticate, virtualCardsRoutes)
app.use('/api/analytics', authenticate, analyticsRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
