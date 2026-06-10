import { getSupabaseServer } from '@/lib/supabase-server'
import { isAdminSession } from '@/actions/auth'
import { computeStandings } from '@/lib/standings'
import { computeAwards } from '@/lib/awards'
import { buildBracket } from '@/lib/bracket'
import type { BracketSeeding, Match, Player } from '@/types'
import { StageHero } from './home/StageHero'
import { TopThreeCards } from './home/TopThreeCards'
import { LiveAwardsStrip } from './home/LiveAwardsStrip'
import { MatchdayProgress } from './home/MatchdayProgress'
import { RecentResults } from './home/RecentResults'
import { UpcomingFixtures } from './home/UpcomingFixtures'
import { MyPositionBanner } from './home/MyPositionBanner'

export const metadata = { title: 'Home' }

export default async function HomePage() {
  const db = await getSupabaseServer()

  const [{ data: players }, { data: allMatches }, { data: config }, { data: seeding }, isAdmin] =
    await Promise.all([
      db.from('players').select('*'),
      db.from('matches').select('*').order('played_at', { ascending: false, nullsFirst: false }),
      db.from('admin_config').select('tournament_stage').eq('id', 1).single(),
      db.from('bracket_seeding').select('*').eq('id', 1).maybeSingle(),
      isAdminSession(),
    ])

  const stage      = config?.tournament_stage ?? 'setup'
  const playerList = (players ?? []) as Player[]
  const matchList  = (allMatches ?? []) as Match[]

  const playerMap     = new Map(playerList.map((p) => [p.id, p]))
  const leagueMatches = matchList.filter((m) => m.stage === 'league')
  const standings     = computeStandings(playerList, leagueMatches)
  const awards        = computeAwards(playerList, matchList, standings)

  const played = leagueMatches.filter((m) => m.status === 'played' || m.status === 'walkover')
  const matchdayNumber = played.length > 0
    ? Math.ceil(played.length / Math.max(playerList.length / 2, 1))
    : 1

  const recent   = played.slice(0, 5)
  const upcoming = matchList
    .filter((m) => m.stage === 'league' && m.status === 'pending')
    .reverse()
    .slice(0, 5)

  const koMatches = matchList.filter((m) => m.stage !== 'league')
  const bracket = (stage === 'knockouts' || stage === 'completed')
    ? buildBracket(seeding as BracketSeeding | null, playerMap, koMatches)
    : null

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto flex flex-col gap-6">
      <StageHero
        stage={stage}
        matchdayNumber={matchdayNumber}
        standings={standings}
        bracket={bracket}
        isAdmin={isAdmin}
      />

      {stage === 'league' && (
        <MyPositionBanner standings={standings} players={playerList} allMatches={matchList} />
      )}
      {stage === 'league' && <LiveAwardsStrip awards={awards} />}
      {stage === 'league' && <MatchdayProgress playedCount={played.length} />}
      {stage === 'league' && <TopThreeCards standings={standings} />}

      <RecentResults matches={recent} playerMap={playerMap} />
      <UpcomingFixtures matches={upcoming} playerMap={playerMap} />
    </div>
  )
}
