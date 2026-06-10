'use server'

import { requireAdmin } from './auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

const MAX_BADGE_BYTES = 200 * 1024  // 200 KB

export async function upsertPlayer(_prev: { error?: string } | null, formData: FormData): Promise<{ error?: string }> {
  await requireAdmin()
  const db = getSupabaseAdmin()

  const id    = formData.get('id') as string | null
  const name  = (formData.get('name') as string | null)?.trim()
  const color = formData.get('primary_color') as string | null
  const badge = formData.get('badge') as File | null

  if (!name) return { error: 'Name is required' }
  if (!color || !/^#[0-9a-fA-F]{6}$/.test(color)) return { error: 'Invalid color' }

  let badge_url: string | undefined

  if (badge && badge.size > 0) {
    if (badge.size > MAX_BADGE_BYTES) return { error: 'Badge must be under 200 KB' }

    const ext      = badge.name.split('.').pop() ?? 'png'
    const filename = `${id ?? crypto.randomUUID()}.${ext}`
    const bytes    = await badge.arrayBuffer()

    const { error: uploadError } = await db.storage
      .from('badges')
      .upload(filename, bytes, {
        contentType: badge.type,
        upsert: true,
      })

    if (uploadError) return { error: `Badge upload failed: ${uploadError.message}` }

    const { data: urlData } = db.storage.from('badges').getPublicUrl(filename)
    badge_url = urlData.publicUrl
  }

  if (id) {
    const { error } = await db
      .from('players')
      .update({ name, primary_color: color, ...(badge_url ? { badge_url } : {}) })
      .eq('id', id)
    if (error) return { error: error.message }
  } else {
    const { error } = await db
      .from('players')
      .insert({ name, primary_color: color, badge_url: badge_url ?? null })
    if (error) return { error: error.message }
  }

  revalidatePath('/admin/players')
  revalidatePath('/', 'layout')
  return {}
}
