'use client'

import { useState } from 'react'
import type { Player } from '@/types'
import { PlayerAvatar } from '@/components/ui/PlayerAvatar'
import { Button } from '@/components/ui/Button'
import { PlayerEditModal } from './PlayerEditModal'

interface PlayerGridProps {
  players: Player[]
}

export function PlayerGrid({ players }: PlayerGridProps) {
  const [editing, setEditing] = useState<Player | 'new' | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {players.map((p) => (
          <PlayerCard key={p.id} player={p} onEdit={() => setEditing(p)} />
        ))}

        {players.length < 12 && (
          <button
            onClick={() => setEditing('new')}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-surface border border-dashed border-border rounded-card text-text-muted hover:border-accent hover:text-accent transition-colors min-h-[120px]"
          >
            <span className="text-2xl leading-none">+</span>
            <span className="text-xs font-medium">Add player</span>
          </button>
        )}
      </div>

      {editing !== null && (
        <PlayerEditModal
          player={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}

function PlayerCard({ player, onEdit }: { player: Player; onEdit: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-surface border border-border rounded-card">
      <PlayerAvatar player={player} size="lg" showRing />
      <div className="text-center min-w-0 w-full">
        <p className="text-sm font-medium text-text truncate">{player.name}</p>
        <span
          className="inline-block mt-1 size-3 rounded-full border border-border"
          style={{ backgroundColor: player.primary_color }}
          title={player.primary_color}
        />
      </div>
      <Button variant="secondary" size="sm" onClick={onEdit} className="w-full">
        Edit
      </Button>
    </div>
  )
}
