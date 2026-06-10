import type { Award } from '@/types'
import { PlayerAvatar } from '@/components/ui/PlayerAvatar'

interface TrophyCardProps {
  award: Award
}

export function TrophyCard({ award }: TrophyCardProps) {
  const hasWinner = award.winners.length > 0

  return (
    <div className="bg-surface border border-border rounded-card px-5 py-5 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-3xl leading-none">{award.icon}</span>
        <p className="text-xs font-semibold text-text-faint uppercase tracking-wider mt-2">{award.label}</p>
      </div>

      {hasWinner ? (
        <div className="flex flex-col gap-1">
          {/* Support joint winners (e.g. tied Golden Boot) */}
          <div className="flex flex-wrap gap-3">
            {award.winners.map((player) => (
              <div key={player.id} className="flex items-center gap-2">
                <PlayerAvatar player={player} size="sm" showRing />
                <span className="text-sm font-semibold text-text">{player.name}</span>
              </div>
            ))}
          </div>
          {award.value != null && (
            <p className="text-xs text-text-muted tabular-nums">{award.value}</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-1.5 self-start px-2 py-1 rounded-full bg-draw/15 border border-draw/30 text-[11px] font-semibold text-draw">
            In Progress
          </span>
          {award.value != null && (
            <p className="text-xs text-text-muted tabular-nums">{award.value}</p>
          )}
        </div>
      )}
    </div>
  )
}
