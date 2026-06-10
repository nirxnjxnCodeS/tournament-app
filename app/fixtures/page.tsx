import { getSupabaseServer } from '@/lib/supabase-server'
import { isAdminSession } from '@/actions/auth'
import type { Match, Player } from '@/types'
import { FixtureList } from './FixtureList'

export const metadata = { title: 'Fixtures' }

export default async function FixturesPage() {
  const db = await getSupabaseServer()

  const [{ data: rawMatches }, { data: players }, isAdmin, { data: config }] = await Promise.all([
    db.from('matches').select('*').order('created_at'),
    db.from('players').select('*'),
    isAdminSession(),
    db.from('admin_config').select('tournament_stage').eq('id', 1).single(),
  ])

  const stage = config?.tournament_stage ?? 'setup'
  if (stage === 'setup') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 px-4">
        <p className="text-2xl">📅</p>
        <p className="text-text-muted text-sm">Fixtures will appear once the league starts</p>
      </div>
    )
  }

  const playerMap = new Map((players ?? []).map((p) => [p.id, p as Player]))
  const matches: Match[] = (rawMatches ?? []).map((m) => ({
    ...m,
    player_a_data: playerMap.get(m.player_a),
    player_b_data: playerMap.get(m.player_b),
  }))

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-text">Fixtures</h1>
      <FixtureList matches={matches} players={players ?? []} isAdmin={isAdmin} />
    </div>
  )
}
