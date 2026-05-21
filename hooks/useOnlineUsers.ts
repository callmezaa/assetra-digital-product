'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Hook to track which users are currently online using Supabase Presence.
 * All connected users join a shared 'online_users' channel and broadcast their presence.
 * Returns a Set of online user IDs.
 */
export function useOnlineUsers(currentUserId: string) {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!currentUserId) return

    const supabase = createClient()

    const channel = supabase.channel('online_users', {
      config: {
        presence: { key: currentUserId },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        // Each key in presenceState is a user ID
        const ids = new Set(Object.keys(state))
        setOnlineUserIds(ids)
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setOnlineUserIds((prev) => new Set([...prev, key]))
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUserIds((prev) => {
          const next = new Set(prev)
          next.delete(key)
          return next
        })
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      channel.untrack()
      supabase.removeChannel(channel)
    }
  }, [currentUserId])

  return onlineUserIds
}
