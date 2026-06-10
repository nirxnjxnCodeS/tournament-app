interface FormErrorProps {
  message: string | null | undefined
  className?: string
}

export function FormError({ message, className = '' }: FormErrorProps) {
  if (!message) return null
  return (
    <p className={`text-sm text-danger ${className}`} role="alert">
      {message}
    </p>
  )
}

interface AlertProps {
  variant?: 'error' | 'warning' | 'info'
  title?: string
  children: React.ReactNode
  className?: string
}

const alertStyles = {
  error:   'bg-danger/10 border-danger/30 text-danger',
  warning: 'bg-draw/10 border-draw/30 text-draw',
  info:    'bg-accent/10 border-accent/30 text-accent',
}

export function Alert({ variant = 'error', title, children, className = '' }: AlertProps) {
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${alertStyles[variant]} ${className}`} role="alert">
      {title && <p className="font-semibold mb-0.5">{title}</p>}
      <div>{children}</div>
    </div>
  )
}
