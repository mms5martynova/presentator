import { createClient } from '@supabase/supabase-js'

const publicSupabaseConfig = {
  url: 'https://sjyofuskhqrcwzwyzvwb.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqeW9mdXNraHFyY3d6d3l6dndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQzNjgzMDQsImV4cCI6MjEwOTk0NDMwNH0.ml8GjeQQiUUyveduI7ff8uH0YRh0IgOKGcLVlWn0eB8',
}

const url = import.meta.env.VITE_SUPABASE_URL || publicSupabaseConfig.url
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || publicSupabaseConfig.anonKey

export const supabaseConfigReady = Boolean(url && anonKey)
export const supabase = supabaseConfigReady
  ? createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  })
  : null
