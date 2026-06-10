'use client'

import { useState, useMemo } from 'react'
import type { Match, Player, Standing } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { PlayerAvatar } from '@/components/ui/PlayerAvatar'
import { FixtureCard } from '@/components/FixtureCard'
import { computeStandings } from '@/lib/standings'

interface PlayerDetailModalProps {
  standing: Standing
  allMatches: Match[]
  playerMap: Map<string, Player>
  onClose: () => void
}

type Tab = 'fixtures' | 'stats' | 'h2h'

const STREAK_ICONS: Record<'W' | 'D' | 'L', string> = { W: '🔥', D: '〰️', L: '📉' }
const STREAK_LABELS: Record<'W' | 'D' | 'L', string> = { W: 'win', D: 'draw', L: 'loss' }

function difficultyBadge(position: number) {
  if (position <= 3)  return { label: 'Tough',    cls: 'bg-loss/15 text-loss'  }
  if (position <= 6)  return { label: 'Mid',      cls: 'bg-draw/15 text-draw'  }
  return               { label: 'Winnable', cls: 'bg-win/15 text-win'   }
}

export function PlayerDetailModal({ standing, allMatches, playerMap, onClose }: PlayerDetailModalProps) {
  const [tab, setTab] = useState<Tab>('fixtures')
  const { player } = standing

  const playerMatches = allMatches.filter(
    (m) => (m.player_a === player.id || m.player_b === player.id) &&
      (m.status === 'played' || m.status === 'walkover'),
  )

  // Stats
  const cleanSheets = playerMatches.filter((m) => {
    if (m.status === 'walkover') return m.walkover_winner === player.id
    const conceded = m.player_a === player.id ? m.score_b : m.score_a
    return conceded === 0
  }).length

  const playedMatches = playerMatches.filter((m) => m.status === 'played')
  const margins = playedMatches.map((m) => {
    const scored   = m.player_a === player.id ? (m.score_a ?? 0) : (m.score_b ?? 0)
    const conceded = m.player_a === player.id ? (m.score_b ?? 0) : (m.score_a ?? 0)
    return scored - conceded
  })
  const biggestWin  = margins.length > 0 ? Math.max(...margins) : null
  const biggestLoss = margins.length > 0 ? Math.min(...margins) : null

  // H2H records
  const opponents = Array.from(playerMap.values()).filter((p) => p.id !== player.id)
  const h2hRecords = opponents.map((opponent) => {
    const h2hMatches = allMatches.filter((m) =>
      ((m.player_a === player.id && m.player_b === opponent.id) ||
       (m.player_a === opponent.id && m.player_b === player.id)) &&
      (m.status === 'played' || m.status === 'walkover'),
    )
    let w = 0, d = 0, l = 0, gf = 0, ga = 0
    for (const m of h2hMatches) {
      if (m.status === 'walkover') {
        const won = m.walkover_winner === player.id
        if (won) { w++; gf += 3 } else { l++; ga += 3 }
      } else {
        const scored   = m.player_a === player.id ? (m.score_a ?? 0) : (m.score_b ?? 0)
        const conceded = m.player_a === player.id ? (m.score_b ?? 0) : (m.score_a ?? 0)
        gf += scored; ga += conceded
        if (scored > conceded) w++
        else if (scored === conceded) d++
        else l++
      }
    }
    return { opponent, w, d, l, gf, ga, played: h2hMatches.length }
  }).sort((a, b) => b.w !== a.w ? b.w - a.w : a.opponent.name.localeCompare(b.opponent.name))

  // Remaining fixtures + difficulty
  const allStandings = useMemo(() => {
    const allPlayers = Array.from(playerMap.values())
    return computeStandings(allPlayers, allMatches)
  }, [playerMap, allMatches])

  const standingsMap = useMemo(
    () => new Map(allStandings.map((s) => [s.player.id, s])),
    [allStandings],
  )

  const remainingOpponents = useMemo(() => {
    return opponents
      .filter((opp) => {
        const match = allMatches.find((m) =>
          (m.player_a === player.id && m.player_b === opp.id) ||
          (m.player_a === opp.id && m.player_b === player.id),
        )
        return match && match.status === 'pending'
      })
      .map((opp) => {
        const oppStanding = standingsMap.get(opp.id)
        return { opponent: opp, position: oppStanding?.position ?? 99 }
      })
      .sort((a, b) => a.position - b.position)  // Tough (low pos #) first
  }, [opponents, allMatches, player.id, standingsMap])

  const TAB_LABELS: { id: Tab; label: string }[] = [
    { id: 'fixtures', label: 'Fixtures' },
    { id: 'stats',    label: 'Stats'    },
    { id: 'h2h',      label: 'H2H'      },
  ]

  return (
    <Modal open onClose={onClose} title={player.name}>
      <div className="flex flex-col gap-4 -mx-5 -mb-4">
        {/* Header */}
        <div className="flex items-center gap-4 px-5 pb-4 border-b border-border">
          <PlayerAvatar player={player} size="xl" showRing />
          <div>
            <p className="text-base font-bold text-text">{player.name}</p>
            <p className="text-sm text-text-muted">#{standing.position} · {standing.points} pts</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5">
          {TAB_LABELS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={[
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                tab === id ? 'bg-accent text-accent-fg' : 'text-text-muted hover:bg-surface-raised',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="px-5 pb-5 flex flex-col gap-2 max-h-80 overflow-y-auto">

          {/* ── Fixtures tab ── */}
          {tab === 'fixtures' && (
            <>
              {playerMatches.length === 0
                ? <p className="text-sm text-text-faint text-center py-4">No results yet</p>
                : playerMatches.map((m) => {
                    const pA = playerMap.get(m.player_a)
                    const pB = playerMap.get(m.player_b)
                    if (!pA || !pB) return null
                    return <FixtureCard key={m.id} match={m} playerA={pA} playerB={pB} compact />
                  })
              }

              {/* Remaining opponents */}
              <div className="mt-2 flex flex-col gap-1.5">
                <p className="text-[11px] font-semibold text-text-faint uppercase tracking-wider">
                  Remaining Opponents
                </p>
                {remainingOpponents.length === 0 ? (
                  <p className="text-xs text-text-muted">All matches played</p>
                ) : (
                  <>
                    <p className="text-xs text-text-muted">{remainingOpponents.length} match{remainingOpponents.length !== 1 ? 'es' : ''} remaining</p>
                    {remainingOpponents.map(({ opponent, position }) => {
                      const badge = difficultyBadge(position)
                      return (
                        <div key={opponent.id} className="flex items-center gap-3 py-1.5 border-b border-border/40 last:border-0">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <PlayerAvatar player={opponent} size="sm" />
                            <span className="text-sm text-text truncate">{opponent.name}</span>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${badge.cls}`}>
                            {badge.label}
                          </span>
                          <span className="text-xs text-text-faint tabular-nums shrink-0">#{position}</span>
                        </div>
                      )
                    })}
                  </>
                )}
              </div>
            </>
          )}

          {/* ── Stats tab ── */}
          {tab === 'stats' && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Goals For',     value: standing.goals_for        },
                  { label: 'Goals Against', value: standing.goals_against    },
                  { label: 'Goal Diff',     value: standing.goal_difference > 0 ? `+${standing.goal_difference}` : standing.goal_difference },
                  { label: 'Clean Sheets',  value: cleanSheets               },
                  { label: 'Biggest Win',   value: biggestWin != null ? `+${biggestWin}` : '—'                              },
                  { label: 'Biggest Loss',  value: biggestLoss != null && biggestLoss < 0 ? biggestLoss : '—'               },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-surface-raised rounded-lg px-3 py-3">
                    <p className="text-xs text-text-muted">{label}</p>
                    <p className="text-lg font-bold text-text tabular-nums">{value}</p>
                  </div>
                ))}
              </div>
              {standing.streak.type && standing.streak.count >= 2 && (
                <div className="bg-surface-raised rounded-lg px-3 py-3">
                  <p className="text-xs text-text-muted">Current streak</p>
                  <p className={[
                    'text-base font-bold',
                    standing.streak.type === 'W' ? 'text-win' : standing.streak.type === 'L' ? 'text-loss' : 'text-text-muted',
                  ].join(' ')}>
                    {STREAK_ICONS[standing.streak.type]} {standing.streak.count} {STREAK_LABELS[standing.streak.type]}{standing.streak.count !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── H2H tab ── */}
          {tab === 'h2h' && (
            <div className="flex flex-col">
              {h2hRecords.map(({ opponent, w, d, l, gf, ga, played: h2hPlayed }) => (
                <div
                  key={opponent.id}
                  className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <PlayerAvatar player={opponent} size="sm" />
                    <span className="text-sm text-text truncate">{opponent.name}</span>
                  </div>
                  {h2hPlayed === 0 ? (
                    <span className="text-xs text-text-faint shrink-0">Not played</span>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 text-xs tabular-nums font-medium shrink-0">
                        <span className="text-win">{w}W</span>
                        <span className="text-text-muted">{d}D</span>
                        <span className="text-loss">{l}L</span>
                      </div>
                      <span className="text-xs text-text-muted tabular-nums shrink-0">{gf} – {ga}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
