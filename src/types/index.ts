export type InvoiceData = {
  businessName: string
  clientName: string
  gstNumber: string
  invoiceDate: string
  items: InvoiceItem[]
  logo?: FileList
}

export type InvoiceItem = {
  description: string
  quantity: number
  rate: number
  gstRate: number // e.g., 18 means 18%
}