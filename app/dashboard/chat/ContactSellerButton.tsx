'use client'

import { useState } from 'react'
import { MessageSquare, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getOrCreateChatRoom } from './actions'
import ChatWindow from './ChatWindow'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog"

interface ContactSellerButtonProps {
  seller: any
  currentUser: any
}

export default function ContactSellerButton({ seller, currentUser }: ContactSellerButtonProps) {
  const [roomId, setRoomId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  async function handleContact() {
    if (roomId) {
        setOpen(true)
        return
    }

    setLoading(true)
    const result = await getOrCreateChatRoom(seller.id)
    if ('id' in result) {
      setRoomId(result.id)
      setOpen(true)
    } else {
      console.error(result.error)
    }
    setLoading(false)
  }

  if (!seller?.id || !currentUser || currentUser.id === seller.id) return null

  return (
    <>
      <Button 
        onClick={handleContact}
        disabled={loading}
        className="rounded-xl gap-2 font-bold px-6 h-11"
        variant="outline"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
        Contact Seller
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md p-0 bg-transparent border-none shadow-none">
          <span className="sr-only">
            <DialogTitle>Chat with {seller.full_name}</DialogTitle>
          </span>
          {roomId && (
            <ChatWindow 
              roomId={roomId} 
              currentUser={currentUser} 
              otherUser={seller} 
              onClose={() => setOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
