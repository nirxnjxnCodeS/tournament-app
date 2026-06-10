interface MatchdayProgressProps {
  playedCount: number
  playerCount: number
}

export function MatchdayProgress({ playedCount, playerCount }: MatchdayProgressProps) {
  const totalMatches    = Math.floor(playerCount * (playerCount - 1) / 2)
  const matchesPerRound = Math.max(Math.floor(playerCount / 2), 1)
  const totalRounds     = Math.max(playerCount - 1, 1)
  const currentRound    = Math.min(Math.ceil(playedCount / matchesPerRound) || 1, totalRounds)
  const fillPercent     = totalMatches > 0 ? Math.min((playedCount / totalMatches) * 100, 100) : 0
  const isStart         = playedCount === 0

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-text">
        Matchday {currentRound} of {totalRounds}
        {isStart && <span className="text-text-muted font-normal"> — Get started!</span>}
      </p>

      <div className="w-full h-1.5 bg-surface-raised rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500"
          style={{ width: `${fillPercent}%` }}
          role="progressbar"
          aria-valuenow={playedCount}
          aria-valuemin={0}
          aria-valuemax={totalMatches}
          aria-label={`${playedCount} of ${totalMatches} matches played`}
        />
      </div>

      <p className="text-xs text-text-muted text-right tabular-nums">
        {playedCount} of {totalMatches} matches played
      </p>
    </div>
  )
}
