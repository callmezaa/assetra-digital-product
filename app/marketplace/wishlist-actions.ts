'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleWishlist(productId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('You must be logged in to save items')

  // Check if already in wishlist
  const { data: existing } = await supabase
    .from('wishlist')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single()

  if (existing) {
    // Remove from wishlist
    await supabase
      .from('wishlist')
      .delete()
      .eq('id', existing.id)
  } else {
    // Add to wishlist
    await supabase
      .from('wishlist')
      .insert({
        user_id: user.id,
        product_id: productId
      })
  }

  revalidatePath('/marketplace')
  revalidatePath('/library')
  return { success: true, isSaved: !existing }
}

export async function isProductSaved(productId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const { data } = await supabase
    .from('wishlist')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single()

  return !!data
}
