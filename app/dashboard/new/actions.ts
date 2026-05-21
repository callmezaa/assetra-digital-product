'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { uploadFile, createProduct } from '@/services/products'

import { generateProductDescription, suggestPrice, suggestSmartTags } from '@/lib/ai'

export async function getSmartTags(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string

  if (!title || !description || !category) {
    throw new Error('Title, Description, and Category are required for tag suggestion')
  }

  try {
    const tags = await suggestSmartTags(title, description, category)
    return { success: true, tags }
  } catch (error) {
    return { success: false, error: 'Tag suggestions failed' }
  }
}

export async function getAIPricingSuggestion(formData: FormData) {
  const title = formData.get('title') as string
  const category = formData.get('category') as string

  if (!title || !category) {
    throw new Error('Title and Category are required for AI pricing')
  }

  try {
    const suggestion = await suggestPrice(title, category)
    return { success: true, ...suggestion }
  } catch (error) {
    return { success: false, error: 'Pricing assistant is busy. Try again later.' }
  }
}

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

export async function handleCreateProduct(prevState: any, formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const price = parseFloat(formData.get('price') as string)
  const thumbnail = formData.get('thumbnail') as File
  const asset = formData.get('asset') as File
  const tagsString = formData.get('tags') as string
  const hasProOverlay = formData.get('has_pro_overlay') === 'true'
  const tags = tagsString ? tagsString.split(',').map(t => t.trim()) : []

  if (!title) return { error: 'Title is required' }
  if (!description) return { error: 'Description is required' }
  if (!category) return { error: 'Category is required' }
  if (isNaN(price)) return { error: 'Valid price is required' }
  
  console.log('--- Upload Debug ---')
  console.log('Thumbnail:', thumbnail?.name, thumbnail?.size, 'bytes')
  console.log('Asset:', asset?.name, asset?.size, 'bytes')

  if (!thumbnail || thumbnail.size === 0) return { error: 'Thumbnail image is required' }
  if (!asset || asset.size === 0) return { error: 'Asset file is required' }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('RLS Error: No active user found')
      throw new Error('Not authenticated')
    }

    console.log('User session verified for:', user.id)

    // 1. Upload Thumbnail
    const thumbName = `${user.id}/${Date.now()}-${thumbnail.name}`
    const thumbnailUrl = await uploadFile('thumbnails', thumbName, thumbnail, supabase)

    // 2. Upload Asset File
    const assetName = `${user.id}/${Date.now()}-${asset.name}`
    const fileUrl = await uploadFile('assets', assetName, asset, supabase)

    // 3. Create DB Record
    await createProduct({
      title,
      description,
      category,
      price,
      thumbnail_url: thumbnailUrl,
      file_url: fileUrl,
      user_id: user.id,
      tags: tags,
      has_pro_overlay: hasProOverlay,
      status: 'published'
    }, supabase)

    revalidatePath('/dashboard')
    revalidatePath('/marketplace')
  } catch (error: any) {
    return { error: error.message || 'Something went wrong' }
  }

  redirect('/dashboard')
}
