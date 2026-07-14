import app from './app.js'
import { env } from './config/env.js'
import { testConnection } from './db/index.js'

async function start() {
  try {
    await testConnection()
    console.log('PostgreSQL connection established')
  } catch (error) {
    console.error('PostgreSQL connection failed:', error.message)
  }

  app.listen(env.port, () => {
    console.log(`AgentWallet server running on port ${env.port}`)
  })
}

start()
