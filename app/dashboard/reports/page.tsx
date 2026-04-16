import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'

async function ReportsList() {
  const supabase = await createClient()
  const { data: reports } = await supabase
    .from('reports')
    .select('*, projects(title, client_name)')
    .order('created_at', { ascending: false })

  if (!reports || reports.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        Няма протоколи все още. Завърши проект за да създадеш протокол.
      </p>
    )
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-500',
    sent: 'bg-blue-50 text-blue-600',
    approved: 'bg-green-50 text-green-700',
  }

  const statusLabels: Record<string, string> = {
    draft: 'Чернова',
    sent: 'Изпратен',
    approved: 'Одобрен',
  }

  return (
    <div className="flex flex-col gap-2">
      {reports.map(report => (
        <a       
          key={report.id}
          href={`/dashboard/reports/${report.id}`}
          className="bg-white border rounded-lg px-4 py-3 hover:border-gray-400 transition-colors block"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{report.title}</span>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColors[report.status]}`}>
              {statusLabels[report.status]}
            </span>
          </div>
          {report.projects && (
            <p className="text-xs text-gray-400 mt-1">
              {report.projects.client_name} — {report.projects.title}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(report.created_at).toLocaleDateString('bg-BG')}
          </p>
        </a>
      ))}
    </div>
  )
}

export default function ReportsPage() {
  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium">Отчитане</h1>
      </div>
      <Suspense fallback={<p className="text-sm text-gray-400">Зарежда...</p>}>
        <ReportsList />
      </Suspense>
    </div>
  )
}