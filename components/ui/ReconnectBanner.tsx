'use client'

// Shown when Supabase realtime loses connection (edge case 6)
interface ReconnectBannerProps {
  visible: boolean
}

export function ReconnectBanner({ visible }: ReconnectBannerProps) {
  if (!visible) return null
  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-surface-overlay border border-border text-xs text-text-muted shadow-card animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <span className="size-2 rounded-full bg-draw animate-pulse" aria-hidden />
      Reconnecting…
    </div>
  )
}
