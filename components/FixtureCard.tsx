import Link from 'next/link'
import type { Match, Player } from '@/types'
import { PlayerAvatar } from '@/components/ui/PlayerAvatar'

interface FixtureCardProps {
  match: Match
  playerA: Player
  playerB: Player
  compact?: boolean
  onAdminClick?: () => void
}

type ResultTag = 'W' | 'D' | 'L'

const tagStyles: Record<ResultTag, string> = {
  W: 'bg-win/15 text-win',
  D: 'bg-draw/15 text-draw',
  L: 'bg-loss/15 text-loss',
}

function ResultPill({ result }: { result: ResultTag }) {
  return (
    <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tagStyles[result]}`}>
      {result}
    </span>
  )
}

function getResults(match: Match, playerA: Player, playerB: Player): [ResultTag | null, ResultTag | null] {
  if (match.status === 'played' && match.score_a != null && match.score_b != null) {
    if (match.score_a > match.score_b) return ['W', 'L']
    if (match.score_b > match.score_a) return ['L', 'W']
    return ['D', 'D']
  }
  if (match.status === 'walkover') {
    const aWon = match.walkover_winner === playerA.id
    return aWon ? ['W', 'L'] : ['L', 'W']
  }
  return [null, null]
}

export function FixtureCard({ match, playerA, playerB, compact = false, onAdminClick }: FixtureCardProps) {
  const isPlayed   = match.status === 'played'
  const isWalkover = match.status === 'walkover'
  const isPending  = match.status === 'pending'

  const [resultA, resultB] = getResults(match, playerA, playerB)

  const px = compact ? 'px-3 py-2' : 'px-4 py-3'
  const avatarSize = compact ? 'sm' as const : 'md' as const

  return (
    <div className={`relative flex flex-col bg-surface border border-border rounded-card ${compact ? 'gap-0' : 'gap-0'} group`}>
      <div className={`flex items-center gap-3 ${px}`}>
        {/* Player A */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <PlayerAvatar player={playerA} size={avatarSize} />
          <span className={[
            'truncate text-sm font-medium',
            resultA === 'W' ? 'text-text' : isPending ? 'text-text-muted' : 'text-text-muted',
          ].join(' ')}>
            {playerA.name}
          </span>
          {resultA && <ResultPill result={resultA} />}
        </div>

        {/* Score / vs */}
        <div className="shrink-0 flex flex-col items-center gap-0.5 min-w-14">
          {isPending && (
            <span className="text-xs font-semibold text-text-faint tracking-widest">vs</span>
          )}
          {isPlayed && (
            <span className="text-sm font-bold text-text tabular-nums">
              {match.score_a} – {match.score_b}
            </span>
          )}
          {isWalkover && (
            <>
              <span className="text-sm font-bold text-text">W/O</span>
              <span className="text-[10px] font-medium text-walkover leading-none">walkover</span>
            </>
          )}
          {!compact && match.played_at && (
            <span className="text-[10px] text-text-faint mt-0.5">
              {new Date(match.played_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>

        {/* Player B */}
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          {resultB && <ResultPill result={resultB} />}
          <span className={[
            'truncate text-sm font-medium text-right',
            resultB === 'W' ? 'text-text' : isPending ? 'text-text-muted' : 'text-text-muted',
          ].join(' ')}>
            {playerB.name}
          </span>
          <PlayerAvatar player={playerB} size={avatarSize} />
        </div>

        {/* Admin pencil FAB */}
        {onAdminClick && (
          <button
            onClick={onAdminClick}
            className="absolute -right-2 -top-2 size-7 rounded-full bg-accent text-accent-fg flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-card"
            aria-label="Edit score"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M8.5 1.5l2 2L3 11H1V9L8.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* View result link for played matches */}
      {(isPlayed || isWalkover) && !compact && (
        <div className="px-4 pb-2">
          <Link
            href={`/result/${match.id}`}
            className="text-[11px] text-text-faint hover:text-text-muted transition-colors"
          >
            View result →
          </Link>
        </div>
      )}
    </div>
  )
}
