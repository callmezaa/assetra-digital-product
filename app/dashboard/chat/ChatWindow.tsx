import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Send, User, Loader2, ShieldCheck, X, Image as ImageIcon, Paperclip, Smile, Zap, Eye, Search, Check, CheckCheck, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { sendMessage, markAsRead } from './actions'
import { uploadChatAttachment } from './upload-actions'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface Message {
  id: string
  room_id: string
  sender_id: string
  content: string
  type: 'text' | 'image' | 'file'
  attachment_url?: string
  created_at: string
  is_read: boolean
}

interface ChatWindowProps {
  roomId: string
  currentUser: any
  otherUser: any
  onClose?: () => void
}

const QUICK_RESPONSES = [
  "Is this asset still available?",
  "Thank you for the quick response!",
  "Can I use this for commercial projects?",
  "I've just made the purchase!",
  "Great work on this asset!"
]

export default function ChatWindow({ roomId, currentUser, otherUser, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isOtherTyping, setIsOtherTyping] = useState(false)
  const [isOtherOnline, setIsOtherOnline] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const presenceChannelRef = useRef<any>(null)
  const supabase = createClient()

  const filteredMessages = messages.filter(msg => 
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    fetchMessages()
    markAsRead(roomId)

    // Subscribe to new messages
    const msgChannel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          const msg = payload.new as Message
          setMessages((prev) => {
            if (prev.find(m => m.id === msg.id)) return prev
            return [...prev, msg]
          })
          if (msg.sender_id !== currentUser.id) {
            markAsRead(roomId)
          }
        }
      )
      .subscribe()

    // Real-time Presence (Online & Typing)
    const presenceChannel = supabase.channel(`presence:${roomId}`, {
      config: { presence: { key: currentUser.id } }
    })

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        const otherPresence = state[otherUser.id] as any[]
        setIsOtherOnline(!!otherPresence && otherPresence.length > 0)
        setIsOtherTyping(!!otherPresence && otherPresence.some(p => p.isTyping))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          presenceChannelRef.current = presenceChannel
          await presenceChannel.track({
            online_at: new Date().toISOString(),
            isTyping: false
          })
        }
      })

    return () => {
      presenceChannelRef.current = null
      supabase.removeChannel(msgChannel)
      supabase.removeChannel(presenceChannel)
    }
  }, [roomId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOtherTyping])

  // Handle typing state
  useEffect(() => {
    if (!presenceChannelRef.current) return
    const timeout = setTimeout(() => {
      presenceChannelRef.current.track({ 
        online_at: new Date().toISOString(),
        isTyping: newMessage.length > 0 
      }).catch(console.error)
    }, 100)
    return () => clearTimeout(timeout)
  }, [newMessage])

  async function fetchMessages() {
    setLoading(true)
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })

    if (error) console.error('Error fetching messages:', error)
    else setMessages(data || [])
    setLoading(false)
  }

  async function handleSend(e?: React.FormEvent, contentOverride?: string) {
    if (e) e.preventDefault()
    const content = contentOverride || newMessage.trim()
    if (!content && !contentOverride) return
    if (sending) return

    setSending(true)
    setNewMessage('')
    
    const result = await sendMessage(roomId, content)
    if ('error' in result) {
      toast.error(result.error)
      if (!contentOverride) setNewMessage(content)
    }
    setSending(false)
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    const result = await uploadChatAttachment(formData)
    if (result.success && result.url) {
      await sendMessage(roomId, `Sent an image: ${file.name}`, 'image', result.url)
      toast.success('Image sent!')
    } else {
      toast.error(result.error || 'Failed to upload image')
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="flex flex-col h-full w-full max-w-full bg-white/10 overflow-hidden relative min-w-0">
      {/* Immersive Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Header */}
      <div className="px-4 md:px-8 py-5 bg-white/40 backdrop-blur-xl border-b border-black/[0.03] flex items-center justify-between z-10 w-full min-w-0">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="h-12 w-12 rounded-2xl bg-black/5 border border-black/5 overflow-hidden transition-all duration-500 group-hover:scale-105 shadow-sm">
              {otherUser.avatar_url ? (
                <img src={otherUser.avatar_url} alt={otherUser.full_name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary/5 text-primary/30">
                  <User className="h-6 w-6" />
                </div>
              )}
            </div>
            <div className={cn(
              "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm transition-colors",
              isOtherOnline ? "bg-green-500" : "bg-muted-foreground/30"
            )} />
          </div>
          <div>
            <Link href={`/profile/${otherUser.username || otherUser.id}`}>
              <h3 className="font-bold text-[14px] hover:text-primary transition-colors cursor-pointer flex items-center gap-2">
                {otherUser.full_name || 'Creator'}
                <div className="h-4 w-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <ShieldCheck className="h-2.5 w-2.5 text-primary" />
                </div>
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                 <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.15em]">
                   {isOtherOnline ? 'Active Now' : 'Last seen recently'}
                 </p>
                 {isOtherTyping && (
                   <>
                     <span className="text-[10px] text-muted-foreground/20">•</span>
                     <p className="text-[10px] font-bold text-primary animate-pulse italic">typing...</p>
                   </>
                 )}
              </div>
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex items-center">
             <AnimatePresence>
               {isSearchOpen && (
                 <motion.div
                   initial={{ width: 0, opacity: 0 }}
                   animate={{ width: 240, opacity: 1 }}
                   exit={{ width: 0, opacity: 0 }}
                   className="overflow-hidden mr-2"
                 >
                   <input 
                     autoFocus
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Search in chat..."
                     className="w-full h-10 bg-black/5 border border-black/5 rounded-xl px-4 text-[11px] font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                   />
                 </motion.div>
               )}
             </AnimatePresence>
             <Button 
               variant="ghost" 
               size="icon" 
               className={cn(
                 "rounded-2xl h-10 w-10 transition-all",
                 isSearchOpen ? "bg-primary/10 text-primary" : "bg-black/5 text-muted-foreground/30 hover:bg-black/10"
               )}
               onClick={() => {
                 setIsSearchOpen(!isSearchOpen)
                 if (isSearchOpen) setSearchQuery('')
               }}
             >
               <Search className="h-4 w-4" />
             </Button>
          </div>
          
          <div className="hidden sm:flex flex-col items-end mr-2">
             <span className="text-[11px] font-medium text-muted-foreground/30 leading-tight">Response time</span>
             <span className="text-[12px] font-semibold text-green-600/50 tracking-tight">Fast (~5m)</span>
          </div>
          {onClose && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl h-10 w-10 bg-black/[0.03] hover:bg-black/[0.05] border border-black/[0.05] md:hidden" 
              onClick={onClose}
              aria-label="Back to chat list"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-8 py-8 space-y-6 scrollbar-hide"
      >
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary/10" />
          </div>
        ) : (
          <div className="space-y-6 pb-6">
            <AnimatePresence initial={false}>
              {filteredMessages.map((msg, idx) => {
                const isMine = msg.sender_id === currentUser.id
                const showAvatar = !isMine && (idx === 0 || messages[idx-1].sender_id !== msg.sender_id)
                
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 150 }}
                    className={cn(
                      "flex items-end gap-3 group",
                      isMine ? "justify-end" : "justify-start"
                    )}
                  >
                    {!isMine && (
                      <div className="w-8 h-8 flex-shrink-0">
                        {showAvatar && (
                          <div className="w-8 h-8 rounded-xl overflow-hidden border border-black/5 shadow-sm">
                            <img 
                              src={otherUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${otherUser.username}`} 
                              alt="" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className={cn(
                      "max-w-[70%] relative flex flex-col",
                      isMine ? "items-end" : "items-start"
                    )}>
                      <div className={cn(
                        "px-5 py-3.5 rounded-[1.5rem] text-[13px] relative overflow-hidden transition-all duration-300",
                        isMine 
                          ? "bg-primary/90 text-primary-foreground rounded-br-none shadow-[0_4px_20px_-4px_rgba(var(--primary-rgb),0.3)] font-medium" 
                          : "bg-white/70 backdrop-blur-md border border-black/[0.03] text-foreground/80 rounded-bl-none shadow-sm hover:bg-white/80 font-medium"
                      )}>
                        {isMine && (
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                        )}
                        
                        {msg.type === 'image' && msg.attachment_url ? (
                          <div className="space-y-3">
                             <div className="relative group/img overflow-hidden rounded-xl border border-black/5 bg-black/5">
                               <img src={msg.attachment_url} alt="Shared" className="max-h-60 w-full object-contain transition-transform duration-500 group-hover:scale-105" />
                               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                                  <a 
                                    href={msg.attachment_url} 
                                    target="_blank" 
                                    className="p-3 rounded-full bg-white/20 border border-white/20 hover:bg-white/30 transition-all"
                                    aria-label="View full image"
                                    title="View full image"
                                  >
                                     <Eye className="h-5 w-5 text-white" />
                                  </a>
                               </div>
                             </div>
                             <p className="leading-relaxed font-medium opacity-40 text-[11px] tracking-tight">{msg.content}</p>
                          </div>
                        ) : (
                          <p className="leading-relaxed relative z-10">{msg.content}</p>
                        )}
                      </div>
                      <div className={cn(
                        "flex items-center gap-1.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        isMine ? "flex-row-reverse" : "flex-row"
                      )}>
                        <span className="text-[9px] font-bold tracking-tight text-muted-foreground/40">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMine && (
                           msg.is_read ? (
                             <CheckCheck className="h-3 w-3 text-primary" />
                           ) : (
                             <Check className="h-3 w-3 text-muted-foreground/30" />
                           )
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {isOtherTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 ml-11"
              >
                <div className="flex gap-1 p-2 bg-white/40 backdrop-blur-sm rounded-full border border-black/[0.03]">
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                </div>
                <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">Typing...</span>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Quick Responses Bar */}
      {!loading && messages.length < 20 && (
        <div className="px-8 py-3.5 flex gap-2 overflow-x-auto scrollbar-hide border-t border-black/[0.03] bg-white/20 backdrop-blur-xl">
           {QUICK_RESPONSES.map((resp) => (
             <button
               key={resp}
               onClick={() => handleSend(undefined, resp)}
               className="whitespace-nowrap px-4 py-2 rounded-full bg-white/40 border border-black/5 text-[10px] font-bold text-muted-foreground/60 hover:bg-primary/5 hover:border-primary/10 hover:text-primary transition-all duration-300 shadow-sm"
             >
               {resp}
             </button>
           ))}
        </div>
      )}

      {/* Input Section */}
      <div className="p-8 bg-white/40 backdrop-blur-xl border-t border-black/[0.03]">
        <form onSubmit={handleSend} className="relative">
          <div className="relative flex items-center gap-2 bg-white/60 border border-black/[0.05] rounded-[1.5rem] p-1.5 focus-within:border-primary/20 focus-within:shadow-xl focus-within:shadow-primary/5 transition-all duration-500">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*"
              aria-label="Upload image"
              title="Upload image"
            />
            <Button 
              type="button"
              variant="ghost" 
              size="icon" 
              className="h-14 w-14 rounded-2xl text-muted-foreground/30 hover:text-primary transition-all"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
            </Button>
            
            <div className="relative flex-1">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Write a message..."
                className="w-full h-14 bg-transparent border-none rounded-2xl pl-4 pr-16 text-[14px] font-medium placeholder:text-muted-foreground/30 focus-visible:ring-0 transition-all"
              />
              
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Button 
                  type="submit" 
                  size="icon" 
                  className={cn(
                    "h-10 w-10 rounded-xl transition-all duration-500",
                    newMessage.trim() 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "bg-black/[0.03] text-muted-foreground/20"
                  )}
                  disabled={!newMessage.trim() || sending || uploading}
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </form>
        <div className="flex items-center justify-center gap-3 mt-4 opacity-10">
          <ShieldCheck className="h-3 w-3 text-primary" />
          <p className="text-[9px] font-medium tracking-widest">End-to-End Encrypted</p>
        </div>
      </div>
    </div>
  )
}
