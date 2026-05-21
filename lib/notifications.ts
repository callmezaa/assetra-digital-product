import { SupabaseClient } from '@supabase/supabase-js'

export async function enrichNotifications(supabase: SupabaseClient, notifications: any[]) {
  if (!notifications) return []

  return await Promise.all(notifications.map(async (notif) => {
    const metadata = notif.metadata || {}
    
    // For Follow: need follower_avatar and follower_username
    if (notif.type === 'follow' && (!metadata.follower_avatar || !metadata.follower_username)) {
      const followerId = metadata.follower_id
      if (followerId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url, username, full_name')
          .eq('id', followerId)
          .single()
        
        if (profile) {
          notif.metadata = {
            ...metadata,
            follower_avatar: profile.avatar_url,
            follower_username: profile.username,
            follower_name: profile.full_name
          }
        }
      }
    }

    // For Review: need reviewer_avatar and reviewer_username
    if (notif.type === 'review' && (!metadata.reviewer_avatar || !metadata.reviewer_username)) {
      const reviewerId = metadata.reviewer_id
      if (reviewerId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url, username, full_name')
          .eq('id', reviewerId)
          .single()
        
        if (profile) {
          notif.metadata = {
            ...metadata,
            reviewer_avatar: profile.avatar_url,
            reviewer_username: profile.username,
            reviewer_name: profile.full_name
          }
        }
      }
    }

    // For Purchase: try to get product thumbnail if missing
    if (notif.type === 'purchase' && !metadata.product_thumbnail) {
      const productId = metadata.product_id
      if (productId) {
        const { data: product } = await supabase
          .from('products')
          .select('thumbnail_url')
          .eq('id', productId)
          .single()
        
        if (product) {
          notif.metadata = {
            ...metadata,
            product_thumbnail: product.thumbnail_url
          }
        }
      }
    }

    return notif
  }))
}

export function getNotificationLink(notif: any) {
  switch (notif.type) {
    case 'purchase': return '/dashboard/wallet'
    case 'follow': return notif.metadata?.follower_username ? `/seller/${notif.metadata.follower_username}` : '#'
    case 'review': return notif.metadata?.product_id ? `/product/${notif.metadata.product_id}` : '#'
    default: return '#'
  }
}
