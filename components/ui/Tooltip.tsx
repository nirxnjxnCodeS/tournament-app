'use client'

import { type ReactNode, useState } from 'react'

interface TooltipProps {
  content: string
  children: ReactNode
  side?: 'top' | 'bottom'
}

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false)

  const posClass = side === 'top'
    ? 'bottom-full mb-2'
    : 'top-full mt-2'

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={[
            'absolute left-1/2 -translate-x-1/2 z-50',
            posClass,
            'whitespace-nowrap rounded-md bg-surface-overlay border border-border',
            'px-2.5 py-1 text-xs text-text shadow-card',
            'pointer-events-none animate-fade-in',
          ].join(' ')}
        >
          {content}
        </span>
      )}
    </span>
  )
}
