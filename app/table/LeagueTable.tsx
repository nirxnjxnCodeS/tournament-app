'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { Match, Player, Standing } from '@/types'
import { useRealtimeMatches } from '@/hooks/useRealtimeMatches'
import { TableRow } from './TableRow'
import { PlayerDetailModal } from './PlayerDetailModal'

interface LeagueTableProps {
  standings: Standing[]
  allMatches: Match[]
}

export function LeagueTable({ standings, allMatches }: LeagueTableProps) {
  useRealtimeMatches('table-realtime')
  const [selected, setSelected] = useState<Standing | null>(null)
  const [directions, setDirections] = useState<Map<string, 'up' | 'down'>>(new Map())
  const prevPositions = useRef<Map<string, number>>(new Map())

  const playerMap = new Map<string, Player>(
    standings.map((s) => [s.player.id, s.player]),
  )

  allMatches.forEach((m) => {
    if (m.player_a_data && !playerMap.has(m.player_a)) playerMap.set(m.player_a, m.player_a_data)
    if (m.player_b_data && !playerMap.has(m.player_b)) playerMap.set(m.player_b, m.player_b_data)
  })

  // Track position changes on standings updates
  useEffect(() => {
    const newDirs = new Map<string, 'up' | 'down'>()
    for (const s of standings) {
      const prev = prevPositions.current.get(s.player.id)
      if (prev !== undefined && prev !== s.position) {
        newDirs.set(s.player.id, prev > s.position ? 'up' : 'down')
      }
      prevPositions.current.set(s.player.id, s.position)
    }
    if (newDirs.size === 0) return
    setDirections(newDirs)
    const t = setTimeout(() => setDirections(new Map()), 3000)
    return () => clearTimeout(t)
  }, [standings])

  if (standings.length === 0) {
    return <p className="text-sm text-text-faint text-center py-12">No players yet</p>
  }

  const firstNonQualifiedPos = standings.find((s) => !s.qualified)?.position

  return (
    <>
      <div className="overflow-x-auto rounded-card border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-surface-raised border-b border-border text-[11px] font-semibold text-text-faint uppercase tracking-wide">
              <th className="w-1" />
              <th className="pr-3 py-2.5 text-right w-7">#</th>
              <th className="py-2.5 pr-4 text-left">Player</th>
              {['P','W','D','L','GF','GA','GD','PTS'].map((h) => (
                <th key={h} className="py-2.5 px-2 text-right w-8 tabular-nums">{h}</th>
              ))}
              <th className="py-2.5 pl-2 pr-2 text-left">Form</th>
              <th className="w-14" />
              <th className="w-12" />
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {standings.map((s) => (
                <TableRow
                  key={s.player.id}
                  standing={s}
                  isFirstNonQualified={s.position === firstNonQualifiedPos}
                  direction={directions.get(s.player.id) ?? null}
                  onClick={() => setSelected(s)}
                />
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 text-xs text-text-faint px-1">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-0.75 h-4 bg-accent rounded-full" />
          Knockout qualified
        </span>
        <span className="flex items-center gap-1.5">
          ⚠️ Tiebreak required
        </span>
      </div>

      {selected && (
        <PlayerDetailModal
          standing={selected}
          allMatches={allMatches}
          playerMap={playerMap}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
