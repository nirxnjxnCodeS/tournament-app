'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase'

export function useRealtimeMatches(channelName: string) {
  const router = useRouter()
  const [reconnecting, setReconnecting] = useState(false)

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return

    const supabase = getSupabaseBrowser()

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
        router.refresh()
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setReconnecting(true)
        if (status === 'SUBSCRIBED') setReconnecting(false)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelName, router])

  return { reconnecting }
}
