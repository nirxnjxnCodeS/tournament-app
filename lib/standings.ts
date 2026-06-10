import type { Match, Player, Standing } from '@/types'

type FormResult = 'W' | 'D' | 'L'

export function getStreak(form: FormResult[]): { type: FormResult | null; count: number } {
  if (form.length === 0) return { type: null, count: 0 }
  const last = form[form.length - 1]
  let count = 1
  for (let i = form.length - 2; i >= 0; i--) {
    if (form[i] === last) count++
    else break
  }
  return { type: last, count }
}

export function computeStandings(players: Player[], matches: Match[]): Standing[] {
  const map = new Map<string, Omit<Standing, 'position' | 'qualified' | 'tied' | 'form' | 'streak'> & { formMatches: { played_at: string | null; result: FormResult }[] }>()

  for (const p of players) {
    map.set(p.id, {
      player: p,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0,
      formMatches: [],
    })
  }

  for (const m of matches) {
    if (m.status !== 'played' && m.status !== 'walkover') continue
    if (m.stage !== 'league') continue

    const a = map.get(m.player_a)
    const b = map.get(m.player_b)
    if (!a || !b) continue

    if (m.status === 'walkover') {
      const winnerId = m.walkover_winner
      const aWon = winnerId === m.player_a
      const goalsForA     = aWon ? 3 : 0
      const goalsAgainstA = aWon ? 0 : 3
      const goalsForB     = aWon ? 0 : 3
      const goalsAgainstB = aWon ? 3 : 0

      a.played++
      b.played++
      a.goals_for      += goalsForA
      a.goals_against  += goalsAgainstA
      b.goals_for      += goalsForB
      b.goals_against  += goalsAgainstB

      if (aWon) {
        a.won++; a.points += 3
        b.lost++
      } else {
        b.won++; b.points += 3
        a.lost++
      }

      a.formMatches.push({ played_at: m.played_at, result: aWon ? 'W' : 'L' })
      b.formMatches.push({ played_at: m.played_at, result: aWon ? 'L' : 'W' })

    } else {
      const sa = m.score_a!
      const sb = m.score_b!

      a.played++
      b.played++
      a.goals_for     += sa
      a.goals_against += sb
      b.goals_for     += sb
      b.goals_against += sa

      if (sa > sb) {
        a.won++; a.points += 3; b.lost++
        a.formMatches.push({ played_at: m.played_at, result: 'W' })
        b.formMatches.push({ played_at: m.played_at, result: 'L' })
      } else if (sb > sa) {
        b.won++; b.points += 3; a.lost++
        a.formMatches.push({ played_at: m.played_at, result: 'L' })
        b.formMatches.push({ played_at: m.played_at, result: 'W' })
      } else {
        a.drawn++; a.points += 1
        b.drawn++; b.points += 1
        a.formMatches.push({ played_at: m.played_at, result: 'D' })
        b.formMatches.push({ played_at: m.played_at, result: 'D' })
      }
    }
  }

  const rows = Array.from(map.values()).map((s) => {
    const gd = s.goals_for - s.goals_against
    const sorted = [...s.formMatches].sort((x, y) => {
      if (!x.played_at && !y.played_at) return 0
      if (!x.played_at) return 1
      if (!y.played_at) return -1
      return x.played_at < y.played_at ? -1 : 1
    })
    // form: last 5 for display (oldest → newest so newest is rightmost)
    const allResults: FormResult[] = sorted.map((f) => f.result)
    const form: FormResult[] = allResults.slice(-5)
    // streak uses the full history so a 6-game win run isn't capped at 5
    const streak = getStreak(allResults)
    return { ...s, goal_difference: gd, form, streak }
  })

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference
    if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for
    return a.player.name.localeCompare(b.player.name)
  })

  const isTiedWith = (i: number, j: number) =>
    rows[i].points         === rows[j].points &&
    rows[i].goal_difference === rows[j].goal_difference &&
    rows[i].goals_for       === rows[j].goals_for

  const tiedIndexes = new Set<number>()
  for (let i = 0; i < rows.length - 1; i++) {
    if (isTiedWith(i, i + 1)) {
      tiedIndexes.add(i)
      tiedIndexes.add(i + 1)
    }
  }

  return rows.map((s, i) => ({
    player:           s.player,
    played:           s.played,
    won:              s.won,
    drawn:            s.drawn,
    lost:             s.lost,
    goals_for:        s.goals_for,
    goals_against:    s.goals_against,
    goal_difference:  s.goal_difference,
    points:           s.points,
    form:             s.form,
    streak:           s.streak,
    position:         i + 1,
    qualified:        i < 4,
    tied:             tiedIndexes.has(i),
  }))
}
