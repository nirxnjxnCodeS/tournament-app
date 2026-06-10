import type { Award, Player } from '@/types'
import { PlayerAvatar } from '@/components/ui/PlayerAvatar'

interface LiveAwardsStripProps {
  awards: Award[]
}

const STRIP_IDS = ['golden_boot', 'clean_sheet', 'shield'] as const
type StripId = typeof STRIP_IDS[number]

const STRIP_META: Record<StripId, { icon: string; label: string }> = {
  golden_boot: { icon: '⚽', label: 'Golden Boot'  },
  clean_sheet: { icon: '🧤', label: 'Clean Sheets' },
  shield:      { icon: '🛡️', label: 'Shield Race'  },
}

export function LiveAwardsStrip({ awards }: LiveAwardsStripProps) {
  const awardMap = new Map(awards.map((a) => [a.id, a]))

  return (
    <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
      {STRIP_IDS.map((id) => {
        const award = awardMap.get(id)
        const meta  = STRIP_META[id]
        return (
          <AwardLeaderCard
            key={id}
            icon={meta.icon}
            label={meta.label}
            award={award ?? null}
          />
        )
      })}
    </div>
  )
}

interface AwardLeaderCardProps {
  icon: string
  label: string
  award: Award | null
}

function AwardLeaderCard({ icon, label, award }: AwardLeaderCardProps) {
  const hasWinners = (award?.winners.length ?? 0) > 0
  const isTied     = (award?.winners.length ?? 0) > 1

  return (
    <div className="flex flex-col gap-2 bg-surface border border-border rounded-card px-3 py-3 shrink-0 min-w-36 flex-1">
      <div className="flex items-center gap-1.5">
        <span className="text-base leading-none">{icon}</span>
        <span className="text-[10px] font-semibold text-text-faint uppercase tracking-wider">{label}</span>
      </div>

      {!hasWinners ? (
        <p className="text-xs text-text-faint">No data yet</p>
      ) : isTied ? (
        <div className="flex flex-col gap-0.5">
          <p className="text-xs font-medium text-text-muted">{award!.winners.length} players tied</p>
          {award!.value != null && (
            <p className="text-xs text-text-faint tabular-nums">{award!.value}</p>
          )}
        </div>
      ) : (
        <LeaderRow player={award!.winners[0]} value={award!.value} />
      )}
    </div>
  )
}

function LeaderRow({ player, value }: { player: Player; value: string | number | null }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <PlayerAvatar player={player} size="xs" />
        <span className="text-xs font-semibold text-text truncate">{player.name.split(' ')[0]}</span>
      </div>
      {value != null && (
        <p className="text-xs text-text-muted tabular-nums">{value}</p>
      )}
    </div>
  )
}
