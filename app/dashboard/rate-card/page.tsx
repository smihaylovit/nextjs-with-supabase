import { Suspense } from 'react'
import { ServicesTable } from './_components/services-table'

export default function RateCardPage() {
  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-lg font-medium mb-6">Rate card</h1>
      <Suspense fallback={<p className="text-sm text-gray-400">Зарежда...</p>}>
        <ServicesTable />
      </Suspense>
    </div>
  )
}