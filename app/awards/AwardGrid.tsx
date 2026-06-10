'use client'

import type { Award } from '@/types'
import { useRealtimeMatches } from '@/hooks/useRealtimeMatches'
import { TrophyCard } from './TrophyCard'

interface AwardGridProps {
  awards: Award[]
}

export function AwardGrid({ awards }: AwardGridProps) {
  useRealtimeMatches('awards-realtime')

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {awards.map((award) => (
        <TrophyCard key={award.id} award={award} />
      ))}
    </div>
  )
}
