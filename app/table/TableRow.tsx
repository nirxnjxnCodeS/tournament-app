'use client'

import { motion } from 'framer-motion'
import type { Standing } from '@/types'
import { PlayerAvatar } from '@/components/ui/PlayerAvatar'
import { FormStrip } from '@/components/ui/FormDot'
import { Tooltip } from '@/components/ui/Tooltip'

interface TableRowProps {
  standing: Standing
  isFirstNonQualified: boolean
  direction?: 'up' | 'down' | null
  onClick: () => void
}

const STREAK_ICONS: Record<'W' | 'D' | 'L', string> = { W: '🔥', D: '〰️', L: '📉' }

export function TableRow({ standing: s, isFirstNonQualified, direction, onClick }: TableRowProps) {
  const { player, position, qualified, tied } = s

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={onClick}
      className={[
        'border-b border-border-subtle cursor-pointer transition-colors hover:bg-surface-raised group',
        isFirstNonQualified ? 'border-t-2 border-t-dashed border-t-border' : '',
      ].join(' ')}
    >
      {/* Qualified accent border */}
      <td className="relative pl-0 pr-2 py-2.5 w-1">
        {qualified && (
          <span className="absolute left-0 top-0 bottom-0 w-0.75 bg-accent rounded-r-full" />
        )}
      </td>

      {/* Pos */}
      <td className="pr-3 py-2.5 text-sm tabular-nums w-7 text-right">
        <span className="relative inline-flex items-center gap-1">
          <span className="text-text-muted">{position}</span>
          {direction === 'up' && (
            <span className="text-win text-[10px] font-bold leading-none">↑</span>
          )}
          {direction === 'down' && (
            <span className="text-loss text-[10px] font-bold leading-none">↓</span>
          )}
        </span>
      </td>

      {/* Player */}
      <td className="py-2.5 pr-4">
        <div className="flex items-center gap-2 min-w-0">
          <PlayerAvatar player={player} size="sm" />
          <span className="text-sm font-medium text-text truncate">{player.name}</span>
          {tied && (
            <Tooltip content="Admin tiebreak required" side="top">
              <span className="text-xs cursor-help" aria-label="Tied">⚠️</span>
            </Tooltip>
          )}
        </div>
      </td>

      {/* Stats */}
      {[s.played, s.won, s.drawn, s.lost, s.goals_for, s.goals_against].map((val, i) => (
        <td key={i} className="py-2.5 px-2 text-sm tabular-nums text-text-muted text-right w-8">
          {val}
        </td>
      ))}

      {/* GD */}
      <td className="py-2.5 px-2 text-sm tabular-nums text-right w-10">
        <span className={s.goal_difference > 0 ? 'text-win' : s.goal_difference < 0 ? 'text-loss' : 'text-text-muted'}>
          {s.goal_difference > 0 ? `+${s.goal_difference}` : s.goal_difference}
        </span>
      </td>

      {/* PTS */}
      <td className="py-2.5 pl-2 pr-3 text-sm tabular-nums font-bold text-text text-right w-9">
        {s.points}
      </td>

      {/* Form */}
      <td className="py-2.5 pl-2 pr-2 w-20">
        <FormStrip form={s.form} />
      </td>

      {/* Streak badge */}
      <td className="py-2.5 pl-1 pr-2 w-14">
        {s.streak.type && s.streak.count >= 2 && (
          <span className={[
            'text-[10px] font-semibold whitespace-nowrap',
            s.streak.type === 'W' ? 'text-win' : s.streak.type === 'L' ? 'text-loss' : 'text-text-muted',
          ].join(' ')}>
            {STREAK_ICONS[s.streak.type]} {s.streak.count}{s.streak.type}
          </span>
        )}
      </td>

      {/* Stats cue */}
      <td className="py-2.5 pl-1 pr-3 w-12">
        <div className="flex items-center justify-end gap-1 text-text-muted group-hover:text-text transition-colors">
          <span className="hidden md:block text-xs">Stats</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </td>
    </motion.tr>
  )
}
