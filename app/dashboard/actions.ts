'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteProduct(productId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // 1. Fetch product to get file paths for cleanup
  const { data: product } = await supabase
    .from('products')
    .select('thumbnail_url, file_url')
    .eq('id', productId)
    .eq('user_id', user.id)
    .single()

  if (!product) throw new Error('Product not found or access denied')

  // 2. Delete from DB (RLS will also handle this, but we explicitly check user_id above)
  const { error: dbError } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)

  if (dbError) throw dbError

  // 3. Cleanup Storage (Optional but recommended)
  // Extract paths from URLs
  const getPath = (url: string) => {
    const parts = url.split('/')
    return parts.slice(-2).join('/') // Returns "userid/filename"
  }

  await supabase.storage.from('thumbnails').remove([getPath(product.thumbnail_url)])
  await supabase.storage.from('assets').remove([getPath(product.file_url)])

  revalidatePath('/dashboard')
  revalidatePath('/marketplace')
}
