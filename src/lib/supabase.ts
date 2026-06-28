import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? ''
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? ''
const STORAGE_KEY = 'habit-tracker-auth-session'

let useSessionStorage = false

const authStorage = {
  getItem(key: string) {
    if (typeof window === 'undefined') return null
    const sessionValue = window.sessionStorage.getItem(key)
    if (sessionValue !== null) return sessionValue
    return window.localStorage.getItem(key)
  },
  setItem(key: string, value: string) {
    if (typeof window === 'undefined') return
    window.sessionStorage.removeItem(key)
    window.localStorage.removeItem(key)
    if (useSessionStorage) {
      window.sessionStorage.setItem(key, value)
    } else {
      window.localStorage.setItem(key, value)
    }
  },
  removeItem(key: string) {
    if (typeof window === 'undefined') return
    window.sessionStorage.removeItem(key)
    window.localStorage.removeItem(key)
  },
}

export function setAuthPersistence(useSession: boolean) {
  useSessionStorage = useSession
}

/**
 * True when both env vars are present. When false the app runs in guest-only
 * mode — all Supabase calls are skipped and local storage is used instead.
 */
export const isSupabaseConfigured: boolean = !!(supabaseUrl && supabaseAnonKey)

/** Supabase client — null when env vars are missing (guest-only mode). */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: STORAGE_KEY,
        storage: authStorage,
      },
    })
  : null

// ─── DB Row Types ─────────────────────────────────────────────────────────────

export interface DbHabit {
  id: string
  user_id: string
  name: string
  color: string
  goal: number
  icon_emoji: string
  created_at: string
  updated_at: string
  active: boolean
  completed: boolean
  due_date: string | null
  sort_order: number
}

export interface DbLog {
  id?: string
  user_id: string
  habit_id: string
  year: number
  month: number
  day: number
  completed: boolean
}

export interface DbProfile {
  id: string
  name: string
  affirmation_text: string
  photo_url: string
  created_at?: string
}

export interface DbSettings {
  id: string
  dark_mode: boolean
  accent_color: string
  show_weekends: boolean
  start_day_of_week: number
  app_version: string
}
