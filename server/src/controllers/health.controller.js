import { pool } from '../db/index.js'

export async function getHealth(req, res) {
  try {
    await pool.query('SELECT 1')
    res.status(200).json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Health check: database unreachable:', error)
    res.status(503).json({
      status: 'error',
      database: 'unreachable',
      timestamp: new Date().toISOString(),
    })
  }
}
