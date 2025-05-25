import { useForm } from 'react-hook-form'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { pdf, PDFDownloadLink } from '@react-pdf/renderer'
import { InvoicePDF } from '@/components/InvoicePDF'
import { InvoiceData } from '@/types/index'

async function uploadPDF(blob: Blob): Promise<string | null> {
  const fileName = `invoice-${Date.now()}.pdf`
  const { data, error } = await supabase.storage
    .from('invoices') // You must create this bucket in Supabase dashboard
    .upload(fileName, blob, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (error) {
    console.error('Upload failed:', error.message)
    return null
  }

  const { data: publicUrl } = supabase.storage
    .from('invoices')
    .getPublicUrl(fileName)

  return publicUrl?.publicUrl || null
}

export default function InvoiceForm() {
  const { register, handleSubmit } = useForm<InvoiceData>()
  const { user, loading } = useAuth()
  const router = useRouter()

  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)
  const [generated, setGenerated] = useState(false)
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading])

  const onSubmit = async (data: InvoiceData) => {
    setInvoiceData(data)
    setGenerated(true)
    console.log('Invoice Data:', data)
  
    const blob = await pdf(<InvoicePDF data={data} logoPreview={logoPreview} />).toBlob()
    console.log('PDF Blob created:', blob)
  
    const publicUrl = await uploadPDF(blob)
    console.log('Public URL:', publicUrl)
  
    if (publicUrl) {
      const link = `https://wa.me/?text=${encodeURIComponent(`Here is your invoice: ${publicUrl}`)}`
      console.log('WhatsApp Link:', link)
      setWhatsappLink(link)
      setGenerated(true)
    }
  }
  
   

  if (loading) return <p className="text-center mt-10">Loading...</p>
  if (!user) return null

  console.log('generated:', generated)
  console.log('invoiceData:', invoiceData)
  console.log('whatsappLink:', whatsappLink)

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 border rounded shadow space-y-4">
      <h2 className="text-2xl font-semibold text-center">Create Invoice</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('businessName')} placeholder="Your Business Name" className="w-full p-2 border rounded" required />
        <input {...register('clientName')} placeholder="Client Name" className="w-full p-2 border rounded" required />
        <input {...register('gstNumber')} placeholder="GST Number" className="w-full p-2 border rounded" required />
        <input type="date" {...register('invoiceDate')} className="w-full p-2 border rounded" required />
        <input type="number" {...register('amount')} placeholder="Amount" className="w-full p-2 border rounded" required />
        <input
          type="file"
          accept="image/*"
          className="w-full"
          {...register('logo')}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              const reader = new FileReader()
              reader.onloadend = () => {
                setLogoPreview(reader.result as string)
              }
              reader.readAsDataURL(file)
            }
          }}
        />
        {logoPreview && (
          <img src={logoPreview} alt="Logo Preview" className="w-32 h-32 object-contain border rounded mx-auto" />
        )}


        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Generate Invoice</button>
      </form>

      <button
        className="text-red-500 underline mt-4"
        onClick={async () => {
          await supabase.auth.signOut()
          router.push('/')
        }}
      >
        Logout
      </button>

      {generated && invoiceData && (
        <PDFDownloadLink
          document={<InvoicePDF data={invoiceData} logoPreview={logoPreview} />}
          fileName="invoice.pdf"
          className="block text-center bg-green-600 text-white p-2 rounded mt-4"
        >
          {({ loading }) => (loading ? 'Preparing PDF...' : 'Download Invoice')}
        </PDFDownloadLink>
      )}

      {whatsappLink && (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center bg-green-500 text-white p-2 rounded mt-4"
        >
          Share via WhatsApp
        </a>
      )}

    </div>
  )
}
