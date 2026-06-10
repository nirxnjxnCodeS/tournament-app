const TOTAL_MATCHES   = 66
const MATCHES_PER_DAY = 6
const TOTAL_MATCHDAYS = 11

interface MatchdayProgressProps {
  playedCount: number
}

export function MatchdayProgress({ playedCount }: MatchdayProgressProps) {
  const matchday    = Math.min(Math.ceil(playedCount / MATCHES_PER_DAY) || 1, TOTAL_MATCHDAYS)
  const fillPercent = Math.min((playedCount / TOTAL_MATCHES) * 100, 100)
  const isStart     = playedCount === 0

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-text">
        Matchday {matchday} of {TOTAL_MATCHDAYS}
        {isStart && <span className="text-text-muted font-normal"> — Get started!</span>}
      </p>

      <div className="w-full h-1.5 bg-surface-raised rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500"
          style={{ width: `${fillPercent}%` }}
          role="progressbar"
          aria-valuenow={playedCount}
          aria-valuemin={0}
          aria-valuemax={TOTAL_MATCHES}
          aria-label={`${playedCount} of ${TOTAL_MATCHES} matches played`}
        />
      </div>

      <p className="text-xs text-text-muted text-right tabular-nums">
        {playedCount} of {TOTAL_MATCHES} matches played
      </p>
    </div>
  )
}
