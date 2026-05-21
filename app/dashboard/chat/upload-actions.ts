'use server'

import { createClient } from '@/lib/supabase/server'
import { uploadFile } from '@/services/products'

export async function uploadChatAttachment(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) return { error: 'No file provided' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  try {
    const fileName = `${user.id}/chat/${Date.now()}-${file.name}`
    const url = await uploadFile('assets', fileName, file, supabase)
    return { success: true, url }
  } catch (error: any) {
    return { error: error.message }
  }
}
