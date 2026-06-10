import { redirect } from 'next/navigation'
import { isAdminSession } from '@/actions/auth'
import { LoginForm } from './LoginForm'

export const metadata = { title: 'Admin Login' }

export default async function LoginPage() {
  if (await isAdminSession()) {
    redirect('/admin/dashboard')
  }

  return (
    <main className="min-h-dvh flex items-center justify-center px-4 bg-bg">
      <div className="w-full" style={{ maxWidth: '380px' }}>
        <LoginForm />
      </div>
    </main>
  )
}
