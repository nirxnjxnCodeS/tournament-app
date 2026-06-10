'use client'

import { useState, useMemo } from 'react'
import type { Match, Player } from '@/types'
import { useRealtimeMatches } from '@/hooks/useRealtimeMatches'
import { FixtureCard } from '@/components/FixtureCard'
import { ScoreEntryModal } from '@/app/admin/(protected)/matches/ScoreEntryModal'
import { PlayerFilterChips } from './PlayerFilterChips'

type FilterTab = 'all' | 'played' | 'pending' | 'walkover'
type FullMatch = Match & { player_a_data: Player; player_b_data: Player }

interface FixtureListProps {
  matches: Match[]
  players: Player[]
  isAdmin: boolean
}

export function FixtureList({ matches: rawMatches, players, isAdmin }: FixtureListProps) {
  useRealtimeMatches('fixtures-realtime')
  const [filter, setFilter]         = useState<FilterTab>('all')
  const [search, setSearch]         = useState('')
  const [playerId, setPlayerId]     = useState<string | null>(null)
  const [adminMatch, setAdminMatch] = useState<FullMatch | null>(null)

  const matches = rawMatches as FullMatch[]

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return matches.filter((m) => {
      if (filter !== 'all' && m.status !== filter) return false
      if (playerId && m.player_a !== playerId && m.player_b !== playerId) return false
      if (q) {
        const aName = m.player_a_data?.name.toLowerCase() ?? ''
        const bName = m.player_b_data?.name.toLowerCase() ?? ''
        if (!aName.includes(q) && !bName.includes(q)) return false
      }
      return true
    })
  }, [matches, filter, playerId, search])

  const counts = useMemo(() => ({
    all:      matches.length,
    pending:  matches.filter((m) => m.status === 'pending').length,
    played:   matches.filter((m) => m.status === 'played').length,
    walkover: matches.filter((m) => m.status === 'walkover').length,
  }), [matches])

  const TABS: { id: FilterTab; label: string }[] = [
    { id: 'all',      label: `All (${counts.all})`           },
    { id: 'played',   label: `Played (${counts.played})`     },
    { id: 'pending',  label: `Pending (${counts.pending})`   },
    { id: 'walkover', label: `Walkover (${counts.walkover})` },
  ]

  // Matchday grouping: only active when no filters are applied
  const isGrouped = filter === 'all' && !playerId && !search

  const groupedByMatchday = useMemo(() => {
    if (!isGrouped) return null
    const map = new Map<number, FullMatch[]>()
    for (const m of filtered) {
      const day = m.matchday_number ?? -1
      if (!map.has(day)) map.set(day, [])
      map.get(day)!.push(m)
    }
    // Numbered matchdays ascending; -1 (no matchday, e.g. knockout) at the end
    return Array.from(map.entries()).sort(([a], [b]) => {
      if (a === -1) return 1
      if (b === -1) return -1
      return a - b
    })
  }, [filtered, isGrouped])

  return (
    <>
      {/* Player chips */}
      <PlayerFilterChips
        players={players}
        activeId={playerId}
        onChange={setPlayerId}
      />

      {/* Status filter tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={[
              'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              filter === id ? 'bg-accent text-accent-fg' : 'text-text-muted hover:bg-surface-raised',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="search"
        placeholder="Search player…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-accent"
      />

      {/* Fixture list */}
      {filtered.length === 0 ? (
        <p className="text-sm text-text-faint text-center py-12">No matches found</p>
      ) : isGrouped && groupedByMatchday ? (
        <div className="flex flex-col gap-4">
          {groupedByMatchday.map(([day, group]) => {
            const doneCt = group.filter((m) => m.status !== 'pending').length
            return (
              <div key={day} className="flex flex-col gap-2">
                {/* Matchday header */}
                {day > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-widest text-text-muted whitespace-nowrap">
                      Matchday {day}
                      <span className="text-text-faint"> · {doneCt}/{group.length}</span>
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                )}
                {group.map((m) => {
                  if (!m.player_a_data || !m.player_b_data) return null
                  return (
                    <FixtureCard
                      key={m.id}
                      match={m}
                      playerA={m.player_a_data}
                      playerB={m.player_b_data}
                      onAdminClick={isAdmin ? () => setAdminMatch(m) : undefined}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((m) => {
            if (!m.player_a_data || !m.player_b_data) return null
            return (
              <FixtureCard
                key={m.id}
                match={m}
                playerA={m.player_a_data}
                playerB={m.player_b_data}
                onAdminClick={isAdmin ? () => setAdminMatch(m) : undefined}
              />
            )
          })}
        </div>
      )}

      {adminMatch && (
        <ScoreEntryModal match={adminMatch} onClose={() => setAdminMatch(null)} />
      )}
    </>
  )
}
