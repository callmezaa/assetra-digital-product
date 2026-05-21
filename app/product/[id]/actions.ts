'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function purchaseProduct(productId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in to purchase products')
  }

  const { error } = await supabase
    .from('orders')
    .insert([{
      user_id: user.id,
      product_id: productId,
      status: 'completed' // In real app, this would be 'pending' until payment success
    }])

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/product/${productId}`)
}

export async function getDownloadUrl(productId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // 1. Fetch the product (file path and owner)
  const { data: product } = await supabase
    .from('products')
    .select('file_url, user_id, title')
    .eq('id', productId)
    .single()

  if (!product) throw new Error('Product not found')

  const isOwner = product.user_id === user.id

  // 2. If not the owner, verify a completed purchase exists
  if (!isOwner) {
    const { data: order } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .eq('status', 'completed')
      .single()

    if (!order) {
      throw new Error('Access denied. You have not purchased this product.')
    }
  }

  // 3. Ensure we have a storage path (not a full URL)
  const filePath = product.file_url.startsWith('http')
    ? new URL(product.file_url).pathname.split('/assets/')[1]
    : product.file_url

  if (!filePath) throw new Error('Invalid file path for this product.')

  // 4. Use admin client to bypass RLS on storage for signed URL generation
  const { createClient: createAdminClient } = await import('@/lib/supabase/admin')
  const adminSupabase = createAdminClient()

  // 5. Generate a 15-minute signed URL
  const { data, error } = await adminSupabase.storage
    .from('assets')
    .createSignedUrl(filePath, 900, {
      download: product.title || 'download',
    })

  if (error) throw error

  return data.signedUrl
}


export async function submitReview(productId: string, rating: number, comment: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('You must be logged in to leave a review.')

  // Double check if user has purchased the item
  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .eq('status', 'completed')
    .single()

  if (!order) {
    throw new Error('You can only review products you have purchased.')
  }

  // Insert or Update the review
  const { error } = await supabase
    .from('reviews')
    .upsert({
      user_id: user.id,
      product_id: productId,
      rating,
      comment
    }, {
      onConflict: 'user_id, product_id'
    })

  if (error) {
    throw new Error(error.message)
  }

  // Send notification to product owner
  const { data: product } = await supabase
    .from('products')
    .select('title, user_id')
    .eq('id', productId)
    .single()

  if (product && product.user_id !== user.id) {
    const { data: reviewerProfile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, username')
      .eq('id', user.id)
      .single()

    const { data: productInfo } = await supabase
      .from('products')
      .select('thumbnail_url')
      .eq('id', productId)
      .single()

    const reviewerName = reviewerProfile?.full_name || 'Someone'

    await supabase.from('notifications').insert({
      user_id: product.user_id,
      type: 'review',
      title: `⭐ New ${rating}-Star Review!`,
      message: `${reviewerName} left a review on "${product.title}"`,
      metadata: { 
        product_id: productId, 
        reviewer_id: user.id, 
        rating, 
        reviewer_name: reviewerName,
        reviewer_avatar: reviewerProfile?.avatar_url,
        reviewer_username: reviewerProfile?.username,
        product_thumbnail: productInfo?.thumbnail_url
      }
    })
  }

  revalidatePath(`/product/${productId}`)
  return { success: true }
}
