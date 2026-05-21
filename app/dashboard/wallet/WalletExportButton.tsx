'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2, FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'

interface WalletExportButtonProps {
  sales: any[]
  payouts: any[]
  totalEarnings: number
  availableBalance: number
}

function toCSV(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const val = String(cell ?? '')
          // Wrap in quotes if it contains comma, quote, or newline
          return val.includes(',') || val.includes('"') || val.includes('\n')
            ? `"${val.replace(/"/g, '""')}"`
            : val
        })
        .join(',')
    )
    .join('\n')
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function WalletExportButton({
  sales,
  payouts,
  totalEarnings,
  availableBalance,
}: WalletExportButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const exportDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })

      // ── Sheet 1: Summary ──────────────────────────────────────────────
      const summaryRows: string[][] = [
        ['ASSETRA EARNINGS REPORT'],
        [`Generated: ${exportDate}`],
        [],
        ['SUMMARY'],
        ['Metric', 'Value'],
        ['Total Earnings', `$${totalEarnings.toFixed(2)}`],
        ['Available Balance', `$${availableBalance.toFixed(2)}`],
        ['Total Sales', `${sales.length}`],
        ['Total Payouts', `${payouts.length}`],
        [],
      ]

      // ── Sheet 2: Sales Transactions ───────────────────────────────────
      const salesHeader = ['#', 'Date', 'Time', 'Product', 'Buyer', 'Amount (USD)']
      const salesRows: string[][] = sales.map((sale, i) => {
        const date = new Date(sale.created_at)
        
        const productTitle = Array.isArray(sale.products) ? sale.products[0]?.title : sale.products?.title
        const buyerName = Array.isArray(sale.profiles) ? sale.profiles[0]?.full_name : sale.profiles?.full_name

        return [
          String(i + 1),
          date.toLocaleDateString('en-GB'),
          date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          productTitle || 'Unknown Product',
          buyerName || 'Anonymous Buyer',
          Number(sale.amount).toFixed(2),
        ]
      })

      const salesSection: string[][] = [
        ['SALES TRANSACTIONS'],
        salesHeader,
        ...salesRows,
        [],
        ['', '', '', '', 'TOTAL:', totalEarnings.toFixed(2)],
        [],
      ]

      // ── Sheet 3: Payout History ───────────────────────────────────────
      const payoutHeader = ['#', 'Date', 'Amount (USD)', 'Method', 'Status']
      const payoutRows: string[][] = payouts.map((payout, i) => {
        const date = new Date(payout.created_at)
        return [
          String(i + 1),
          date.toLocaleDateString('en-GB'),
          Number(payout.amount).toFixed(2),
          payout.payment_method || 'N/A',
          payout.status.toUpperCase(),
        ]
      })

      const payoutSection: string[][] = [
        ['PAYOUT HISTORY'],
        payoutHeader,
        ...payoutRows,
      ]

      // Combine all sections
      const allRows = [...summaryRows, ...salesSection, ...payoutSection]
      const csvContent = toCSV(allRows)

      const filename = `assetra-earnings-${new Date().toISOString().split('T')[0]}.csv`
      downloadCSV(csvContent, filename)

      toast.success(`Report exported: ${filename}`, {
        description: `${sales.length} sales & ${payouts.length} payouts included.`,
      })
    } catch (err) {
      console.error('Export error:', err)
      toast.error('Export failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={loading || sales.length === 0}
      variant="outline"
      className="h-11 px-5 rounded-2xl gap-2.5 font-bold border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <FileSpreadsheet className="h-4 w-4 text-green-600" />
          Export CSV
        </>
      )}
    </Button>
  )
}
