import type { Award, Match, Player, Standing } from '@/types'

export function computeAwards(
  players: Player[],
  matches: Match[],
  standings: Standing[],
): Award[] {
  const leaguePlayed  = matches.filter((m) => m.stage === 'league' && m.status === 'played')
  const leagueSettled = matches.filter(
    (m) => m.stage === 'league' && (m.status === 'played' || m.status === 'walkover'),
  )
  const finalMatch    = matches.find((m) => m.stage === 'final' && m.status === 'played')
  const finalWalkover = matches.find((m) => m.stage === 'final' && m.status === 'walkover')

  const playerMap = new Map(players.map((p) => [p.id, p]))

  // ── Golden Boot ──────────────────────────────────────────────────────
  // Sum goals scored in played league matches only (walkovers excluded)
  const goals = new Map<string, number>()
  for (const m of leaguePlayed) {
    goals.set(m.player_a, (goals.get(m.player_a) ?? 0) + m.score_a!)
    goals.set(m.player_b, (goals.get(m.player_b) ?? 0) + m.score_b!)
  }
  const maxGoals = Math.max(0, ...goals.values())
  const bootWinners = maxGoals > 0
    ? [...goals.entries()]
        .filter(([, g]) => g === maxGoals)
        .map(([id]) => playerMap.get(id))
        .filter((p): p is Player => p !== undefined)
    : []

  // ── Clean Sheet ──────────────────────────────────────────────────────
  // played match: conceded 0
  // walkover win: counts as clean sheet; walkover loss: does not
  const cleanSheets = new Map<string, number>()
  for (const m of leagueSettled) {
    if (m.status === 'played') {
      if (m.score_b === 0) cleanSheets.set(m.player_a, (cleanSheets.get(m.player_a) ?? 0) + 1)
      if (m.score_a === 0) cleanSheets.set(m.player_b, (cleanSheets.get(m.player_b) ?? 0) + 1)
    } else {
      // walkover — winner gets clean sheet
      if (m.walkover_winner) {
        cleanSheets.set(m.walkover_winner, (cleanSheets.get(m.walkover_winner) ?? 0) + 1)
      }
    }
  }
  const maxCS = Math.max(0, ...cleanSheets.values())
  const csWinners = maxCS > 0
    ? [...cleanSheets.entries()]
        .filter(([, c]) => c === maxCS)
        .map(([id]) => playerMap.get(id))
        .filter((p): p is Player => p !== undefined)
    : []

  // ── Best GD ──────────────────────────────────────────────────────────
  const maxGD = standings.length > 0
    ? Math.max(...standings.map((s) => s.goal_difference))
    : 0
  const gdWinners = standings
    .filter((s) => s.goal_difference === maxGD && standings.length > 0)
    .map((s) => s.player)

  // ── Shield (best league record, GD tiebreak) ─────────────────────────
  // standings is already sorted: position 1 is the shield winner
  const shieldWinners = standings.length > 0 ? [standings[0].player] : []

  // ── Champion / Runner-up from final ──────────────────────────────────
  let champion: Player | null = null
  let runnerUp: Player | null = null

  const deciding = finalMatch ?? finalWalkover
  if (deciding) {
    const winnerId =
      deciding.status === 'walkover'
        ? deciding.walkover_winner
        : deciding.score_a! > deciding.score_b!
          ? deciding.player_a
          : deciding.player_b
    const loserId =
      winnerId === deciding.player_a ? deciding.player_b : deciding.player_a
    champion  = playerMap.get(winnerId ?? '') ?? null
    runnerUp  = playerMap.get(loserId) ?? null
  }

  return [
    {
      id: 'champion',
      label: 'Champion',
      icon: '🏆',
      winner: champion,
      winners: champion ? [champion] : [],
      value: null,
    },
    {
      id: 'runner_up',
      label: 'Runner-up',
      icon: '🥈',
      winner: runnerUp,
      winners: runnerUp ? [runnerUp] : [],
      value: null,
    },
    {
      id: 'shield',
      label: 'League Shield',
      icon: '🛡️',
      winner: shieldWinners[0] ?? null,
      winners: shieldWinners,
      value: standings[0] ? `${standings[0].points} pts` : null,
    },
    {
      id: 'golden_boot',
      label: 'Golden Boot',
      icon: '👟',
      winner: bootWinners[0] ?? null,
      winners: bootWinners,
      value: maxGoals > 0 ? `${maxGoals} goals` : null,
    },
    {
      id: 'clean_sheet',
      label: 'Clean Sheet King',
      icon: '🧤',
      winner: csWinners[0] ?? null,
      winners: csWinners,
      value: maxCS > 0 ? `${maxCS} clean sheets` : null,
    },
    {
      id: 'best_gd',
      label: 'Best Goal Difference',
      icon: '📈',
      winner: gdWinners[0] ?? null,
      winners: gdWinners,
      value: maxGD > 0 ? `+${maxGD}` : maxGD < 0 ? `${maxGD}` : maxGD === 0 && gdWinners.length > 0 ? '0' : null,
    },
  ]
}
