'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Step = {
  id: string
  title: string
  assignee_id: string | null
  deadline: string | null
  completed_at: string | null
  sort_order: number
  parent_step_id: string | null
}

type Project = {
  id: string
  title: string
  client_name: string
  status: string
  deadline: string | null
  project_steps: Step[]
}

export function ProjectDetailClient({ project }: { project: Project }) {
  const router = useRouter()
  const supabase = createClient()

  const [steps, setSteps] = useState<Step[]>(
    [...project.project_steps].sort((a, b) => a.sort_order - b.sort_order)
  )
  const [status, setStatus] = useState(project.status)
  const [newStepTitle, setNewStepTitle] = useState('')
  const [addingStep, setAddingStep] = useState(false)
  const [loading, setLoading] = useState(false)

  const completed = steps.filter(s => s.completed_at).length
  const total = steps.length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  async function handleToggleStep(step: Step) {
    const completed_at = step.completed_at ? null : new Date().toISOString()
    await supabase.from('project_steps').update({ completed_at }).eq('id', step.id)
    setSteps(prev => prev.map(s => s.id === step.id ? { ...s, completed_at } : s))
  }

  async function handleAddStep() {
    if (!newStepTitle.trim()) return
    setLoading(true)
    const { data: step } = await supabase
      .from('project_steps')
      .insert({
        project_id: project.id,
        title: newStepTitle.trim(),
        sort_order: steps.length,
      })
      .select()
      .single()

    if (step) setSteps(prev => [...prev, step])
    setNewStepTitle('')
    setAddingStep(false)
    setLoading(false)
  }

  async function handleStatusChange(newStatus: string) {
    await supabase.from('projects').update({ status: newStatus }).eq('id', project.id)
    setStatus(newStatus)
  }

  async function handleCreateReport() {
    const { data: report } = await supabase
      .from('reports')
      .insert({
        project_id: project.id,
        title: `Протокол — ${project.title}`,
        status: 'draft',
      })
      .select()
      .single()
    if (report) router.push(`/dashboard/reports/${report.id}`)
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-50 text-green-700',
    paused: 'bg-yellow-50 text-yellow-600',
    done: 'bg-gray-100 text-gray-500',
  }

  const statusLabels: Record<string, string> = {
    active: 'Активен',
    paused: 'Паузиран',
    done: 'Завършен',
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.push('/dashboard/projects')}
            className="text-sm text-gray-400 hover:text-gray-600 mb-2 block"
          >
            ← Назад към проекти
          </button>
          <h1 className="text-lg font-medium">{project.title}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{project.client_name}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded font-medium ${statusColors[status]}`}>
          {statusLabels[status]}
        </span>
      </div>

      {/* Прогрес */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Прогрес</span>
          <span className="font-medium">{completed} / {total} стъпки ({progress}%)</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Стъпки */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <span className="text-xs font-medium text-gray-500">Стъпки</span>
        </div>
        <ul>
          {steps.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-gray-400">
              Няма стъпки все още.
            </li>
          )}
          {steps.map(step => (
            <li key={step.id} className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0">
              <button
                onClick={() => handleToggleStep(step)}
                className={`w-5 h-5 rounded flex-shrink-0 border flex items-center justify-center transition-colors ${
                  step.completed_at
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-green-400'
                }`}
              >
                {step.completed_at && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
              <span className={`text-sm flex-1 ${step.completed_at ? 'line-through text-gray-400' : ''}`}>
                {step.title}
              </span>
              {step.deadline && (
                <span className="text-xs text-gray-400">
                  {new Date(step.deadline).toLocaleDateString('bg-BG')}
                </span>
              )}
            </li>
          ))}
          {addingStep ? (
            <li className="flex items-center gap-2 px-4 py-3 border-t bg-blue-50">
              <input
                autoFocus
                value={newStepTitle}
                onChange={e => setNewStepTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddStep()}
                placeholder="Наименование на стъпката"
                className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none"
              />
              <button
                onClick={handleAddStep}
                disabled={loading}
                className="text-sm text-blue-600 hover:underline disabled:opacity-50"
              >
                Запази
              </button>
              <button
                onClick={() => { setAddingStep(false); setNewStepTitle('') }}
                className="text-sm text-gray-400 hover:underline"
              >
                Откажи
              </button>
            </li>
          ) : (
            <li className="px-4 py-2 border-t">
              <button
                onClick={() => setAddingStep(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                + Добави стъпка
              </button>
            </li>
          )}
        </ul>
      </div>

      {/* Actions */}
      <div className="bg-white border rounded-lg p-4 flex gap-3 flex-wrap">
        {status === 'active' && (
          <button
            onClick={() => handleStatusChange('paused')}
            className="text-sm px-3 py-1.5 border rounded-md hover:bg-gray-50"
          >
            Паузирай проекта
          </button>
        )}
        {status === 'paused' && (
          <button
            onClick={() => handleStatusChange('active')}
            className="text-sm px-3 py-1.5 border rounded-md hover:bg-gray-50"
          >
            Възобнови проекта
          </button>
        )}
        {status !== 'done' && progress === 100 && (
          <button
            onClick={() => handleStatusChange('done')}
            className="text-sm px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            ✓ Маркирай като завършен
          </button>
        )}
        {status === 'done' && (
          <button
            onClick={handleCreateReport}
            className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Създай протокол →
          </button>
        )}
      </div>
    </div>
  )
}