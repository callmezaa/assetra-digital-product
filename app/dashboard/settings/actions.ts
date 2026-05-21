'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

async function createAuditLog(supabase: any, action: string, metadata: any = {}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const headerList = await headers()
  const ip = headerList.get('x-forwarded-for') || 'unknown'
  const ua = headerList.get('user-agent') || 'unknown'

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action,
    ip_address: ip,
    user_agent: ua,
    metadata
  })
}

export async function updateProfile(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to update your profile.' }
  }

  const fullName = formData.get('fullName') as string
  const username = formData.get('username') as string
  const bio = formData.get('bio') as string
  const twitterUrl = formData.get('twitterUrl') as string
  const githubUrl = formData.get('githubUrl') as string
  const dribbbleUrl = formData.get('dribbbleUrl') as string
  const websiteUrl = formData.get('websiteUrl') as string
  const accentColor = formData.get('accentColor') as string
  const avatarFile = formData.get('avatar') as File
  const bannerFile = formData.get('banner') as File

  try {
    let avatarUrl = undefined

    // Handle avatar upload if a new file is provided
    if (avatarFile && avatarFile.size > 0) {
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true })

      if (uploadError) {
        // If 'avatars' bucket doesn't exist, we fallback or throw error
        console.error('Avatar upload error:', uploadError)
        return { error: 'Failed to upload image. Please ensure the "avatars" storage bucket exists and is public in Supabase.' }
      }

      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      avatarUrl = data.publicUrl
    }

    let bannerUrl = undefined

    // Handle banner upload if a new file is provided
    if (bannerFile && bannerFile.size > 0) {
      const fileExt = bannerFile.name.split('.').pop()
      const fileName = `${user.id}-banner-${Math.random()}.${fileExt}`
      const filePath = `banners/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars') // Reusing avatars bucket or assuming a 'banners' bucket exists. Let's use 'banners' for clarity.
        .upload(filePath, bannerFile, { upsert: true })

      if (uploadError) {
        console.error('Banner upload error:', uploadError)
      } else {
        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
        bannerUrl = data.publicUrl
      }
    }

    // Update profile in database
    const updateData: any = {
      full_name: fullName,
      username: username.toLowerCase().replace(/\s+/g, ''),
      bio: bio,
      twitter_url: twitterUrl,
      github_url: githubUrl,
      dribbble_url: dribbbleUrl,
      website_url: websiteUrl,
      accent_color: accentColor,
      updated_at: new Date().toISOString()
    }

    if (avatarUrl) {
      updateData.avatar_url = avatarUrl
    }

    if (bannerUrl) {
      updateData.banner_url = bannerUrl
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...updateData
      })

    if (updateError) {
      throw updateError
    }

    await createAuditLog(supabase, 'PROFILE_UPDATED')

    revalidatePath('/dashboard/settings')
    revalidatePath('/', 'layout')
    return { success: true, message: 'Profile updated successfully!' }
  } catch (error: any) {
    console.error('Profile update error:', error)
    return { error: error.message || 'An unexpected error occurred.' }
  }
}

export async function updatePassword(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  await createAuditLog(supabase, 'PASSWORD_CHANGED')

  return { success: true, message: 'Password updated successfully!' }
}

export async function deleteAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated.' }
  }

  // In a real app, you might want to delete their products, etc.
  // Supabase Auth Admin API is usually needed to delete a user, 
  // or a trigger in the DB. For now, we'll try to delete from 'profiles'
  // and hope the DB cascade or a trigger handles the rest, 
  // or redirect to a 'goodbye' page.
  // Note: auth.users can only be deleted via Service Role key or Admin API.
  
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  await supabase.auth.signOut()
  redirect('/login')
}

export async function getMFAStatus() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.mfa.listFactors()
  
  if (error) return { error: error.message }
  
  const totpFactor = data.all.find(f => f.factor_type === 'totp' && f.status === 'verified')
  return { enabled: !!totpFactor, factorId: totpFactor?.id }
}

export async function enrollMFA() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp'
  })

  if (error) return { error: error.message }
  
  return { 
    id: data.id, 
    type: data.type, 
    totp: data.totp // contains qr_code (data url) and secret
  }
}

export async function verifyMFA(factorId: string, code: string) {
  const supabase = await createClient()
  
  // 1. Create a challenge
  const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId
  })

  if (challengeError) return { error: challengeError.message }

  // 2. Verify the challenge
  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challengeData.id,
    code
  })

  if (verifyError) return { error: verifyError.message }

  await createAuditLog(supabase, 'MFA_ENABLED', { factor_id: factorId })

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function unenrollMFA(factorId: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.mfa.unenroll({
    factorId
  })

  if (error) return { error: error.message }

  await createAuditLog(supabase, 'MFA_DISABLED', { factor_id: factorId })

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function updatePayoutSettings(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to update payout settings.' }
  }

  const payoutMethod = formData.get('payoutMethod') as string
  const payoutEmail = formData.get('payoutEmail') as string
  const bankName = formData.get('bankName') as string
  const accountNumber = formData.get('accountNumber') as string

  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        payout_method: payoutMethod,
        payout_email: payoutEmail,
        bank_name: bankName,
        account_number: accountNumber,
        payout_status: payoutMethod !== 'none' ? 'pending' : 'unconfigured',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (error) throw error

    await createAuditLog(supabase, 'PAYOUT_UPDATED', { method: payoutMethod })

    revalidatePath('/dashboard/settings')
    return { success: true, message: 'Payout settings updated! Our team will verify your details shortly.' }
  } catch (error: any) {
    console.error('Payout update error:', error)
    return { error: error.message || 'An unexpected error occurred.' }
  }
}

export async function signOutOthers() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut({ scope: 'others' })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/settings')
  return { success: true, message: 'Successfully signed out from all other devices.' }
}

export async function updatePrivacySettings(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated.' }
  }

  const hideSales = formData.get('hideSales') === 'on'
  const isPrivateProfile = formData.get('isPrivateProfile') === 'on'
  const showVerifiedBadge = formData.get('showVerifiedBadge') === 'on'

  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        hide_sales: hideSales,
        is_private_profile: isPrivateProfile,
        show_verified_badge: showVerifiedBadge,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (error) throw error

    await createAuditLog(supabase, 'PRIVACY_UPDATED')

    revalidatePath('/dashboard/settings')
    return { success: true, message: 'Privacy settings updated!' }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function updateNotificationSettings(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated.' }
  }

  const emailOnSale = formData.get('emailOnSale') === 'on'
  const emailWeeklySummary = formData.get('emailWeeklySummary') === 'on'
  const emailOnFollower = formData.get('emailOnFollower') === 'on'

  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        email_on_sale: emailOnSale,
        email_weekly_summary: emailWeeklySummary,
        email_on_follower: emailOnFollower,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (error) throw error

    await createAuditLog(supabase, 'NOTIFICATIONS_UPDATED')

    revalidatePath('/dashboard/settings')
    return { success: true, message: 'Notification preferences updated!' }
  } catch (error: any) {
    return { error: error.message }
  }
}
