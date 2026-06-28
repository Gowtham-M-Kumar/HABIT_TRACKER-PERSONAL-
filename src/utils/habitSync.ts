import type { Habit } from '../store/habitStore'
import {
  decodeTaskNotes,
  encodeTaskNotes,
  parseTaskTitle,
  taskTitle,
  type HabitTaskMeta,
} from '../../shared/taskMeta'
import type { GoogleTaskDto } from '../services/googleTasksApi'

const nowIso = () => new Date().toISOString()

export function normalizeHabit(partial: Partial<Habit> & Pick<Habit, 'id' | 'name'>): Habit {
  const createdAt = partial.createdAt ?? nowIso()
  return {
    id: partial.id,
    name: partial.name,
    color: partial.color ?? '#F4A0B8',
    goal: partial.goal ?? 20,
    iconEmoji: partial.iconEmoji ?? '✅',
    createdAt,
    updatedAt: partial.updatedAt ?? createdAt,
    active: partial.active ?? true,
    completed: partial.completed ?? false,
    dueDate: partial.dueDate ?? null,
    googleTaskId: partial.googleTaskId ?? null,
    syncEnabled: partial.syncEnabled ?? false,
  }
}

export function habitToTaskPayload(habit: Habit): Record<string, unknown> {
  const meta: HabitTaskMeta = {
    habitTracker: true,
    habitId: habit.id,
    goal: habit.goal,
    color: habit.color,
    iconEmoji: habit.iconEmoji,
    updatedAt: habit.updatedAt,
  }

  return {
    title: taskTitle(habit.name, habit.iconEmoji),
    notes: encodeTaskNotes(meta),
    status: habit.completed ? 'completed' : 'needsAction',
    due: habit.dueDate ? `${habit.dueDate}T00:00:00.000Z` : undefined,
  }
}

export function taskToHabit(task: GoogleTaskDto, existing?: Habit): Habit | null {
  if (task.deleted) return null

  const meta = decodeTaskNotes(task.notes)
  const parsed = parseTaskTitle(task.title ?? '')
  const remoteUpdatedAt = meta?.updatedAt ?? task.updated ?? nowIso()
  const dueDate = task.due ? task.due.slice(0, 10) : null

  if (existing) {
    return normalizeHabit({
      ...existing,
      name: parsed.name,
      iconEmoji: meta?.iconEmoji ?? parsed.iconEmoji,
      color: meta?.color ?? existing.color,
      goal: meta?.goal ?? existing.goal,
      completed: task.status === 'completed',
      dueDate,
      googleTaskId: task.id,
      updatedAt: remoteUpdatedAt,
      syncEnabled: true,
    })
  }

  const id = meta?.habitId ?? `google-${task.id}`
  return normalizeHabit({
    id,
    name: parsed.name,
    iconEmoji: meta?.iconEmoji ?? parsed.iconEmoji,
    color: meta?.color ?? '#F4A0B8',
    goal: meta?.goal ?? 20,
    completed: task.status === 'completed',
    dueDate,
    googleTaskId: task.id,
    createdAt: task.updated ?? nowIso(),
    updatedAt: remoteUpdatedAt,
    syncEnabled: true,
  })
}

export function snapshotsEqual(
  a: { name: string; completed: boolean; goal: number; dueDate: string | null },
  b: { name: string; completed: boolean; goal: number; dueDate: string | null },
): boolean {
  return (
    a.name === b.name &&
    a.completed === b.completed &&
    a.goal === b.goal &&
    a.dueDate === b.dueDate
  )
}

export function habitSnapshot(habit: Habit) {
  return {
    name: habit.name,
    completed: habit.completed,
    goal: habit.goal,
    dueDate: habit.dueDate,
  }
}

export function remoteSnapshot(task: GoogleTaskDto): {
  name: string
  completed: boolean
  goal: number
  dueDate: string | null
} {
  const meta = decodeTaskNotes(task.notes)
  const parsed = parseTaskTitle(task.title ?? '')
  return {
    name: parsed.name,
    completed: task.status === 'completed',
    goal: meta?.goal ?? 20,
    dueDate: task.due ? task.due.slice(0, 10) : null,
  }
}

export function isToday(year: number, month: number, day: number): boolean {
  const now = new Date()
  return (
    now.getFullYear() === year &&
    now.getMonth() + 1 === month &&
    now.getDate() === day
  )
}

export function touchHabit(habit: Habit, updates: Partial<Habit> = {}): Habit {
  return { ...habit, ...updates, updatedAt: nowIso() }
}
