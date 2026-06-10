import { requireAdmin } from '@/actions/auth'
import { AdminNav } from './AdminNav'

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      <AdminNav />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
