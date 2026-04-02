import { createClient } from '@supabase/supabase-js'

// Public client (uses anon key) -- safe for browser use
export function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase public env vars not set')
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Server-side admin client (uses service role key) -- NEVER expose to browser
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Supabase admin env vars not set — skipping DB operations')
    return null
  }
  return createClient(supabaseUrl, serviceRoleKey)
}
