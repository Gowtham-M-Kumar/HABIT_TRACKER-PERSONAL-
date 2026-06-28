import type { Habit, CompletionLogs, Profile, Settings } from '../store/habitStore'
import { supabase } from '../lib/supabase'

export interface GuestSnapshot {
  habits: Habit[]
  logs: CompletionLogs
  profile: Profile
  settings: Settings
}

/**
 * Migrates guest (localStorage) data into the authenticated user's cloud account.
 * Called once after a new sign-up when the user had existing local habits.
 *
 * Strategy:
 * - Assigns new UUIDs to habits that had old numeric IDs
 * - Re-keys completion logs to match new IDs
 * - Upserts everything to Supabase
 */
export async function migrateGuestDataToCloud(
  userId: string,
  snapshot: GuestSnapshot,
): Promise<void> {
  if (!supabase || snapshot.habits.length === 0) return

  // Build ID remapping: old numeric IDs → new UUIDs
  const idMap = new Map<string, string>()
  const migratedHabits: Habit[] = snapshot.habits.map((habit, i) => {
    const isLegacyId = /^\d+$/.test(habit.id) // old Date.now() format
    const newId = isLegacyId ? crypto.randomUUID() : habit.id
    if (isLegacyId) idMap.set(habit.id, newId)
    return { ...habit, id: newId, sort_order: i } as Habit & { sort_order: number }
  })

  // Re-key logs with new IDs
  const migratedLogs: CompletionLogs = {}
  for (const [year, months] of Object.entries(snapshot.logs)) {
    migratedLogs[year] = {}
    for (const [month, habits] of Object.entries(months)) {
      migratedLogs[year][month] = {}
      for (const [habitId, days] of Object.entries(habits)) {
        const newId = idMap.get(habitId) ?? habitId
        migratedLogs[year][month][newId] = days
      }
    }
  }

  // Upload habits
  const habitRows = migratedHabits.map((h, i) => ({
    id: h.id,
    user_id: userId,
    name: h.name,
    color: h.color,
    goal: h.goal,
    icon_emoji: h.iconEmoji,
    created_at: h.createdAt,
    updated_at: h.updatedAt,
    active: h.active,
    completed: h.completed,
    due_date: h.dueDate,
    sort_order: i,
  }))
  await supabase.from('habits').upsert(habitRows, { onConflict: 'id' })

  // Upload logs
  const logRows: Array<{
    user_id: string
    habit_id: string
    year: number
    month: number
    day: number
    completed: boolean
  }> = []

  for (const [year, months] of Object.entries(migratedLogs)) {
    for (const [month, habits] of Object.entries(months)) {
      for (const [habitId, days] of Object.entries(habits)) {
        for (const [day, completed] of Object.entries(days)) {
          logRows.push({
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

  if (logRows.length > 0) {
    // Batch in chunks of 500 to stay within Supabase limits
    const CHUNK = 500
    for (let i = 0; i < logRows.length; i += CHUNK) {
      await supabase
        .from('completion_logs')
        .upsert(logRows.slice(i, i + CHUNK), {
          onConflict: 'user_id,habit_id,year,month,day',
          ignoreDuplicates: true,
        })
    }
  }

  // Upload profile
  await supabase.from('user_profiles').upsert({
    id: userId,
    name: snapshot.profile.name,
    affirmation_text: snapshot.profile.affirmationText,
    photo_url: snapshot.profile.photoDataURL,
  })

  // Upload settings
  await supabase.from('user_settings').upsert({
    id: userId,
    dark_mode: snapshot.settings.darkMode,
    accent_color: snapshot.settings.accentColor,
    show_weekends: snapshot.settings.showWeekends,
    start_day_of_week: snapshot.settings.startDayOfWeek,
    app_version: snapshot.settings.appVersion,
  })
}
