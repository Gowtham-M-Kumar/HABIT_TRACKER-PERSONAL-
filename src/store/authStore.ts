import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured, setAuthPersistence } from '../lib/supabase'
import { useHabitStore } from './habitStore'

export type AuthMode = 'guest' | 'cloud'
export type AuthView = 'login' | 'signup' | 'forgot' | 'check-email' | 'reset-password'

interface AuthState {
  // ── Core state ──────────────────────────────────────────────────────────────
  user: User | null
  session: Session | null
  mode: AuthMode
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  loginAttempts: number
  lockoutExpiresAt: number | null

  // ── Modal / UI state ─────────────────────────────────────────────────────────
  isAuthModalOpen: boolean
  authView: AuthView
  isProfileOpen: boolean

  // ── Actions ──────────────────────────────────────────────────────────────────
  initialize: () => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<{ signedIn: boolean }>
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  updateDisplayName: (name: string) => Promise<void>
  deleteAccount: () => Promise<void>
  continueAsGuest: () => void
  openAuthModal: (view?: AuthView) => void
  closeAuthModal: () => void
  setAuthView: (view: AuthView) => void
  openProfile: () => void
  closeProfile: () => void
  setError: (error: string | null) => void
}

const SEEN_LANDING_KEY = 'habit-auth-seen-landing'

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  mode: 'guest',
  isLoading: false,
  isInitialized: false,
  error: null,
  isAuthModalOpen: false,
  authView: 'login',
  isProfileOpen: false,
  loginAttempts: 0,
  lockoutExpiresAt: null,

  // ── Initialize: check session & subscribe to auth changes ───────────────────
  initialize: async () => {
    if (!isSupabaseConfigured || !supabase) {
      // No Supabase configured — app runs in guest-only mode
      set({ isInitialized: true, mode: 'guest' })
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({
        session,
        user: session?.user ?? null,
        mode: session ? 'cloud' : 'guest',
        isInitialized: true,
      })

      // Listen for auth state changes (login, logout, token refresh, etc.)
      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          session,
          user: session?.user ?? null,
          mode: session ? 'cloud' : 'guest',
        })
      })
    } catch {
      set({ isInitialized: true, mode: 'guest' })
    }
  },

  // ── Sign Up ─────────────────────────────────────────────────────────────────
  signUp: async (email, password, name) => {
    if (!supabase) throw new Error('Auth not configured')
    setAuthPersistence(false)
    set({ isLoading: true, error: null })

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      })
      if (error) throw error

      localStorage.setItem(SEEN_LANDING_KEY, 'true')
      set({ loginAttempts: 0, lockoutExpiresAt: null })

      if (data?.session) {
        set({ user: data.user, session: data.session, mode: 'cloud', isAuthModalOpen: false })
        return { signedIn: true }
      }

      // Attempt a fallback sign-in in case Supabase did not return a session.
      try {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (!signInError) {
          const sessionResult = await supabase.auth.getSession()
          const session = sessionResult.data.session
          set({ session, user: session?.user ?? null, mode: session ? 'cloud' : 'guest', isAuthModalOpen: false })
          return { signedIn: !!session }
        }
      } catch {
        // ignore fallback failure; likely email verification is required
      }

      return { signedIn: false }
    } catch (err: unknown) {
      let msg = 'Sign up failed. Please try again.'
      if (err instanceof Error) {
        msg = err.message
      }
      set({ error: msg })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  // ── Sign In ─────────────────────────────────────────────────────────────────
  signIn: async (email, password, rememberMe) => {
    if (!supabase) throw new Error('Auth not configured')
    const { lockoutExpiresAt, loginAttempts } = get()
    const now = Date.now()
    if (lockoutExpiresAt && now < lockoutExpiresAt) {
      const waitSeconds = Math.ceil((lockoutExpiresAt - now) / 1000)
      const msg = `Too many failed attempts. Try again in ${waitSeconds} second${waitSeconds === 1 ? '' : 's'}.`
      set({ error: msg, isLoading: false })
      throw new Error(msg)
    }

    setAuthPersistence(!rememberMe)
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      localStorage.setItem(SEEN_LANDING_KEY, 'true')
      set({ isAuthModalOpen: false, loginAttempts: 0, lockoutExpiresAt: null })
    } catch (err: unknown) {
      const attempts = loginAttempts + 1
      const lockoutExpiresAt = attempts >= 5 ? Date.now() + 2 * 60 * 1000 : null
      let msg = 'Sign in failed. Please try again.'
      if (err instanceof Error) {
        msg = err.message
        if (/email.*confirm/i.test(msg) || /confirm your email/i.test(msg)) {
          msg = 'Your email is not verified yet. Check your inbox for a verification link.'
        }
      }
      set({ error: msg, loginAttempts: attempts, lockoutExpiresAt })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  // ── Sign Out ─────────────────────────────────────────────────────────────────
  signOut: async () => {
    if (!supabase) return
    set({ isLoading: true })
    try {
      await supabase.auth.signOut()
      useHabitStore.getState().resetToGuestDefaults()
      set({ user: null, session: null, mode: 'guest', isProfileOpen: false })
    } finally {
      set({ isLoading: false })
    }
  },

  // ── Forgot Password ──────────────────────────────────────────────────────────
  resetPassword: async (email) => {
    if (!supabase) throw new Error('Auth not configured')
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}?reset=true`,
      })
      if (error) throw error
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password reset failed. Please try again.'
      set({ error: msg })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  // ── Update Password ──────────────────────────────────────────────────────────
  updatePassword: async (newPassword) => {
    if (!supabase) throw new Error('Auth not configured')
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password update failed. Please try again.'
      set({ error: msg })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  // ── Update Display Name ──────────────────────────────────────────────────────
  updateDisplayName: async (name) => {
    if (!supabase) return
    const { user } = get()
    if (!user) return
    set({ isLoading: true, error: null })
    try {
      await supabase.auth.updateUser({ data: { name } })
      const { error } = await supabase.from('user_profiles').upsert({ id: user.id, name })
      if (error) {
        console.error('[AuthStore] updateDisplayName user_profiles upsert error', error)
        throw error
      }
      await useHabitStore.getState().updateProfile({ name })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed.'
      set({ error: msg })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  // ── Delete Account ───────────────────────────────────────────────────────────
  // Deletes all user data then signs out.
  // NOTE: The auth.users record itself requires an admin/edge-function call
  // to fully remove. All personal data is deleted via DB cascade on sign-out.
  deleteAccount: async () => {
    if (!supabase) throw new Error('Auth not configured')
    const { user } = get()
    if (!user) return
    set({ isLoading: true, error: null })
    try {
      // Delete profile (cascades to habits → logs via FK)
      await supabase.from('user_profiles').delete().eq('id', user.id)
      await supabase.from('user_settings').delete().eq('id', user.id)
      await supabase.auth.signOut()
      set({ user: null, session: null, mode: 'guest', isProfileOpen: false })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Account deletion failed.'
      set({ error: msg })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  // ── Guest Mode ───────────────────────────────────────────────────────────────
  continueAsGuest: () => {
    localStorage.setItem(SEEN_LANDING_KEY, 'true')
    useHabitStore.getState().resetToGuestDefaults()
    set({ mode: 'guest', isAuthModalOpen: false })
  },

  // ── UI Actions ───────────────────────────────────────────────────────────────
  openAuthModal: (view = 'login') => set({ isAuthModalOpen: true, authView: view, error: null }),
  closeAuthModal: () => set({ isAuthModalOpen: false, error: null }),
  setAuthView: (view) => set({ authView: view, error: null }),
  openProfile: () => set({ isProfileOpen: true }),
  closeProfile: () => set({ isProfileOpen: false }),
  setError: (error) => set({ error }),
}))

/** Returns true if the user has already dismissed the landing screen. */
export function hasSeenLanding(): boolean {
  return localStorage.getItem(SEEN_LANDING_KEY) === 'true'
}
