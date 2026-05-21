'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { uploadFile } from '@/services/products'

import { generateProductDescription } from '@/lib/ai'

export async function generateAIDescription(formData: FormData) {
  const title = formData.get('title') as string
  const category = formData.get('category') as string

  if (!title || !category) {
    throw new Error('Title and Category are required for AI generation')
  }

  try {
    const aiContent = await generateProductDescription(title, category)
    return { success: true, content: aiContent }
  } catch (error) {
    return { success: false, error: 'AI failed to respond. Please check your API key.' }
  }
}

export async function handleUpdateProduct(prevState: any, formData: FormData) {
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const price = parseFloat(formData.get('price') as string)
  const thumbnailFile = formData.get('thumbnail') as File
  const assetFile = formData.get('asset') as File

  if (!id || !title || !description || !category || isNaN(price)) {
    return { error: 'Basic fields are required' }
  }

  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user

    if (!user) throw new Error('Not authenticated')

    // Prepare update data
    const updateData: any = {
      title,
      description,
      category,
      price,
    }

    // 1. Optional Thumbnail Upload
    if (thumbnailFile && thumbnailFile.size > 0) {
      const thumbName = `${user.id}/${Date.now()}-${thumbnailFile.name}`
      const thumbnailUrl = await uploadFile('thumbnails', thumbName, thumbnailFile, supabase)
      updateData.thumbnail_url = thumbnailUrl
    }

    // 2. Optional Asset Upload
    if (assetFile && assetFile.size > 0) {
      const assetName = `${user.id}/${Date.now()}-${assetFile.name}`
      const fileUrl = await uploadFile('assets', assetName, assetFile, supabase)
      updateData.file_url = fileUrl
    }

    // 3. Update DB Record
    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/dashboard')
    revalidatePath('/marketplace')
    revalidatePath(`/product/${id}`)
  } catch (error: any) {
    return { error: error.message || 'Something went wrong' }
  }

  redirect('/dashboard')
}
