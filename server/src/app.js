import express from 'express'
import cors from 'cors'
import healthRoutes from './routes/health.routes.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/health', healthRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
