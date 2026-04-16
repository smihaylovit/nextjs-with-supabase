'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Step = {
  id: string
  title: string
  completed_at: string | null
  sort_order: number
}

type Report = {
  id: string
  title: string
  status: string
  step_ids: string[] | null
  created_at: string
  projects: {
    id: string
    title: string
    client_name: string
    project_steps: Step[]
  } | null
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

export function ReportDetailClient({ report }: { report: Report }) {
  const router = useRouter()
  const supabase = createClient()

  const allSteps = report.projects?.project_steps ?? []
  const completedSteps = allSteps.filter(s => s.completed_at)

  const [selectedIds, setSelectedIds] = useState<string[]>(
    report.step_ids ?? completedSteps.map(s => s.id)
  )
  const [status, setStatus] = useState(report.status)
  const [saving, setSaving] = useState(false)

  function toggleStep(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  async function handleSave(newStatus: string) {
    setSaving(true)
    await supabase
      .from('reports')
      .update({ step_ids: selectedIds, status: newStatus })
      .eq('id', report.id)
    setStatus(newStatus)
    setSaving(false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.push('/dashboard/reports')}
            className="text-sm text-gray-400 hover:text-gray-600 mb-2 block"
          >
            ← Назад към протоколи
          </button>
          <h1 className="text-lg font-medium">{report.title}</h1>
          {report.projects && (
            <p className="text-sm text-gray-400 mt-0.5">
              {report.projects.client_name} — {report.projects.title}
            </p>
          )}
        </div>
        <span className={`text-xs px-2 py-1 rounded font-medium ${statusColors[status]}`}>
          {statusLabels[status]}
        </span>
      </div>

      {/* Стъпки за включване */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">
            Завършени стъпки за включване в протокола
          </span>
          <span className="text-xs text-gray-400">
            {selectedIds.length} избрани
          </span>
        </div>
        <ul>
          {completedSteps.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-gray-400">
              Няма завършени стъпки в този проект.
            </li>
          )}
          {completedSteps
            .sort((a, b) => a.sort_order - b.sort_order)
            .map(step => (
              <li
                key={step.id}
                onClick={() => toggleStep(step.id)}
                className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50"
              >
                <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                  selectedIds.includes(step.id)
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'border-gray-300'
                }`}>
                  {selectedIds.includes(step.id) && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
                <span className="text-sm flex-1">{step.title}</span>
                <span className="text-xs text-gray-400">
                  {step.completed_at && new Date(step.completed_at).toLocaleDateString('bg-BG')}
                </span>
              </li>
            ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="bg-white border rounded-lg p-4 flex gap-3 flex-wrap">
        <button
          onClick={() => handleSave('draft')}
          disabled={saving}
          className="text-sm px-3 py-1.5 border rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Запази чернова
        </button>
        {status !== 'approved' && (
          <button
            onClick={() => handleSave('sent')}
            disabled={saving || selectedIds.length === 0}
            className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Маркирай като изпратен
          </button>
        )}
        {status === 'sent' && (
          <button
            onClick={() => handleSave('approved')}
            disabled={saving}
            className="text-sm px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            ✓ Одобрен от клиента
          </button>
        )}
      </div>
    </div>
  )
}