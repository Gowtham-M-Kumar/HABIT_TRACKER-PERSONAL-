/** Metadata stored in Google Task notes for two-way sync */
export interface HabitTaskMeta {
  habitTracker: true
  habitId: string
  goal: number
  color: string
  iconEmoji: string
  updatedAt: string
}

export const META_PREFIX = 'HABIT_TRACKER::'

export function encodeTaskNotes(meta: HabitTaskMeta): string {
  return `${META_PREFIX}${JSON.stringify(meta)}`
}

export function decodeTaskNotes(notes?: string | null): HabitTaskMeta | null {
  if (!notes?.startsWith(META_PREFIX)) return null
  try {
    const parsed = JSON.parse(notes.slice(META_PREFIX.length)) as HabitTaskMeta
    if (parsed?.habitTracker && parsed.habitId) return parsed
  } catch {
    // ignore malformed notes
  }
  return null
}

export function taskTitle(name: string, iconEmoji: string): string {
  return `${iconEmoji} ${name}`.trim()
}

export function parseTaskTitle(title: string): { name: string; iconEmoji: string } {
  const match = title.match(/^(\p{Extended_Pictographic})\s+(.+)$/u)
  if (match) return { iconEmoji: match[1], name: match[2] }
  return { iconEmoji: '✅', name: title || 'Untitled Habit' }
}
