'use client'

import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, disabled, className = '', children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

    const variants: Record<string, string> = {
      primary:   'bg-accent text-accent-fg hover:bg-accent-hover border border-transparent',
      secondary: 'bg-transparent text-text border border-border hover:border-text-muted hover:bg-surface-raised',
      danger:    'bg-danger text-white border border-transparent hover:bg-danger-hover',
      ghost:     'bg-transparent text-text-muted border border-transparent hover:text-text hover:bg-surface-raised',
    }

    const sizes: Record<string, string> = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading && (
          <span
            className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0"
            aria-hidden
          />
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
