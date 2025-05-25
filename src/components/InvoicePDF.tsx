import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { InvoiceData, InvoiceItem } from '@/types/index'

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12 },
  section: { marginBottom: 10 },
  logo: { width: 100, height: 100, marginBottom: 10 },
  table: { display: 'table', width: 'auto', marginVertical: 10 },
  row: { flexDirection: 'row' },
  headerCell: { fontWeight: 'bold', padding: 5, borderBottom: '1 solid black' },
  cell: { padding: 5, flex: 1, borderBottom: '0.5 solid gray' },
  cellRight: {
    padding: 5,
    flex: 1,
    borderBottom: '0.5 solid gray',
    textAlign: 'right'
  },
  totals: { marginTop: 10 }
})

function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
}

function calculateRowTotals(item: InvoiceItem) {
  const quantity = Number(item.quantity) || 0
  const rate = Number(item.rate) || 0
  const gstRate = Number(item.gstRate) || 0

  const baseAmount = quantity * rate
  const gstAmount = (baseAmount * gstRate) / 100
  const cgst = gstAmount / 2
  const sgst = gstAmount / 2

  return { baseAmount, cgst, sgst, total: baseAmount + gstAmount }
}

export function InvoicePDF({ data, logoPreview }: { data: InvoiceData; logoPreview: string | null }) {
  const totals = data.items.map(calculateRowTotals)

  const subtotal = totals.reduce((sum, row) => sum + row.baseAmount, 0)
  const totalCgst = totals.reduce((sum, row) => sum + row.cgst, 0)
  const totalSgst = totals.reduce((sum, row) => sum + row.sgst, 0)
  const grandTotal = totals.reduce((sum, row) => sum + row.total, 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {logoPreview && <Image src={logoPreview} style={styles.logo} />}

        <View style={styles.section}>
          <Text>Business: {data.businessName}</Text>
          <Text>Client: {data.clientName}</Text>
          <Text>GST No: {data.gstNumber}</Text>
          <Text>Date: {data.invoiceDate}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={[styles.cell, styles.headerCell]}>Description</Text>
            <Text style={[styles.cell, styles.headerCell]}>Qty</Text>
            <Text style={[styles.cellRight, styles.headerCell]}>Rate</Text>
            <Text style={[styles.cellRight, styles.headerCell]}>GST %</Text>
            <Text style={[styles.cellRight, styles.headerCell]}>Total</Text>
          </View>
          {data.items.map((item, idx) => {
            const row = calculateRowTotals(item)
            return (
              <View style={styles.row} key={idx}>
                <Text style={styles.cell}>{item.description}</Text>
                <Text style={styles.cell}>{item.quantity}</Text>
                <Text style={styles.cellRight}>{formatCurrency(Number(item.rate) || 0)}</Text>
                <Text style={styles.cellRight}>{Number(item.gstRate) || 0}%</Text>
                <Text style={styles.cellRight}>{formatCurrency(row.total)}</Text>
              </View>
            )
          })}
        </View>

        <View style={styles.totals}>
          <Text>Subtotal: {formatCurrency(subtotal)}</Text>
          <Text>CGST: {formatCurrency(totalCgst)}</Text>
          <Text>SGST: {formatCurrency(totalSgst)}</Text>
          <Text style={{ fontWeight: 'bold' }}>Grand Total: {formatCurrency(grandTotal)}</Text>
        </View>
      </Page>
    </Document>
  )
}
