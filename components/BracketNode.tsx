import type { Match, Player } from '@/types'
import { PlayerAvatar } from '@/components/ui/PlayerAvatar'

interface BracketNodeProps {
  home: Player | null
  away: Player | null
  match: Match | null
  label: string
  compact?: boolean
}

export function BracketNode({ home, away, match, label, compact = false }: BracketNodeProps) {
  const isPlayed   = match?.status === 'played'
  const isWalkover = match?.status === 'walkover'
  const settled    = isPlayed || isWalkover

  function isWinner(player: Player | null): boolean {
    if (!player || !match || !settled) return false
    if (isWalkover) return match.walkover_winner === player.id
    return match.score_a != null && match.score_b != null && (
      (match.player_a === player.id && match.score_a > match.score_b) ||
      (match.player_b === player.id && match.score_b > match.score_a)
    )
  }

  function scoreFor(player: Player | null): string {
    if (!player || !match || !settled) return '—'
    if (isWalkover) return match.walkover_winner === player.id ? 'W/O' : '—'
    if (match.player_a === player.id) return String(match.score_a ?? '—')
    return String(match.score_b ?? '—')
  }

  const avatarSize = compact ? 'xs' as const : 'sm' as const

  return (
    <div className="flex flex-col">
      <p className="text-[10px] font-semibold text-text-faint uppercase tracking-wider mb-1.5 px-1">{label}</p>
      <div className={`bg-surface border border-border rounded-card flex flex-col ${compact ? 'w-44' : 'w-52'}`}>
        {[home, away].map((player, idx) => {
          const winner = isWinner(player)
          return (
            <div
              key={idx}
              className={[
                'flex items-center gap-2 px-3',
                compact ? 'py-1.5' : 'py-2',
                idx === 0 ? 'border-b border-border-subtle' : '',
                winner ? 'bg-accent/5' : '',
              ].join(' ')}
            >
              {player ? (
                <PlayerAvatar player={player} size={avatarSize} />
              ) : (
                <div className={`${avatarSize === 'xs' ? 'size-6' : 'size-8'} rounded-full bg-surface-raised shrink-0`} />
              )}
              <span className={[
                'flex-1 truncate',
                compact ? 'text-xs' : 'text-sm',
                winner ? 'text-accent font-semibold' : player ? 'text-text-muted' : 'text-text-faint',
              ].join(' ')}>
                {player?.name ?? 'TBD'}
              </span>
              <span className={[
                'tabular-nums shrink-0',
                compact ? 'text-xs' : 'text-sm',
                winner ? 'text-accent font-bold' : 'text-text-faint',
              ].join(' ')}>
                {settled ? scoreFor(player) : '—'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
