import { createClient } from '@/lib/supabase/server'
import { Product } from '@/types'

export async function uploadFile(bucket: string, path: string, file: File, supabaseClient?: any) {
  const supabase = supabaseClient || await createClient()
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })
    
  if (error) throw error
  
  // Return the public URL or the path
  if (bucket === 'thumbnails') {
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
    return publicUrl
  }
  
  return data.path
}

export async function createProduct(productData: Omit<Product, 'id' | 'created_at'>, supabaseClient?: any) {
  const supabase = supabaseClient || await createClient()
  
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single()
    
  if (error) throw error
  return data
}
