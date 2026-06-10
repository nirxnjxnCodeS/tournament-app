'use client'

import { type InputHTMLAttributes, forwardRef, useId } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id: idProp, ...props }, ref) => {
    const generatedId = useId()
    const id = idProp ?? generatedId

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-medium text-text-muted">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          className={[
            'bg-surface-raised border rounded-lg px-3 py-2 text-sm text-text',
            'placeholder:text-text-faint',
            'transition-colors duration-150',
            'focus:outline-none focus:border-accent',
            error ? 'border-danger' : 'border-border hover:border-text-faint',
            className,
          ].join(' ')}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          {...props}
        />
        {error && (
          <p id={`${id}-error`} className="text-xs text-danger" role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${id}-hint`} className="text-xs text-text-faint">
            {hint}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
