import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { disconnectGoogleTasks } from '../store/syncStore'

export interface GoogleUser {
  email: string
  name: string
  picture?: string
}

interface AuthState {
  user: GoogleUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  setUser: (user: GoogleUser | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => Promise<void>
  fetchSession: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      fetchSession: async () => {
        set({ isLoading: true, error: null })
        try {
          const res = await fetch('/api/auth/me', { credentials: 'include' })
          if (!res.ok) {
            set({ user: null, isAuthenticated: false, isLoading: false })
            return false
          }
          const data = (await res.json()) as {
            authenticated: boolean
            user?: GoogleUser
          }
          if (data.authenticated && data.user) {
            set({ user: data.user, isAuthenticated: true, isLoading: false })
            return true
          }
          set({ user: null, isAuthenticated: false, isLoading: false })
          return false
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false })
          return false
        }
      },

      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
        } finally {
          set({ user: null, isAuthenticated: false, error: null })
          disconnectGoogleTasks()
        }
      },
    }),
    {
      name: 'habit-tracker-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

export function startGoogleLogin(): void {
  window.location.href = '/api/auth/google'
}
