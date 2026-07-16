import ExcelJS from 'exceljs'
import PDFDocument from 'pdfkit'

const COLUMNS = [
  { header: 'Date', key: 'created_at', width: 22 },
  { header: 'Merchant', key: 'merchant_name', width: 24 },
  { header: 'Wallet', key: 'wallet_name', width: 20 },
  { header: 'Category', key: 'category', width: 16 },
  { header: 'Amount', key: 'amount', width: 12 },
  { header: 'Currency', key: 'currency', width: 10 },
  { header: 'Status', key: 'status', width: 12 },
  { header: 'Risk Level', key: 'risk_level', width: 12 },
  { header: 'Risk Score', key: 'risk_score', width: 12 },
  { header: 'Block Reason', key: 'block_reason', width: 30 },
]

function rowValues(row) {
  return COLUMNS.map((column) => {
    const value = row[column.key]
    if (column.key === 'created_at' && value) return new Date(value).toISOString()
    return value ?? ''
  })
}

function csvEscape(value) {
  const text = String(value)
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

export function toCsv(rows) {
  const lines = [COLUMNS.map((c) => c.header).join(',')]
  for (const row of rows) {
    lines.push(rowValues(row).map(csvEscape).join(','))
  }
  return lines.join('\n')
}

export async function toXlsx(rows) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Payment Requests')
  sheet.columns = COLUMNS
  for (const row of rows) {
    sheet.addRow(COLUMNS.reduce((acc, column) => ({ ...acc, [column.key]: row[column.key] ?? '' }), {}))
  }
  sheet.getRow(1).font = { bold: true }
  return workbook.xlsx.writeBuffer()
}

export function toPdf(rows) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' })
    const chunks = []
    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    doc.fontSize(16).text('Payment Requests Report', { align: 'left' })
    doc.fontSize(9).fillColor('#666').text(`Generated ${new Date().toLocaleString()} — ${rows.length} rows`)
    doc.moveDown(1)

    const headers = ['Date', 'Merchant', 'Wallet', 'Amount', 'Status', 'Risk']
    const colWidths = [90, 130, 110, 70, 70, 60]
    let y = doc.y
    doc.fontSize(9).fillColor('#000')
    headers.forEach((header, i) => {
      doc.text(header, doc.x + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y, { width: colWidths[i] })
    })
    y += 16
    doc
      .moveTo(30, y)
      .lineTo(30 + colWidths.reduce((a, b) => a + b, 0), y)
      .stroke()
    y += 4

    for (const row of rows) {
      if (y > 520) {
        doc.addPage()
        y = 40
      }
      const values = [
        row.created_at ? new Date(row.created_at).toLocaleString() : '',
        row.merchant_name ?? '',
        row.wallet_name ?? '',
        `${row.currency ?? 'INR'} ${row.amount ?? ''}`,
        row.status ?? '',
        row.risk_level ?? '',
      ]
      values.forEach((value, i) => {
        doc.text(String(value), 30 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y, { width: colWidths[i] })
      })
      y += 16
    }

    doc.end()
  })
}
