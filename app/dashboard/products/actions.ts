'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleProductStatus(productId: string, currentStatus: 'published' | 'draft') {
  const supabase = await createClient()
  const newStatus = currentStatus === 'published' ? 'draft' : 'published'

  const { error } = await supabase
    .from('products')
    .update({ status: newStatus })
    .eq('id', productId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/products')
  return { success: true, newStatus }
}
