import { getSupabaseServer } from '@/lib/supabase-server'
import { PlayerGrid } from './PlayerGrid'

export const metadata = { title: 'Admin — Players' }

export default async function PlayersPage() {
  const db = await getSupabaseServer()
  const { data: players } = await db.from('players').select('*').order('created_at')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-text">Players</h1>
        <span className="text-sm text-text-muted">{players?.length ?? 0} / 12</span>
      </div>
      <PlayerGrid players={players ?? []} />
    </div>
  )
}
