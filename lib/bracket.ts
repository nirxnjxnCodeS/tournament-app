import type { BracketSeeding, KnockoutBracket, Match, Player, Standing } from '@/types'

/**
 * Derives qualifying seeds from standings in order.
 * Returns top 2 for small tournaments (N < 8, direct final) or top 4 (SF + Final).
 * Uses the `qualified` flag already set by computeStandings.
 */
export function getSeedsFromStandings(standings: Standing[]): Player[] {
  return standings.filter((s) => s.qualified).map((s) => s.player)
}

/**
 * Builds the full bracket structure from persisted seeding + knockout matches.
 * For 4 seeds: SF1 = seed_1 vs seed_4, SF2 = seed_2 vs seed_3, then Final.
 * For 2 seeds: direct Final = seed_1 vs seed_2 (sf1/sf2 are null).
 */
export function buildBracket(
  seeding: BracketSeeding | null,
  playerMap: Map<string, Player>,
  matches: Match[],
): KnockoutBracket {
  const sf1Match   = matches.find((m) => m.stage === 'sf1')   ?? null
  const sf2Match   = matches.find((m) => m.stage === 'sf2')   ?? null
  const finalMatch = matches.find((m) => m.stage === 'final') ?? null

  const seed1 = seeding?.seed_1 ? (playerMap.get(seeding.seed_1) ?? null) : null
  const seed2 = seeding?.seed_2 ? (playerMap.get(seeding.seed_2) ?? null) : null
  const seed3 = seeding?.seed_3 ? (playerMap.get(seeding.seed_3) ?? null) : null
  const seed4 = seeding?.seed_4 ? (playerMap.get(seeding.seed_4) ?? null) : null

  const hasSemis = sf1Match !== null || sf2Match !== null || (seed3 !== null && seed4 !== null)

  const sf1Winner   = resolveWinner(sf1Match,   playerMap)
  const sf2Winner   = resolveWinner(sf2Match,   playerMap)
  const finalWinner = resolveWinner(finalMatch, playerMap)
  const finalLoser  = resolveLoser(finalMatch,  playerMap)

  return {
    sf1: hasSemis ? { home: seed1, away: seed4, match: sf1Match } : null,
    sf2: hasSemis ? { home: seed2, away: seed3, match: sf2Match } : null,
    final: {
      home:  hasSemis ? sf1Winner : seed1,
      away:  hasSemis ? sf2Winner : seed2,
      match: finalMatch,
    },
    champion:  finalWinner,
    runner_up: finalLoser,
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
