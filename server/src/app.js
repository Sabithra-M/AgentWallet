import express from 'express'
import cors from 'cors'
import healthRoutes from './routes/health.routes.js'
import usersRoutes from './routes/users.routes.js'
import merchantsRoutes from './routes/merchants.routes.js'
import walletsRoutes from './routes/wallets.routes.js'
import walletPoliciesRoutes from './routes/walletPolicies.routes.js'
import paymentRequestsRoutes from './routes/paymentRequests.routes.js'
import paymentApprovalsRoutes from './routes/paymentApprovals.routes.js'
import paymentTransactionsRoutes from './routes/paymentTransactions.routes.js'
import auditLogsRoutes from './routes/auditLogs.routes.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/health', healthRoutes)

app.use('/api/users', usersRoutes)
app.use('/api/merchants', merchantsRoutes)
app.use('/api/wallets', walletsRoutes)
app.use('/api/wallet-policies', walletPoliciesRoutes)
app.use('/api/payment-requests', paymentRequestsRoutes)
app.use('/api/payment-approvals', paymentApprovalsRoutes)
app.use('/api/payment-transactions', paymentTransactionsRoutes)
app.use('/api/audit-logs', auditLogsRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
