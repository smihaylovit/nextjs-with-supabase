import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'

async function OffersList() {
  const supabase = await createClient()
  const { data: offers } = await supabase
    .from('offers')
    .select('*')
    .order('created_at', { ascending: false })

  if (!offers || offers.length === 0) {
    return <p className="text-sm text-gray-400">Няма оферти все още.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {offers.map((offer) => (
        <a key={offer.id} href={`/dashboard/offers/${offer.id}`} className="bg-white border rounded-lg px-4 py-3 hover:border-gray-400 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{offer.title}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500">
              {offer.status}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{offer.client_name}</p>
        </a>
      ))}
    </div>
  )
}

export default function OffersPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium">Оферти</h1>
        <a href="/dashboard/offers/new" className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          + Нова оферта
        </a>
      </div>
      <Suspense fallback={<p className="text-sm text-gray-400">Зарежда...</p>}>
        <OffersList />
      </Suspense>
    </div>
  )
}