import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { OfferDetailClient } from './_components/offer-detail-client'

async function OfferDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: offer } = await supabase
    .from('offers')
    .select('*, offer_lines(*)')
    .eq('id', id)
    .single()

  if (!offer) notFound()

  return <OfferDetailClient offer={offer} />
}

export default function OfferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <div className="p-6 max-w-4xl">
      <Suspense fallback={<p className="text-sm text-gray-400">Зарежда...</p>}>
        <OfferDetail params={params} />
      </Suspense>
    </div>
  )
}