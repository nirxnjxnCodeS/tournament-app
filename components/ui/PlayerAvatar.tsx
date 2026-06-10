import type { Player } from '@/types'

interface PlayerAvatarProps {
  player: Player
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showRing?: boolean
  className?: string
}

const sizeMap = {
  xs: { outer: 'size-6',  text: 'text-[9px]'  },
  sm: { outer: 'size-8',  text: 'text-[11px]' },
  md: { outer: 'size-10', text: 'text-xs'     },
  lg: { outer: 'size-14', text: 'text-base'   },
  xl: { outer: 'size-20', text: 'text-xl'     },
}

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function PlayerAvatar({ player, size = 'md', showRing = false, className = '' }: PlayerAvatarProps) {
  const { outer, text } = sizeMap[size]
  const ringStyle = showRing ? { boxShadow: `0 0 0 2px ${player.primary_color}` } : undefined

  return (
    <div
      className={`${outer} rounded-full overflow-hidden shrink-0 ${className}`}
      style={ringStyle}
      title={player.name}
    >
      {player.badge_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={player.badge_url}
          alt={player.name}
          className="size-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className={`size-full flex items-center justify-center font-bold ${text}`}
          style={{ backgroundColor: player.primary_color, color: '#000' }}
        >
          {initials(player.name)}
        </div>
      )}
    </div>
  )
}
