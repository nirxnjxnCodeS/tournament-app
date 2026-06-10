import type { Match } from '@/types'

type FixtureInput = Pick<Match, 'player_a' | 'player_b' | 'stage'>

/**
 * Round-robin for N players using the circle (polygon) method.
 * Produces exactly N*(N-1)/2 unique pairs, each appearing once.
 * For N=12: 66 matches.
 */
export function generateRoundRobin(playerIds: string[]): FixtureInput[] {
  const n = playerIds.length
  if (n < 2) return []

  // Work on a copy — pin index 0, rotate the rest
  const ids = [...playerIds]
  // If odd number of players, add a bye (null) — not needed for N=12
  const slots = n % 2 === 0 ? ids : [...ids, null]
  const rounds = slots.length - 1
  const half = slots.length / 2

  const fixtures: FixtureInput[] = []

  for (let round = 0; round < rounds; round++) {
    for (let i = 0; i < half; i++) {
      const home = slots[i]
      const away = slots[slots.length - 1 - i]
      // Skip byes
      if (home !== null && away !== null) {
        fixtures.push({ player_a: home, player_b: away, stage: 'league' })
      }
    }
    // Rotate: keep slots[0] fixed, rotate the rest clockwise
    const last = slots[slots.length - 1]
    for (let i = slots.length - 1; i > 1; i--) {
      slots[i] = slots[i - 1]
    }
    slots[1] = last
  }

  return fixtures
}

/**
 * Sanity check — returns true if the array contains exactly N*(N-1)/2
 * fixtures with no player playing themselves and no duplicate pair.
 */
export function validateFixtures(fixtures: FixtureInput[], n: number): boolean {
  const expected = (n * (n - 1)) / 2
  if (fixtures.length !== expected) return false

  const seen = new Set<string>()
  for (const f of fixtures) {
    if (f.player_a === f.player_b) return false
    const key = [f.player_a, f.player_b].sort().join('|')
    if (seen.has(key)) return false
    seen.add(key)
  }

  return true
}
