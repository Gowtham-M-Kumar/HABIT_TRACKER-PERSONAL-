import { useEffect, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import { useHabitStore } from '../store/habitStore'
import type { Habit, CompletionLogs, Profile, Settings } from '../store/habitStore'
import { supabase } from '../lib/supabase'
import type { DbHabit, DbLog, DbProfile, DbSettings } from '../lib/supabase'

// ─── Type Converters ──────────────────────────────────────────────────────────

function habitToDb(habit: Habit, userId: string, sortOrder: number): DbHabit {
  return {
    id: habit.id,
    user_id: userId,
    name: habit.name,
    color: habit.color,
    goal: habit.goal,
    icon_emoji: habit.iconEmoji,
    created_at: habit.createdAt,
    updated_at: habit.updatedAt,
    active: habit.active,
    completed: habit.completed,
    due_date: habit.dueDate,
    sort_order: sortOrder,
  }
}

function habitFromDb(row: DbHabit): Habit {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    goal: row.goal,
    iconEmoji: row.icon_emoji,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    active: row.active,
    completed: row.completed,
    dueDate: row.due_date,
  }
}

function logsFromDb(rows: DbLog[]): CompletionLogs {
  const logs: CompletionLogs = {}
  for (const row of rows) {
    const y = row.year.toString()
    const m = row.month.toString()
    const d = row.day.toString()
    if (!logs[y]) logs[y] = {}
    if (!logs[y][m]) logs[y][m] = {}
    if (!logs[y][m][row.habit_id]) logs[y][m][row.habit_id] = {}
    logs[y][m][row.habit_id][d] = row.completed
  }
  return logs
}

function profileFromDb(row: DbProfile | null): Partial<Profile> | undefined {
  if (!row) return undefined
  return {
    name: row.name ?? '',
    affirmationText: row.affirmation_text ?? '',
    photoDataURL: row.photo_url ?? '',
  }
}

function settingsFromDb(row: DbSettings | null): Partial<Settings> | undefined {
  if (!row) return undefined
  return {
    darkMode: row.dark_mode,
    accentColor: row.accent_color,
    showWeekends: row.show_weekends,
    startDayOfWeek: row.start_day_of_week,
    appVersion: row.app_version,
  }
}

// ─── Cloud Data Loader ────────────────────────────────────────────────────────

