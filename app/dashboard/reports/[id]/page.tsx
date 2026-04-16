import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ReportDetailClient } from './_components/report-detail-client'

async function ReportDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: report } = await supabase
    .from('reports')
    .select('*, projects(id, title, client_name, project_steps(*))')
    .eq('id', id)
    .single()

  if (!report) notFound()

  return <ReportDetailClient report={report} />
}

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <div className="p-6 max-w-4xl">
      <Suspense fallback={<p className="text-sm text-gray-400">Зарежда...</p>}>
        <ReportDetail params={params} />
      </Suspense>
    </div>
  )
}