'use client'

import type { KnockoutBracket, TournamentStage } from '@/types'
import { useRealtimeMatches } from '@/hooks/useRealtimeMatches'
import { BracketNode } from '@/components/BracketNode'
import { PlayerAvatar } from '@/components/ui/PlayerAvatar'

interface BracketTreeProps {
  bracket: KnockoutBracket
  stage: TournamentStage
}

export function BracketTree({ bracket, stage }: BracketTreeProps) {
  useRealtimeMatches('bracket-realtime')

  return (
    <div className="flex flex-col gap-6">
      {/* Champion card (completed stage) */}
      {stage === 'completed' && bracket.champion && (
        <div className="flex items-center gap-4 bg-accent/10 border border-accent/30 rounded-card px-5 py-4">
          <span className="text-3xl">🏆</span>
          <div>
            <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">Champion</p>
            <div className="flex items-center gap-2">
              <PlayerAvatar player={bracket.champion} size="sm" showRing />
              <span className="text-base font-bold text-text">{bracket.champion.name}</span>
            </div>
          </div>
        </div>
      )}

      {/* Desktop: SF columns left, Final right */}
      <div className="hidden md:flex items-center gap-0">
        {/* SF column */}
        <div className="flex flex-col gap-8">
          <BracketNode
            home={bracket.sf1.home}
            away={bracket.sf1.away}
            match={bracket.sf1.match}
            label="Semi-final 1"
          />
          <BracketNode
            home={bracket.sf2.home}
            away={bracket.sf2.away}
            match={bracket.sf2.match}
            label="Semi-final 2"
          />
        </div>

        {/* Connector lines */}
        <svg width="64" height="180" className="shrink-0" aria-hidden>
          {/* SF1 arm */}
          <line x1="0" y1="38" x2="32" y2="38"  stroke="#2e2e2e" strokeWidth="1.5"/>
          {/* SF2 arm */}
          <line x1="0" y1="142" x2="32" y2="142" stroke="#2e2e2e" strokeWidth="1.5"/>
          {/* Vertical connector */}
          <line x1="32" y1="38"  x2="32" y2="142" stroke="#2e2e2e" strokeWidth="1.5"/>
          {/* Final arm */}
          <line x1="32" y1="90"  x2="64" y2="90"  stroke="#2e2e2e" strokeWidth="1.5"/>
        </svg>

        {/* Final */}
        <BracketNode
          home={bracket.final.home}
          away={bracket.final.away}
          match={bracket.final.match}
          label="Final"
        />
      </div>

      {/* Mobile: vertical stack */}
      <div className="flex md:hidden flex-col gap-4">
        <BracketNode
          home={bracket.sf1.home}
          away={bracket.sf1.away}
          match={bracket.sf1.match}
          label="Semi-final 1"
        />
        <div className="flex justify-center">
          <svg width="2" height="24" aria-hidden>
            <line x1="1" y1="0" x2="1" y2="24" stroke="#2e2e2e" strokeWidth="1.5"/>
          </svg>
        </div>
        <BracketNode
          home={bracket.sf2.home}
          away={bracket.sf2.away}
          match={bracket.sf2.match}
          label="Semi-final 2"
        />
        <div className="flex justify-center">
          <svg width="2" height="24" aria-hidden>
            <line x1="1" y1="0" x2="1" y2="24" stroke="#2e2e2e" strokeWidth="1.5"/>
          </svg>
        </div>
        <BracketNode
          home={bracket.final.home}
          away={bracket.final.away}
          match={bracket.final.match}
          label="Final"
        />
      </div>
    </div>
  )
}
