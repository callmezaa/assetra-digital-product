'use client'

import Image from 'next/image'
import { User, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOnlineUsers } from '@/hooks/useOnlineUsers'

interface ChatListProps {
  rooms: any[]
  activeRoomId: string | null
  onRoomSelect: (roomId: string) => void
  currentUserId: string
}

export default function ChatList({ rooms, activeRoomId, onRoomSelect, currentUserId }: ChatListProps) {
  // Real-time presence: track and observe online users across all chats
  const onlineUserIds = useOnlineUsers(currentUserId)

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 opacity-50">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <MessageSquare className="h-6 w-6" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest">No messages yet</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
      {rooms.map((room) => {
        const isOnline = room.otherUser?.id ? onlineUserIds.has(room.otherUser.id) : false

        return (
          <button
            key={room.id}
            onClick={() => onRoomSelect(room.id)}
            className={cn(
              "w-full pl-9 pr-6 py-5 flex items-start gap-4 transition-all duration-300 text-left group relative border-b border-black/[0.02]",
              activeRoomId === room.id
                ? "bg-primary/[0.03]"
                : "hover:bg-black/[0.01]"
            )}
          >
            {activeRoomId === room.id && (
              <div className="absolute left-0 top-4 bottom-4 w-1 bg-primary rounded-r-full shadow-[2px_0_10px_rgba(var(--primary-rgb),0.3)]" />
            )}

            {/* Avatar with real online indicator */}
            <div className="relative flex-shrink-0">
              <div className={cn(
                "h-12 w-12 rounded-2xl bg-black/5 border border-black/5 overflow-hidden transition-all duration-500 group-hover:scale-105 group-hover:-rotate-1 shadow-sm relative",
                activeRoomId === room.id ? "border-primary/20" : ""
              )}>
                {room.otherUser?.avatar_url ? (
                  <Image
                    src={room.otherUser.avatar_url}
                    alt={room.otherUser.full_name || 'User'}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-muted/20 text-muted-foreground/30">
                    <User className="h-6 w-6" />
                  </div>
                )}
              </div>

              {/* Real presence indicator — green if online, grey if offline */}
              <div
                title={isOnline ? 'Online' : 'Offline'}
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm transition-colors duration-500",
                  isOnline
                    ? "bg-green-500 shadow-green-500/40 shadow-[0_0_6px_2px_rgba(34,197,94,0.4)]"
                    : "bg-muted-foreground/25"
                )}
              />
            </div>

            <div className="flex-1 min-w-0 py-0.5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <h4 className={cn(
                    "font-semibold text-[14px] tracking-tight truncate transition-colors",
                    activeRoomId === room.id ? "text-primary" : "text-foreground group-hover:text-primary"
                  )}>
                    {room.otherUser?.full_name || room.otherUser?.username || 'User'}
                  </h4>
                  {isOnline && (
                    <span className="text-[9px] font-black text-green-500 uppercase tracking-widest whitespace-nowrap">
                      • Online
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium text-muted-foreground/30 whitespace-nowrap ml-2">
                  {room.last_message_at
                    ? new Date(room.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : ''}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <p className={cn(
                  "text-[13px] line-clamp-1 font-medium transition-colors flex-1",
                  activeRoomId === room.id ? "text-foreground/40" : "text-muted-foreground/30 group-hover:text-foreground/40"
                )}>
                  {room.last_message || 'No messages yet'}
                </p>
                {room.unreadCount > 0 && (
                  <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]" />
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
