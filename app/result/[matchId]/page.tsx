import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase-server'
import { computeStandings } from '@/lib/standings'
import { FormStrip } from '@/components/ui/FormDot'
import { PlayerAvatar } from '@/components/ui/PlayerAvatar'
import type { Match, Player } from '@/types'

interface ResultPageProps {
  params: Promise<{ matchId: string }>
}

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function stageLabel(match: Match) {
  if (match.stage === 'league') return `League · Matchday ${match.matchday_number ?? '?'}`
  const labels: Record<string, string> = { sf1: 'Semi-Final 1', sf2: 'Semi-Final 2', final: 'Final' }
  return labels[match.stage] ?? match.stage
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { matchId } = await params
  const db = await getSupabaseServer()

  const [{ data: matchRow }, { data: players }, { data: allLeagueMatches }] = await Promise.all([
    db.from('matches').select('*').eq('id', matchId).single(),
    db.from('players').select('*'),
    db.from('matches').select('*').eq('stage', 'league'),
  ])

  if (!matchRow || (matchRow.status !== 'played' && matchRow.status !== 'walkover')) notFound()

  const match   = matchRow as Match
  const playerList = (players ?? []) as Player[]
  const playerMap = new Map(playerList.map((p) => [p.id, p]))
  const playerA = playerMap.get(match.player_a)
  const playerB = playerMap.get(match.player_b)
  if (!playerA || !playerB) notFound()

  const leagueMatches = (allLeagueMatches ?? []) as Match[]

  // Standings with and without this match (only relevant for league)
  const isLeague = match.stage === 'league'
  const standingsWith    = isLeague ? computeStandings(playerList, leagueMatches) : []
  const standingsWithout = isLeague
    ? computeStandings(playerList, leagueMatches.filter((m) => m.id !== matchId))
    : []

  const posWithA  = standingsWith.find((s) => s.player.id === match.player_a)
  const posWithB  = standingsWith.find((s) => s.player.id === match.player_b)
  const posBeforeA = standingsWithout.find((s) => s.player.id === match.player_a)
  const posBeforeB = standingsWithout.find((s) => s.player.id === match.player_b)

  // Determine winner
  let winnerId: string | null = null
  if (match.status === 'walkover') {
    winnerId = match.walkover_winner
  } else if (match.score_a != null && match.score_b != null) {
    if (match.score_a > match.score_b) winnerId = match.player_a
    else if (match.score_b > match.score_a) winnerId = match.player_b
  }

  function nameColor(playerId: string) {
    if (winnerId === null) return 'text-text'  // draw
    return winnerId === playerId ? 'text-accent font-bold' : 'text-text-muted'
  }

  function positionChange(before: number | undefined, after: number | undefined) {
    if (before === undefined || after === undefined) return null
    if (before === after) return { arrow: null, text: `Stayed ${ordinal(after)}` }
    const up = before > after
    return {
      arrow: up ? '↑' : '↓',
      color: up ? 'text-win' : 'text-loss',
      text: `${ordinal(before)} → ${ordinal(after)}`,
    }
  }

  const changeA = positionChange(posBeforeA?.position, posWithA?.position)
  const changeB = positionChange(posBeforeB?.position, posWithB?.position)

  return (
    <div className="min-h-dvh bg-bg flex items-start justify-center p-4 pt-8">
      <div className="w-full max-w-sm flex flex-col gap-4">

        {/* Stage label */}
        <p className="text-xs font-semibold text-text-faint uppercase tracking-widest text-center">
          {stageLabel(match)}
        </p>

        {/* Score card */}
        <div className="bg-surface border border-border rounded-card px-5 py-6">
          <div className="flex items-center gap-2">
            {/* Player A side */}
            <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
              <PlayerAvatar player={playerA} size="lg" showRing />
              <span className={`text-sm text-center leading-tight truncate w-full ${nameColor(match.player_a)}`}>
                {playerA.name}
              </span>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center gap-1 shrink-0 px-2">
              {match.status === 'played' ? (
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-bold text-text tabular-nums">{match.score_a}</span>
                  <span className="text-2xl text-text-faint">–</span>
                  <span className="text-4xl font-bold text-text tabular-nums">{match.score_b}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-3xl font-bold text-text">W/O</span>
                  <span className="text-[11px] font-medium text-walkover uppercase tracking-wide">walkover</span>
                </div>
              )}
            </div>

            {/* Player B side */}
            <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
              <PlayerAvatar player={playerB} size="lg" showRing />
              <span className={`text-sm text-center leading-tight truncate w-full ${nameColor(match.player_b)}`}>
                {playerB.name}
              </span>
            </div>
          </div>
        </div>

        {/* Table impact (league only) */}
        {isLeague && (
          <div className="bg-surface border border-border rounded-card px-5 py-4 flex flex-col gap-4">
            <p className="text-xs font-semibold text-text-faint uppercase tracking-wider">Table impact</p>

            {[
              { player: playerA, change: changeA, standing: posWithA },
              { player: playerB, change: changeB, standing: posWithB },
            ].map(({ player, change, standing }) => (
              <div key={player.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <PlayerAvatar player={player} size="sm" />
                  <span className="text-sm font-medium text-text truncate">{player.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {change && (
                    <span className={`text-sm font-medium tabular-nums ${change.color ?? 'text-text-muted'}`}>
                      {change.arrow && <span className="mr-0.5">{change.arrow}</span>}
                      {change.text}
                    </span>
                  )}
                  {standing && <FormStrip form={standing.form} />}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back link */}
        <Link
          href="/fixtures"
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Fixtures
        </Link>
      </div>
    </div>
  )
}
