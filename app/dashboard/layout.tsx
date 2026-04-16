import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

async function AuthCheck() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')
  return null
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Suspense fallback={null}>
        <AuthCheck />
      </Suspense>
      <aside className="w-52 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <p className="font-medium text-sm">BTL Hub</p>
          <p className="text-xs text-gray-400">Вътрешна система</p>
        </div>
        <nav className="p-2 flex flex-col gap-1 text-sm">
          <a href="/dashboard/rate-card" className="px-3 py-2 rounded-md hover:bg-gray-100 text-gray-600">
            Услуги
          </a>
          <a href="/dashboard/offers" className="px-3 py-2 rounded-md hover:bg-gray-100 text-gray-600">
            Офериране
          </a>
          <a href="/dashboard/projects" className="px-3 py-2 rounded-md hover:bg-gray-100 text-gray-600">
            Проекти
          </a>
          <a href="/dashboard/reports" className="px-3 py-2 rounded-md hover:bg-gray-100 text-gray-600">
            Отчитане
          </a>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}