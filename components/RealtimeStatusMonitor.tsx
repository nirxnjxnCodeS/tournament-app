'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase'
import { ReconnectBanner } from '@/components/ui/ReconnectBanner'

export function RealtimeStatusMonitor() {
  const [reconnecting, setReconnecting] = useState(false)

  useEffect(() => {
    // Guard: don't attempt connection if Supabase isn't configured yet
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return

    const supabase = getSupabaseBrowser()

    const channel = supabase
      .channel('__status__')
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setReconnecting(true)
        if (status === 'SUBSCRIBED') setReconnecting(false)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return <ReconnectBanner visible={reconnecting} />
}
