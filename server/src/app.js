import express from 'express'
import cors from 'cors'
import healthRoutes from './routes/health.routes.js'
import authRoutes from './routes/auth.routes.js'
import usersRoutes from './routes/users.routes.js'
import merchantsRoutes from './routes/merchants.routes.js'
import walletsRoutes from './routes/wallets.routes.js'
import walletPoliciesRoutes from './routes/walletPolicies.routes.js'
import paymentRequestsRoutes from './routes/paymentRequests.routes.js'
import paymentApprovalsRoutes from './routes/paymentApprovals.routes.js'
import paymentTransactionsRoutes from './routes/paymentTransactions.routes.js'
import auditLogsRoutes from './routes/auditLogs.routes.js'
import { authenticate } from './middleware/authenticate.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/health', healthRoutes)

app.use('/api/auth', authRoutes)
app.use('/api/users', authenticate, usersRoutes)
app.use('/api/merchants', authenticate, merchantsRoutes)
app.use('/api/wallets', authenticate, walletsRoutes)
app.use('/api/wallet-policies', authenticate, walletPoliciesRoutes)
app.use('/api/payment-requests', authenticate, paymentRequestsRoutes)
app.use('/api/payment-approvals', authenticate, paymentApprovalsRoutes)
app.use('/api/payment-transactions', authenticate, paymentTransactionsRoutes)
app.use('/api/audit-logs', authenticate, auditLogsRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
