import { getSupabaseServer } from '@/lib/supabase-server'
import { computeStandings } from '@/lib/standings'
import { computeAwards } from '@/lib/awards'
import type { Match, Player } from '@/types'
import { AwardGrid } from './AwardGrid'

export const metadata = { title: 'Awards' }

export default async function AwardsPage() {
  const db = await getSupabaseServer()

  const [{ data: players }, { data: allMatches }] = await Promise.all([
    db.from('players').select('*'),
    db.from('matches').select('*'),
  ])

  const playerList  = (players ?? []) as Player[]
  const matchList   = (allMatches ?? []) as Match[]
  const leagueMatches = matchList.filter((m) => m.stage === 'league')

  const standings = computeStandings(playerList, leagueMatches)
  const awards    = computeAwards(playerList, matchList, standings)

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-text">Awards</h1>
      <AwardGrid awards={awards} />
    </div>
  )
}