async function loadCloudData(user: { id: string; user_metadata?: Record<string, unknown> | null }): Promise<void> {
  if (!supabase) return
  const userId = user.id

  const [habitsRes, logsRes, profileRes, settingsRes] = await Promise.all([
    supabase.from('habits').select('*').eq('user_id', userId).order('sort_order'),
    supabase.from('completion_logs').select('*').eq('user_id', userId),
    supabase.from('user_profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('user_settings').select('*').eq('id', userId).maybeSingle(),
  ])

  if (habitsRes.error || logsRes.error) {
    console.error('[CloudSync] loadCloudData error', {
      habitsError: habitsRes.error,
      logsError: logsRes.error,
    })
    return
  }

  const habits: Habit[] = ((habitsRes.data as DbHabit[]) ?? []).map(habitFromDb)
  const logs: CompletionLogs = logsFromDb((logsRes.data as DbLog[]) ?? [])
  const profile = profileFromDb(profileRes.data as DbProfile | null) ?? {
    name: (user.user_metadata?.name as string) ?? '',
    affirmationText: 'Consistency beats talent when talent fails to be consistent.',
    photoDataURL: '',
  }
  const settings = settingsFromDb(settingsRes.data as DbSettings | null) ?? {
    darkMode: false,
    accentColor: '#F4A0B8',
    showWeekends: true,
    startDayOfWeek: 1,
    appVersion: '1.0.0',
  }

  if (!profileRes.data) {
    await supabase.from('user_profiles').upsert({
      id: userId,
      name: profile.name,
      affirmation_text: profile.affirmationText,
      photo_url: profile.photoDataURL,
    })
  }

  if (!settingsRes.data) {
    await supabase.from('user_settings').upsert({
      id: userId,
      dark_mode: settings.darkMode,
      accent_color: settings.accentColor,
      show_weekends: settings.showWeekends,
      start_day_of_week: settings.startDayOfWeek,
      app_version: settings.appVersion,
    })
  }

  useHabitStore.getState().setFullData({ habits, logs, profile, settings, cloudUserId: userId, fromCloud: true })
}

// ─── Cloud Writers ────────────────────────────────────────────────────────────

async function syncHabits(
  curr: Habit[],
  prev: Habit[],
  userId: string,
): Promise<void> {
  if (!supabase) return
  const prevIds = new Set(prev.map((h) => h.id))
  const currIds = new Set(curr.map((h) => h.id))

  // Upsert all current habits (handles both add and update)
  if (curr.length > 0) {
    const rows = curr.map((h, i) => habitToDb(h, userId, i))
    const { error } = await supabase
      .from('habits')
      .upsert(rows, { onConflict: 'id' })
    if (error) console.error('[CloudSync] habits upsert error', error)
  }

  // Delete removed habits
  for (const prevId of prevIds) {
    if (!currIds.has(prevId)) {
      await supabase.from('habits').delete().eq('id', prevId).eq('user_id', userId)
    }
  }
}

async function syncChangedLogs(
  curr: CompletionLogs,
  prev: CompletionLogs,
  userId: string,
): Promise<void> {
  if (!supabase) return
  const changed: DbLog[] = []

  for (const [year, months] of Object.entries(curr)) {
    for (const [month, habits] of Object.entries(months)) {
      for (const [habitId, days] of Object.entries(habits)) {
        for (const [day, completed] of Object.entries(days)) {
          const prevVal = prev[year]?.[month]?.[habitId]?.[day]
          if (prevVal !== completed) {
            changed.push({
              user_id: userId,
              habit_id: habitId,
              year: parseInt(year),
              month: parseInt(month),
              day: parseInt(day),
              completed,
            })
          }
        }
      }
    }
  }

  if (changed.length > 0) {
    const { error } = await supabase
      .from('completion_logs')
      .upsert(changed, {
        onConflict: 'user_id,habit_id,year,month,day',
        ignoreDuplicates: false,
      })
    if (error) console.error('[CloudSync] logs upsert error', error)
  }
}

async function syncProfile(profile: Profile, userId: string): Promise<void> {
  if (!supabase) return
  const [profileRes, authRes] = await Promise.all([
    supabase.from('user_profiles').upsert({
      id: userId,
      name: profile.name,
      affirmation_text: profile.affirmationText,
      photo_url: profile.photoDataURL,
    }),
    supabase.auth.updateUser({ data: { name: profile.name } }).catch((err) => err),
  ])
  if (profileRes.error) {
    console.error('[CloudSync] syncProfile profile upsert error', profileRes.error)
  }
  if (authRes && 'message' in authRes) {
    console.error('[CloudSync] syncProfile auth update error', authRes)
  }
}

async function syncSettings(settings: Settings, userId: string): Promise<void> {
  if (!supabase) return
  await supabase.from('user_settings').upsert({
    id: userId,
    dark_mode: settings.darkMode,
    accent_color: settings.accentColor,
    show_weekends: settings.showWeekends,
    start_day_of_week: settings.startDayOfWeek,
    app_version: settings.appVersion,
  })
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Bi-directional cloud sync hook.
 *
 * Mount this once at the App level (inside <AuthGate>).
 * - On cloud-mode activation: fetches all data from Supabase → populates habitStore.
 * - Subscribes to habitStore changes → writes diffs back to Supabase.
 * - Does nothing in guest mode.
 */
export function useCloudSync(): void {
  const { user, mode } = useAuthStore()
  const isLoadingFromCloud = useRef(false)

  // Refs to track previous state for diff-based syncing
  const prevHabitsRef = useRef<Habit[] | null>(null)
  const prevLogsRef = useRef<CompletionLogs | null>(null)
  const prevProfileRef = useRef<Profile | null>(null)
  const prevSettingsRef = useRef<Settings | null>(null)

  // Load cloud data on sign-in
  useEffect(() => {
    if (mode !== 'cloud' || !user) {
      prevHabitsRef.current = null
      prevLogsRef.current = null
      prevProfileRef.current = null
      prevSettingsRef.current = null
      return
    }

    isLoadingFromCloud.current = true

    loadCloudData(user).finally(() => {
      const s = useHabitStore.getState()
      prevHabitsRef.current = s.habits
      prevLogsRef.current = s.logs
      prevProfileRef.current = s.profile
      prevSettingsRef.current = s.settings
      isLoadingFromCloud.current = false
    })
  }, [mode, user?.id])

  // Subscribe to local state changes and sync to cloud
  useEffect(() => {
    if (mode !== 'cloud' || !user) return

    const unsub = useHabitStore.subscribe((curr) => {
      // Skip while we are hydrating FROM cloud (prevents ping-pong)
      if (isLoadingFromCloud.current) return
      const userId = user.id

      if (curr.habits !== prevHabitsRef.current && prevHabitsRef.current !== null) {
        const prev = prevHabitsRef.current
        prevHabitsRef.current = curr.habits
        syncHabits(curr.habits, prev, userId)
      }

      if (curr.logs !== prevLogsRef.current && prevLogsRef.current !== null) {
        const prev = prevLogsRef.current
        prevLogsRef.current = curr.logs
        syncChangedLogs(curr.logs, prev, userId)
      }

      if (curr.profile !== prevProfileRef.current && prevProfileRef.current !== null) {
        prevProfileRef.current = curr.profile
        syncProfile(curr.profile, userId)
      }

      if (curr.settings !== prevSettingsRef.current && prevSettingsRef.current !== null) {
        prevSettingsRef.current = curr.settings
        syncSettings(curr.settings, userId)
      }
    })

    return unsub
  }, [mode, user?.id])
}
