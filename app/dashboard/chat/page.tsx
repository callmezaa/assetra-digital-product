'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, LayoutDashboard, Search, Filter } from 'lucide-react'
import DashboardSidebar from '@/components/DashboardSidebar'
import HeroAnimations from '@/components/HeroAnimations'
import ChatList from './ChatList'
import ChatWindow from './ChatWindow'
import ChatContextSidebar from './ChatContextSidebar'
import { getChatRooms } from './actions'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function ChatDashboard() {
  const [rooms, setRooms] = useState<any[]>([])
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
      
      const chatRooms = await getChatRooms()
      setRooms(chatRooms)
      setLoading(false)
    }
    init()

    // Subscribe to room updates (last message etc)
    const channel = supabase
      .channel('chat_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_rooms' },
        async () => {
          const updatedRooms = await getChatRooms()
          setRooms(updatedRooms)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'assets' | 'general'>('all')

  const filteredRooms = rooms.filter(room => {
    if (activeFilter === 'unread') return room.unreadCount > 0
    if (activeFilter === 'assets') return room.productInterest !== null
    if (activeFilter === 'general') return room.productInterest === null
    return true
  })

  const activeRoom = rooms.find(r => r.id === activeRoomId)

  return (
    <div className="flex bg-muted/5 min-h-[calc(100vh-64px)]">
      <DashboardSidebar />
      
      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-hidden flex flex-col">
        <HeroAnimations>
          <div className="max-w-7xl mx-auto w-full flex flex-col h-[calc(100vh-160px)]">
            
            {/* Header */}
            <div className="animate-title opacity-0 flex items-center justify-between mb-10 px-2 md:px-0">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 shadow-sm">
                  <MessageSquare className="h-8 w-8 text-primary/60" />
                </div>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground/90">Messages</h1>
                  <p className="text-[14px] text-muted-foreground/50 font-medium">Connect with your community and partners.</p>
                </div>
              </div>
            </div>

            {/* Chat Container */}
            <div className="animate-desc opacity-0 flex-1 flex bg-white/40 backdrop-blur-2xl border border-black/[0.03] rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] overflow-hidden relative group">
              
              {/* Immersive Background Glows */}
              <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[60%] bg-primary/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000" />
              <div className="absolute -bottom-[20%] -left-[10%] w-[40%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-1000" />
              
              {/* Sidebar: Chat List */}
              <div className={cn(
                "w-full md:w-80 lg:w-80 flex-shrink-0 border-r border-black/[0.03] flex flex-col bg-white/5 transition-all duration-500",
                activeRoomId ? "hidden md:flex" : "flex"
              )}>
                <div className="pl-10 pr-6 pt-8 pb-6 border-b border-black/[0.02] space-y-5">
                    <div className="relative group/search">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/20 group-focus-within/search:text-primary/50 transition-colors" />
                       <input 
                         placeholder="Search conversations..." 
                         className="w-full h-10 bg-black/[0.02] border border-black/[0.03] rounded-xl pl-10 text-[13px] font-medium focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/10 outline-none transition-all placeholder:text-muted-foreground/30"
                       />
                    </div>

                    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                       {[
                         { id: 'all', label: 'All' },
                         { id: 'unread', label: 'Unread' },
                         { id: 'assets', label: 'Assets' },
                         { id: 'general', label: 'General' }
                       ].map(filter => (
                         <button
                           key={filter.id}
                           onClick={() => setActiveFilter(filter.id as any)}
                           className={cn(
                             "px-4 py-1.5 rounded-lg text-[12px] font-medium transition-all whitespace-nowrap",
                             activeFilter === filter.id 
                               ? "bg-primary/10 text-primary border border-primary/10 shadow-sm" 
                               : "bg-transparent border border-transparent text-muted-foreground/50 hover:bg-black/[0.02] hover:text-muted-foreground/80"
                           )}
                         >
                           {filter.label}
                         </button>
                       ))}
                    </div>
                </div>
                <ChatList 
                  rooms={filteredRooms} 
                  activeRoomId={activeRoomId} 
                  onRoomSelect={setActiveRoomId} 
                  currentUserId={currentUser?.id}
                />
              </div>

              {/* Content: Chat Window */}
              <div className={cn(
                "flex-1 flex flex-col md:flex-row relative bg-muted/5 transition-all duration-500 min-w-0",
                !activeRoomId ? "hidden md:flex" : "flex"
              )}>
                <div className="flex-1 min-w-0 flex flex-col md:flex-row bg-transparent relative">
                  {activeRoom ? (
                    <>
                      <div className="flex-1 min-w-0 flex flex-col border-r border-black/[0.03] w-full">
                         <ChatWindow 
                           roomId={activeRoom.id} 
                           currentUser={currentUser}
                           otherUser={activeRoom.otherUser}
                           onClose={() => setActiveRoomId(null)}
                         />
                      </div>
                      
                      {/* Contextual Sidebar (Pane 3) */}
                      <div className="hidden lg:block w-72 flex-shrink-0 bg-white/10 backdrop-blur-md overflow-y-auto">
                         <ChatContextSidebar 
                           roomId={activeRoom.id}
                           otherUser={activeRoom.otherUser}
                         />
                      </div>
                    </>
                  ) : (
                    <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-12 space-y-6 w-full">
                        <div className="relative mb-8">
                           <div className="h-28 w-28 rounded-[3rem] bg-primary/5 border border-primary/10 flex items-center justify-center animate-pulse relative">
                              <MessageSquare className="h-12 w-12 text-primary/40" />
                              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
                           </div>
                           <div className="absolute -top-3 -right-3 h-10 w-10 rounded-2xl bg-background border border-white/10 flex items-center justify-center shadow-2xl">
                              <LayoutDashboard className="h-5 w-5 text-primary" />
                           </div>
                        </div>
                        <div className="space-y-4">
                           <h3 className="text-2xl font-black tracking-tight">Your Inbox</h3>
                           <p className="text-muted-foreground/60 max-w-sm text-sm font-medium leading-relaxed">
                              Select a conversation from the sidebar to start messaging. All chats are end-to-end encrypted for your safety.
                           </p>
                        </div>
                     </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </HeroAnimations>
      </main>
    </div>
  )
}

