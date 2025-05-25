// components/InvoicePDF.tsx
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { InvoiceData } from '@/types/index'

const styles = StyleSheet.create({
  page: { padding: 30 },
  section: { marginBottom: 10 },
  logo: { width: 100, height: 100, marginBottom: 10 },
})

export function InvoicePDF({ data, logoPreview }: { data: InvoiceData, logoPreview: string | null }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {logoPreview && <Image src={logoPreview} style={styles.logo} />}
        <View style={styles.section}>
          <Text>Business: {data.businessName}</Text>
          <Text>Client: {data.clientName}</Text>
          <Text>GST No: {data.gstNumber}</Text>
          <Text>Date: {data.invoiceDate}</Text>
          <Text>Amount: ₹{data.amount}</Text>
        </View>
      </Page>
    </Document>
  )
}
