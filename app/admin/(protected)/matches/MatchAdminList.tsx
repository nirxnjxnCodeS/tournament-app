'use client'

import { useState, useMemo } from 'react'
import type { Match, Player } from '@/types'
import { PlayerAvatar } from '@/components/ui/PlayerAvatar'
import { Button } from '@/components/ui/Button'
import { ScoreEntryModal } from './ScoreEntryModal'
import { WalkoverModal } from './WalkoverModal'
import { ResetMatchModal } from './ResetMatchModal'

type FilterTab = 'all' | 'pending' | 'played' | 'walkover'

type FullMatch = Match & { player_a_data: Player; player_b_data: Player }

interface MatchAdminListProps {
  matches: Match[]
}

export function MatchAdminList({ matches: rawMatches }: MatchAdminListProps) {
  const [filter, setFilter]         = useState<FilterTab>('all')
  const [scoreMatch, setScoreMatch]   = useState<FullMatch | null>(null)
  const [woMatch, setWoMatch]         = useState<FullMatch | null>(null)
  const [resetMatch, setResetMatch]   = useState<FullMatch | null>(null)

  const matches = rawMatches as FullMatch[]

  const filtered = useMemo(() => {
    const base = filter === 'all'
      ? matches
      : matches.filter((m) => m.status === filter)
    // Pending first, then played/walkover
    return [...base].sort((a, b) => {
      const order = { pending: 0, played: 1, walkover: 2 }
      return order[a.status] - order[b.status]
    })
  }, [matches, filter])

  const counts = useMemo(() => ({
    all:      matches.length,
    pending:  matches.filter((m) => m.status === 'pending').length,
    played:   matches.filter((m) => m.status === 'played').length,
    walkover: matches.filter((m) => m.status === 'walkover').length,
  }), [matches])

  const TABS: { id: FilterTab; label: string }[] = [
    { id: 'all',      label: `All (${counts.all})`           },
    { id: 'pending',  label: `Pending (${counts.pending})`   },
    { id: 'played',   label: `Played (${counts.played})`     },
    { id: 'walkover', label: `Walkover (${counts.walkover})` },
  ]

  return (
    <>
      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-border pb-3 overflow-x-auto">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={[
              'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              filter === id
                ? 'bg-accent text-accent-fg'
                : 'text-text-muted hover:text-text hover:bg-surface-raised',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Match rows */}
      {filtered.length === 0 ? (
        <p className="text-sm text-text-faint text-center py-12">No matches</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((m) => (
            <MatchAdminRow
              key={m.id}
              match={m}
              onEnterScore={() => setScoreMatch(m)}
              onWalkover={() => setWoMatch(m)}
              onReset={() => setResetMatch(m)}
            />
          ))}
        </div>
      )}

      {scoreMatch && (
        <ScoreEntryModal match={scoreMatch} onClose={() => setScoreMatch(null)} />
      )}
      {woMatch && (
        <WalkoverModal match={woMatch} onClose={() => setWoMatch(null)} />
      )}
      {resetMatch && (
        <ResetMatchModal match={resetMatch} onClose={() => setResetMatch(null)} />
      )}
    </>
  )
}

function MatchAdminRow({
  match,
  onEnterScore,
  onWalkover,
  onReset,
}: {
  match: FullMatch
  onEnterScore: () => void
  onWalkover: () => void
  onReset: () => void
}) {
  const stageLabel: Record<string, string> = {
    league: 'League', sf1: 'SF1', sf2: 'SF2', final: 'Final',
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-surface border border-border rounded-card px-4 py-3">
      {/* Players */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <PlayerAvatar player={match.player_a_data} size="sm" />
        <span className="text-sm text-text truncate">{match.player_a_data.name}</span>
        <span className="text-text-faint text-xs shrink-0">
          {match.status === 'played'
            ? `${match.score_a} – ${match.score_b}`
            : match.status === 'walkover'
            ? 'W/O'
            : 'vs'}
        </span>
        <span className="text-sm text-text truncate">{match.player_b_data.name}</span>
        <PlayerAvatar player={match.player_b_data} size="sm" />
      </div>

      {/* Stage badge */}
      <span className="text-[10px] font-semibold text-text-faint uppercase tracking-wider shrink-0">
        {stageLabel[match.stage]}
      </span>

      {/* Actions */}
      <div className="flex gap-2 shrink-0">
        {match.status === 'walkover' ? (
          <Button size="sm" variant="secondary" onClick={onEnterScore}>
            Enter Actual Score
          </Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={onEnterScore}>
            {match.status === 'pending' ? 'Enter Score' : 'Edit Score'}
          </Button>
        )}
        {match.status !== 'walkover' && (
          <Button size="sm" variant="ghost" onClick={onWalkover}>
            Walkover
          </Button>
        )}
        {(match.status === 'played' || match.status === 'walkover') && (
          <Button size="sm" variant="ghost" onClick={onReset} aria-label="Reset match">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M2 7a5 5 0 1 0 1.5-3.54"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 3v3.5H5.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Reset
          </Button>
        )}
      </div>
    </div>
  )
}
