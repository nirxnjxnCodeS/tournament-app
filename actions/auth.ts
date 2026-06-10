'use server'

import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const SESSION_COOKIE = 'admin_session'
const SESSION_VALUE  = 'authenticated'
// 8-hour session
const MAX_AGE        = 60 * 60 * 8

type LoginState = { error: string } | null

// Signature matches useActionState: (prevState, formData) => newState
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get('password')
  if (typeof password !== 'string' || !password) {
    return { error: 'Invalid password' }
  }

  const raw = process.env.ADMIN_PASSWORD_HASH
  if (!raw) return { error: 'Server misconfigured — ADMIN_PASSWORD_HASH not set' }
  // Stored as base64 to avoid $ expansion by dotenv parsers
  const hash = Buffer.from(raw, 'base64').toString('utf8')

  let valid: boolean
  try {
    valid = await bcrypt.compare(password, hash)
  } catch {
    return { error: 'Authentication error — check server logs' }
  }

  if (!valid) return { error: 'Invalid password' }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  })

  // redirect() must be called outside try/catch — it throws a special NEXT_REDIRECT
  // error that Next.js intercepts to perform the navigation.
  redirect('/admin/dashboard')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  redirect('/admin/login')
}

export async function requireAdmin() {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  if (session?.value !== SESSION_VALUE) {
    redirect('/admin/login')
  }
}

export async function isAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE
}
