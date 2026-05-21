'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleFollow(creatorId: string, currentPath: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in to follow creators.')
  }

  if (user.id === creatorId) {
    throw new Error('You cannot follow yourself.')
  }

  // Check if currently following
  const { data: isFollowing } = await supabase
    .from('follows')
    .select('*')
    .eq('follower_id', user.id)
    .eq('following_id', creatorId)
    .single()

  if (isFollowing) {
    // Unfollow
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', creatorId)

    if (error) throw new Error('Failed to unfollow')
  } else {
    // Follow
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: creatorId
      })

    if (error) throw new Error('Failed to follow')

    // Send notification to the creator
    const { data: followerProfile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, username')
      .eq('id', user.id)
      .single()

    const followerName = followerProfile?.full_name || 'Someone'

    await supabase.from('notifications').insert({
      user_id: creatorId,
      type: 'follow',
      title: '👤 New Follower!',
      message: `${followerName} started following you`,
      metadata: { 
        follower_id: user.id,
        follower_name: followerName,
        follower_avatar: followerProfile?.avatar_url,
        follower_username: followerProfile?.username
      }
    })
  }

  // Revalidate to update the UI (Follow button state and followers count)
  revalidatePath(currentPath)
  revalidatePath('/marketplace') // For the feed
  
  return { success: true, isFollowing: !isFollowing }
}
