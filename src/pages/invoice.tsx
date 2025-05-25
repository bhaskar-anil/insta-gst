import { useForm } from 'react-hook-form'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type InvoiceData = {
  businessName: string
  clientName: string
  gstNumber: string
  invoiceDate: string
  amount: number
  logo?: FileList
}

export default function InvoiceForm() {
  const { register, handleSubmit } = useForm<InvoiceData>()
  const { user, loading } = useAuth()
  const router = useRouter()

  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading])

  const onSubmit = (data: InvoiceData) => {
    console.log('Invoice Data:', data)
  }

  if (loading) return <p className="text-center mt-10">Loading...</p>
  if (!user) return null

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

    </div>
  )
}
