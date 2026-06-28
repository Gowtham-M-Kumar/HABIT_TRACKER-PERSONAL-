import { useEffect, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import { useHabitStore } from '../store/habitStore'
import { useSyncStore } from '../store/syncStore'
import {
  connectGoogleTasks,
  deleteRemoteHabit,
  pushHabitNow,
  queueSync,
  runSync,
} from '../services/syncEngine'

const POLL_MS = 60_000

/** Wires auto-sync triggers: login, startup, reconnect, habit edits, polling */
export function useGoogleSync(): void {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const googleTasksConnected = useSyncStore((s) => s.googleTasksConnected)
  const autoSync = useSyncStore((s) => s.autoSync)

  const habits = useHabitStore((s) => s.habits)
  const habitsRef = useRef(habits)
  habitsRef.current = habits

  // Session bootstrap + OAuth callback
  useEffect(() => {
    void useAuthStore.getState().fetchSession().then((ok) => {
      if (ok) {
        useSyncStore.getState().setGoogleTasksConnected(true)
        void runSync(true)
      }
    })

    const params = new URLSearchParams(window.location.search)
    if (params.get('google_auth') === 'success') {
      window.history.replaceState({}, '', window.location.pathname)
      void useAuthStore.getState().fetchSession().then(() => {
        void connectGoogleTasks()
      })
    }
    if (params.get('google_auth') === 'error') {
      const message = params.get('message') ?? 'Google sign-in failed'
      useAuthStore.getState().setError(decodeURIComponent(message))
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  // Auto-connect tasks when user logs in
  useEffect(() => {
    if (isAuthenticated && !googleTasksConnected) {
      void connectGoogleTasks()
    }
  }, [isAuthenticated, googleTasksConnected])

  // Debounced sync when habits change
  useEffect(() => {
    if (!isAuthenticated || !googleTasksConnected || !autoSync) return
    queueSync('habits-changed')
  }, [habits, isAuthenticated, googleTasksConnected, autoSync])

  // Online reconnect
  useEffect(() => {
    const onOnline = () => queueSync('online', 500)
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [])

  // Background poll for remote Google Task changes
  useEffect(() => {
    if (!isAuthenticated || !googleTasksConnected || !autoSync) return
    const id = setInterval(() => queueSync('poll', 200), POLL_MS)
    return () => clearInterval(id)
  }, [isAuthenticated, googleTasksConnected, autoSync])
}

/** Call after deleteHabit to remove remote task */
export async function syncDeleteHabit(habitId: string): Promise<void> {
  const habit = useHabitStore.getState().habits.find((h) => h.id === habitId)
  if (!habit?.googleTaskId) return
  await deleteRemoteHabit(habit)
}

/** Immediate push for a single habit edit */
export function syncHabitImmediate(habitId: string): void {
  const habit = useHabitStore.getState().habits.find((h) => h.id === habitId)
  if (!habit?.syncEnabled) return
  void pushHabitNow(habit).catch(() => queueSync('push-retry'))
}
