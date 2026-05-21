import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Admin Supabase client using the service_role key.
 * This bypasses Row Level Security (RLS) and should ONLY be used
 * in server-side code (API routes, Server Actions) for privileged operations
 * like generating signed download URLs for authorized users.
 *
 * NEVER expose this client or the service_role key to the browser.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
      'Add your Service Role key to .env.local from: ' +
      'Supabase Dashboard > Project Settings > API > service_role'
    )
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
