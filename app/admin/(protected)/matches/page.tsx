import { getSupabaseServer } from '@/lib/supabase-server'
import type { Match, Player } from '@/types'
import { MatchAdminList } from './MatchAdminList'

export const metadata = { title: 'Admin — Matches' }

export default async function AdminMatchesPage() {
  const db = await getSupabaseServer()

  const [{ data: rawMatches }, { data: players }] = await Promise.all([
    db.from('matches').select('*').order('created_at'),
    db.from('players').select('*'),
  ])

  const playerMap = new Map((players ?? []).map((p) => [p.id, p as Player]))

  const matches: Match[] = (rawMatches ?? []).map((m) => ({
    ...m,
    player_a_data: playerMap.get(m.player_a),
    player_b_data: playerMap.get(m.player_b),
  }))

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold text-text">Matches</h1>
      <MatchAdminList matches={matches} />
    </div>
  )
}
