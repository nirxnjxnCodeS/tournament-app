import type { Standing } from '@/types'
import { PlayerAvatar } from '@/components/ui/PlayerAvatar'

interface TopThreeCardsProps {
  standings: Standing[]
}

const MEDALS = ['🥇', '🥈', '🥉']
const STREAK_ICONS: Record<'W' | 'D' | 'L', string> = { W: '🔥', D: '〰️', L: '📉' }

export function TopThreeCards({ standings }: TopThreeCardsProps) {
  const top3 = standings.slice(0, 3)
  if (top3.length === 0) return null

  return (
    <div>
      <p className="text-xs font-semibold text-text-faint uppercase tracking-wider mb-3 px-1">Top 3</p>
      <div className="grid grid-cols-3 gap-2">
        {top3.map((s, i) => (
          <div
            key={s.player.id}
            className={[
              'flex flex-col items-center gap-2 bg-surface border border-border rounded-card px-3 py-4 transition-colors',
              i === 0 ? 'border-accent/40 bg-accent/5' : '',
            ].join(' ')}
          >
            <span className="text-lg">{MEDALS[i]}</span>
            <PlayerAvatar player={s.player} size={i === 0 ? 'md' : 'sm'} showRing />
            <div className="text-center">
              <p className="text-xs font-semibold text-text truncate w-full">{s.player.name}</p>
              <p className="text-sm font-bold text-accent tabular-nums">{s.points}pts</p>
              <p className="text-[10px] text-text-faint tabular-nums">
                {s.goal_difference > 0 ? '+' : ''}{s.goal_difference} GD
              </p>
              {s.streak.type && s.streak.count >= 2 && (
                <p className={[
                  'text-[10px] font-semibold mt-0.5',
                  s.streak.type === 'W' ? 'text-win' : s.streak.type === 'L' ? 'text-loss' : 'text-text-muted',
                ].join(' ')}>
                  {STREAK_ICONS[s.streak.type]} {s.streak.count}{s.streak.type}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
