import type { BracketSeeding, KnockoutBracket, Match, Player, Standing } from '@/types'

/**
 * Derives the top-4 seeds from standings in order.
 * Returns null entries if fewer than 4 players have qualified.
 */
export function getSeedsFromStandings(standings: Standing[]): [Player | null, Player | null, Player | null, Player | null] {
  return [
    standings[0]?.player ?? null,
    standings[1]?.player ?? null,
    standings[2]?.player ?? null,
    standings[3]?.player ?? null,
  ]
}

/**
 * Builds the full bracket structure from persisted seeding + knockout matches.
 * SF1 = seed_1 vs seed_4
 * SF2 = seed_2 vs seed_3
 * Final = winners of SF1 and SF2
 */
export function buildBracket(
  seeding: BracketSeeding | null,
  playerMap: Map<string, Player>,
  matches: Match[],
): KnockoutBracket {
  const sf1Match  = matches.find((m) => m.stage === 'sf1')  ?? null
  const sf2Match  = matches.find((m) => m.stage === 'sf2')  ?? null
  const finalMatch = matches.find((m) => m.stage === 'final') ?? null

  const seed1 = seeding?.seed_1 ? (playerMap.get(seeding.seed_1) ?? null) : null
  const seed2 = seeding?.seed_2 ? (playerMap.get(seeding.seed_2) ?? null) : null
  const seed3 = seeding?.seed_3 ? (playerMap.get(seeding.seed_3) ?? null) : null
  const seed4 = seeding?.seed_4 ? (playerMap.get(seeding.seed_4) ?? null) : null

  const sf1Winner  = resolveWinner(sf1Match,  playerMap)
  const sf2Winner  = resolveWinner(sf2Match,  playerMap)
  const finalWinner = resolveWinner(finalMatch, playerMap)
  const finalLoser  = resolveLoser(finalMatch,  playerMap)

  return {
    sf1: {
      home:  seed1,
      away:  seed4,
      match: sf1Match,
    },
    sf2: {
      home:  seed2,
      away:  seed3,
      match: sf2Match,
    },
    final: {
      home:  sf1Winner,
      away:  sf2Winner,
      match: finalMatch,
    },
    champion:   finalWinner,
    runner_up:  finalLoser,
  }
}

function resolveWinner(match: Match | null, playerMap: Map<string, Player>): Player | null {
  if (!match) return null
  if (match.status === 'walkover' && match.walkover_winner) {
    return playerMap.get(match.walkover_winner) ?? null
  }
  if (match.status === 'played' && match.score_a != null && match.score_b != null) {
    const winnerId = match.score_a > match.score_b ? match.player_a : match.player_b
    return playerMap.get(winnerId) ?? null
  }
  return null
}

function resolveLoser(match: Match | null, playerMap: Map<string, Player>): Player | null {
  if (!match) return null
  if (match.status === 'walkover' && match.walkover_winner) {
    const loserId = match.walkover_winner === match.player_a ? match.player_b : match.player_a
    return playerMap.get(loserId) ?? null
  }
  if (match.status === 'played' && match.score_a != null && match.score_b != null) {
    const loserId = match.score_a > match.score_b ? match.player_b : match.player_a
    return playerMap.get(loserId) ?? null
  }
  return null
}
