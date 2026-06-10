import { getSupabaseServer } from '@/lib/supabase-server'
import { computeStandings } from '@/lib/standings'
import type { Match, Player } from '@/types'
import { LeagueTable } from './LeagueTable'

export const metadata = { title: 'Table' }

export default async function TablePage() {
  const db = await getSupabaseServer()

  const [{ data: players }, { data: leagueMatches }, { data: config }] = await Promise.all([
    db.from('players').select('*').order('name'),
    db.from('matches').select('*').eq('stage', 'league'),
    db.from('admin_config').select('tournament_stage').eq('id', 1).single(),
  ])

  const stage = config?.tournament_stage ?? 'setup'

  if (stage === 'setup') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 px-4">
        <p className="text-2xl">⏳</p>
        <p className="text-text-muted text-sm text-center">Tournament hasn&apos;t started yet</p>
      </div>
    )
  }

  const standings = computeStandings(
    (players ?? []) as Player[],
    (leagueMatches ?? []) as Match[],
  )

  return (
    <div className="flex flex-col gap-4 px-4 py-6 max-w-4xl mx-auto">
      <h1 className="text-lg font-semibold text-text">League Table</h1>
      <LeagueTable
        standings={standings}
        allMatches={(leagueMatches ?? []) as Match[]}
      />
    </div>
  )
}
