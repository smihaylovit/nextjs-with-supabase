import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'

async function ProjectsList() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (!projects || projects.length === 0) {
    return <p className="text-sm text-gray-400">Няма проекти все още. Приеми оферта за да създадеш проект.</p>
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
    <div className="flex flex-col gap-2">
      {projects.map(project => (
        <a
          key={project.id}
          href={`/dashboard/projects/${project.id}`}
          className="bg-white border rounded-lg px-4 py-3 hover:border-gray-400 transition-colors block"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{project.title}</span>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColors[project.status]}`}>
              {statusLabels[project.status]}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{project.client_name}</p>
          {project.deadline && (
            <p className="text-xs text-gray-400 mt-0.5">
              Дедлайн: {new Date(project.deadline).toLocaleDateString('bg-BG')}
            </p>
          )}
        </a>
      ))}
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium">Проекти</h1>
      </div>
      <Suspense fallback={<p className="text-sm text-gray-400">Зарежда...</p>}>
        <ProjectsList />
      </Suspense>
    </div>
  )
}