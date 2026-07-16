import * as analyticsService from '../services/analytics.service.js'
import * as paymentExportService from '../services/paymentExport.service.js'

export async function getSummary(req, res, next) {
  try {
    const summary = await analyticsService.getSummary(req.user.id, req.query)
    res.status(200).json(summary)
  } catch (error) {
    next(error)
  }
}

export async function getCharts(req, res, next) {
  try {
    const charts = await analyticsService.getCharts(req.user.id, req.query)
    res.status(200).json(charts)
  } catch (error) {
    next(error)
  }
}

export async function exportPayments(req, res, next) {
  try {
    const format = typeof req.query.format === 'string' ? req.query.format.toLowerCase() : 'csv'
    const rows = await analyticsService.getExportRows(req.user.id, req.query)
    const filename = `payment-requests-${new Date().toISOString().slice(0, 10)}`

    if (format === 'xlsx') {
      const buffer = await paymentExportService.toXlsx(rows)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`)
      return res.status(200).send(buffer)
    }

    if (format === 'pdf') {
      const buffer = await paymentExportService.toPdf(rows)
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`)
      return res.status(200).send(buffer)
    }

    const csv = paymentExportService.toCsv(rows)
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`)
    res.status(200).send(csv)
  } catch (error) {
    next(error)
  }
}
