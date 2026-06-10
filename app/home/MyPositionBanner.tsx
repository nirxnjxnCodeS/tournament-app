'use client'

import { useState, useEffect } from 'react'
import type { Match, Player, Standing } from '@/types'
import { PlayerAvatar } from '@/components/ui/PlayerAvatar'

const STORAGE_KEY = 'pes_my_player_id'

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

interface MyPositionBannerProps {
  standings: Standing[]
  players: Player[]
  allMatches: Match[]
}

export function MyPositionBanner({ standings, players, allMatches }: MyPositionBannerProps) {
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null)
  const [selecting, setSelecting]   = useState(false)
  const [mounted, setMounted]       = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setMyPlayerId(stored)
  }, [])

  function selectPlayer(id: string) {
    setMyPlayerId(id)
    setSelecting(false)
    localStorage.setItem(STORAGE_KEY, id)
  }

  // Avoid hydration mismatch — render nothing until client mounts
  if (!mounted) return null

  const myStanding = myPlayerId ? standings.find((s) => s.player.id === myPlayerId) : null

  // Show selector if no player chosen or user clicked "Change"
  if (!myStanding || selecting) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-text-muted px-1">Who are you?</p>
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {players.map((p) => {
            const firstName = p.name.split(' ')[0]
            return (
              <button
                key={p.id}
                onClick={() => selectPlayer(p.id)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-border text-xs font-medium whitespace-nowrap shrink-0 text-text-muted hover:border-text-faint hover:text-text transition-colors"
              >
                <PlayerAvatar player={p} size="xs" />
                {firstName}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const { player, position, points } = myStanding
  const remaining = allMatches.filter(
    (m) => (m.player_a === player.id || m.player_b === player.id) && m.status === 'pending',
  ).length

  const leader    = standings[0]
  const above     = position > 1 ? standings[position - 2] : null
  let gapText: string

  if (position === 1) {
    const ptDiff = points - (standings[1]?.points ?? points)
    gapText = ptDiff > 0 ? `Leading by ${ptDiff} pts` : `Level with ${standings[1]?.player.name ?? ''}`
  } else if (above && above.points === points) {
    gapText = `Level with ${above.player.name}`
  } else {
    const diff = leader.points - points
    gapText = `${diff} pts behind ${leader.player.name}`
  }

  return (
    <div className="relative bg-surface border border-border rounded-card px-5 py-4 pl-6 overflow-hidden">
      {/* Accent left border */}
      <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent" />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          {/* Position number */}
          <div>
            <p className="text-[10px] font-semibold text-accent uppercase tracking-widest">You</p>
            <p className="text-4xl font-bold text-accent tabular-nums leading-none">{ordinal(position)}</p>
          </div>

          {/* Player info */}
          <div className="flex items-center gap-2.5">
            <PlayerAvatar player={player} size="md" showRing />
            <div>
              <p className="text-sm font-semibold text-text">{player.name}</p>
              <p className="text-xs text-text-muted tabular-nums">{points} pts</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setSelecting(true)}
          className="text-[11px] text-text-faint hover:text-text-muted transition-colors shrink-0"
        >
          Change
        </button>
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
        <span>{gapText}</span>
        <span className="text-text-faint">·</span>
        <span>{remaining > 0 ? `${remaining} match${remaining !== 1 ? 'es' : ''} to play` : 'All played'}</span>
      </div>
    </div>
  )
}
