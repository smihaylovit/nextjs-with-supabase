import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProjectDetailClient } from './_components/project-detail-client'

async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*, project_steps(*)')
    .eq('id', id)
    .single()

  if (!project) notFound()

  return <ProjectDetailClient project={project} />
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <div className="p-6 max-w-4xl">
      <Suspense fallback={<p className="text-sm text-gray-400">Зарежда...</p>}>
        <ProjectDetail params={params} />
      </Suspense>
    </div>
  )
}