'use client'

import type { Player } from '@/types'
import { PlayerAvatar } from '@/components/ui/PlayerAvatar'

interface PlayerFilterChipsProps {
  players: Player[]
  activeId: string | null  // null = "All"
  onChange: (id: string | null) => void
}

export function PlayerFilterChips({ players, activeId, onChange }: PlayerFilterChipsProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto"
      style={{ scrollbarWidth: 'none' }}
    >
      {/* All chip */}
      <button
        onClick={() => onChange(null)}
        className={[
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap shrink-0 transition-colors',
          activeId === null
            ? 'border-accent text-accent bg-accent/10'
            : 'border-border text-text-muted hover:border-text-faint hover:text-text',
        ].join(' ')}
      >
        All
      </button>

      {players.map((player) => {
        const active = activeId === player.id
        const firstName = player.name.split(' ')[0]
        return (
          <button
            key={player.id}
            onClick={() => onChange(active ? null : player.id)}
            className={[
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap shrink-0 transition-colors',
              active
                ? 'border-accent text-accent bg-accent/10'
                : 'border-border text-text-muted hover:border-text-faint hover:text-text',
            ].join(' ')}
          >
            <PlayerAvatar player={player} size="xs" />
            {firstName}
          </button>
        )
      })}
    </div>
  )
}
