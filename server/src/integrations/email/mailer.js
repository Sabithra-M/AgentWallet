import nodemailer from 'nodemailer'
import { env } from '../../config/env.js'

let transporter = null

function getTransporter() {
  if (transporter) return transporter

  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) {
    const error = new Error(
      'Email is not configured (SMTP_HOST / SMTP_USER / SMTP_PASS). Emails cannot be sent.',
    )
    error.status = 500
    throw error
  }

  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  })

  return transporter
}

export async function sendMail({ to, subject, text, html }) {
  const info = await getTransporter().sendMail({ from: env.smtp.from, to, subject, text, html })
  return { delivered: true, messageId: info.messageId }
}
