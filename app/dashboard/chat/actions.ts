'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getOrCreateChatRoom(sellerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Authentication required' }
  if (user.id === sellerId) return { error: 'You cannot chat with yourself' }

  // Ensure consistent ordering for uniqueness (smaller UUID first)
  const [p1, p2] = [user.id, sellerId].sort()

  // Check if room exists
  const { data: existingRoom } = await supabase
    .from('chat_rooms')
    .select('id')
    .eq('participant_a', p1)
    .eq('participant_b', p2)
    .single()

  if (existingRoom) return { id: existingRoom.id }

  // Create new room
  const { data: newRoom, error } = await supabase
    .from('chat_rooms')
    .insert({ participant_a: p1, participant_b: p2 })
    .select('id')
    .single()

  if (error) return { error: error.message }
  return { id: newRoom.id }
}

export async function sendMessage(roomId: string, content: string, type: string = 'text', attachmentUrl?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Authentication required' }

  const { error } = await supabase
    .from('chat_messages')
    .insert({
      room_id: roomId,
      sender_id: user.id,
      content,
      type,
      attachment_url: attachmentUrl
    })

  if (error) return { error: error.message }
  return { success: true }
}

export async function getChatRooms() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('chat_rooms')
    .select(`
      id,
      last_message,
      last_message_at,
      participant_a,
      participant_b,
      product_id,
      products (id, title, thumbnail_url, price),
      profiles_a:participant_a (id, full_name, avatar_url, username),
      profiles_b:participant_b (id, full_name, avatar_url, username)
    `)
    .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
    .order('last_message_at', { ascending: false })

  if (error) {
    console.error('Error fetching rooms:', error)
    return []
  }

  // Fetch unread counts for all rooms
  const { data: unreadCounts } = await supabase
    .from('chat_messages')
    .select('room_id')
    .eq('is_read', false)
    .neq('sender_id', user.id)

  const countMap = unreadCounts?.reduce((acc: any, curr: any) => {
    acc[curr.room_id] = (acc[curr.room_id] || 0) + 1
    return acc
  }, {}) || {}

  return data.map(room => {
    const isA = room.participant_a === user.id
    const otherProfile = isA ? room.profiles_b : room.profiles_a
    return {
      id: room.id,
      last_message: room.last_message,
      last_message_at: room.last_message_at,
      otherUser: otherProfile,
      productInterest: room.products,
      unreadCount: countMap[room.id] || 0
    }
  })
}

export async function markAsRead(roomId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('room_id', roomId)
        .neq('sender_id', user.id)
}

export async function getChatContext(roomId: string, otherUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // 1. Fetch Room info to see if there's a specific product_id
  const { data: room } = await supabase
    .from('chat_rooms')
    .select('product_id, products(*)')
    .eq('id', roomId)
    .single()

  // 2. Fetch Orders (context)
  // If we are the seller, show what the other user (buyer) has bought from us
  const { data: orders } = await supabase
    .from('orders')
    .select('*, products(*)')
    .eq('products.user_id', user.id)
    .eq('user_id', otherUserId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  // 3. Fetch Wishlist items (optional context)
  const { data: wishlist } = await supabase
    .from('wishlist')
    .select('*, products(*)')
    .eq('user_id', otherUserId)
    .eq('products.user_id', user.id)

  return {
    productInterest: room?.products || null,
    orders: orders || [],
    wishlist: wishlist || []
  }
}
