import { createClient } from '@/lib/supabase/server'
import { signout } from '@/app/auth/actions'
import NavbarClient from './NavbarClient'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  // Wrapper untuk server action agar bisa dipanggil dari client
  async function handleSignOut() {
    'use server'
    await signout()
  }

  return (
    <NavbarClient 
      user={user} 
      profile={profile} 
      signoutAction={handleSignOut} 
    />
  )
}
