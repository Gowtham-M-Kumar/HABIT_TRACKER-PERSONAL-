import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  isLoading: boolean
  error: string | null
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoading: false,
      error: null,

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),
    }),
    {
      name: 'habit-tracker-auth',
    },
  ),
)

