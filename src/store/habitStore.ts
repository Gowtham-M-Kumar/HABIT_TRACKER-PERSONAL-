import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  formatBackupLabel,
  getLatestBackup,
  saveBackup,
  type BackupSource,
} from '../utils/backupStorage'

export interface Habit {
  id: string
  name: string
  color: string
  goal: number
  iconEmoji: string
  createdAt: string
  updatedAt: string
  active: boolean
  completed: boolean
  dueDate: string | null
}

export interface CompletionLogs {
  [year: string]: {
    [month: string]: {
      [habitId: string]: {
        [day: string]: boolean
      }
    }
  }
}

export interface Profile {
  name: string
  affirmationText: string
  photoDataURL: string
}

export interface Settings {
  darkMode: boolean
  accentColor: string
  showWeekends: boolean
  startDayOfWeek: number
  appVersion: string
}

interface HabitState {
  habits: Habit[]
  logs: CompletionLogs
  profile: Profile
  settings: Settings
  selectedMonth: number
  selectedYear: number

  setDate: (year: number, month: number) => void
  toggleDay: (year: number, month: number, habitId: string, day: number) => void
  addHabit: (name: string, iconEmoji: string, color: string, goal: number) => void
  updateHabit: (id: string, updates: Partial<Habit>) => void
  deleteHabit: (id: string) => void
  reorderHabits: (startIndex: number, endIndex: number) => void
  updateProfile: (updates: Partial<Profile>) => void
  updateSettings: (updates: Partial<Settings>) => void
  resetData: () => void
  clearDatabase: () => void
  saveProgressBackup: (source: BackupSource) => void
  restoreProgressBackup: () => boolean
  getLatestBackupLabel: () => string | null
  setTodayCompletion: (habitId: string, completed: boolean) => void
}

const nowIso = () => new Date().toISOString()

function normalizeHabit(raw: Partial<Habit> & { id: string; name: string }): Habit {
  return {
    id: raw.id,
    name: raw.name,
    color: raw.color ?? '#A8D8EA',
    goal: raw.goal ?? 21,
    iconEmoji: raw.iconEmoji ?? '⭐',
    createdAt: raw.createdAt ?? nowIso(),
    updatedAt: raw.updatedAt ?? nowIso(),
    active: raw.active ?? true,
    completed: raw.completed ?? false,
    dueDate: raw.dueDate ?? null,
  }
}

const DEFAULT_HABITS: Habit[] = [
  { id: '1', name: 'Morning Meditation', color: '#A8D8EA', goal: 25, iconEmoji: '🧘', createdAt: nowIso(), updatedAt: nowIso(), active: true, completed: false, dueDate: null },
  { id: '2', name: 'Read 10 Pages', color: '#C0A8E8', goal: 20, iconEmoji: '📚', createdAt: nowIso(), updatedAt: nowIso(), active: true, completed: false, dueDate: null },
  { id: '3', name: 'Workout Routine', color: '#F4A0B8', goal: 18, iconEmoji: '🏋️', createdAt: nowIso(), updatedAt: nowIso(), active: true, completed: false, dueDate: null },
  { id: '4', name: '8 Glasses of Water', color: '#8ED4B4', goal: 30, iconEmoji: '💧', createdAt: nowIso(), updatedAt: nowIso(), active: true, completed: false, dueDate: null },
  { id: '5', name: 'Journal Thoughts', color: '#F5D87A', goal: 15, iconEmoji: '✍️', createdAt: nowIso(), updatedAt: nowIso(), active: true, completed: false, dueDate: null },
  { id: '6', name: 'Healthy Eating', color: '#F4A88A', goal: 28, iconEmoji: '🍏', createdAt: nowIso(), updatedAt: nowIso(), active: true, completed: false, dueDate: null },
  { id: '7', name: '8 Hours Sleep', color: '#8ED4CE', goal: 22, iconEmoji: '😴', createdAt: nowIso(), updatedAt: nowIso(), active: true, completed: false, dueDate: null },
]

const generateDemoLogs = (habits: Habit[]): CompletionLogs => {
  const logs: CompletionLogs = {}
  const year = 2026
  const month = 6
  const yearStr = year.toString()
  const monthStr = month.toString()
  logs[yearStr] = {}
  logs[yearStr][monthStr] = {}
  const endDay = 28

  habits.forEach((habit) => {
    logs[yearStr][monthStr][habit.id] = {}
    let successRate = 0.7
    if (habit.id === '1') successRate = 0.82
    if (habit.id === '2') successRate = 0.72
    if (habit.id === '3') successRate = 0.62
    if (habit.id === '4') successRate = 0.92
    if (habit.id === '5') successRate = 0.54
    if (habit.id === '6') successRate = 0.78
    if (habit.id === '7') successRate = 0.68

    for (let day = 1; day <= 31; day++) {
      logs[yearStr][monthStr][habit.id][day.toString()] =
        day <= endDay
          ? (Math.sin(day * parseInt(habit.id) * 3) + 1) / 2 < successRate
          : false
    }
  })

  const prevMonthStr = '5'
  logs[yearStr][prevMonthStr] = {}
  habits.forEach((habit) => {
    logs[yearStr][prevMonthStr][habit.id] = {}
    for (let day = 1; day <= 31; day++) {
      logs[yearStr][prevMonthStr][habit.id][day.toString()] =
        (Math.cos(day * parseInt(habit.id) * 2) + 1) / 2 < 0.65
    }
  })

  return logs
}

function migrateHabit(raw: Partial<Habit> & { id: string; name: string }): Habit {
  return normalizeHabit({
    ...raw,
    updatedAt: raw.updatedAt ?? raw.createdAt ?? nowIso(),
    completed: raw.completed ?? false,
    dueDate: raw.dueDate ?? null,
  })
}

function updateHabitTimestamp(habit: Habit, updates: Partial<Habit>): Habit {
  return {
    ...habit,
    ...updates,
    updatedAt: nowIso(),
  }
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => {
      const initialHabits = DEFAULT_HABITS
      const initialLogs = generateDemoLogs(initialHabits)

      return {
        habits: initialHabits,
        logs: initialLogs,
        profile: {
          name: 'Jane Doe',
          affirmationText: 'Consistency beats talent when talent fails to be consistent.',
          photoDataURL: '',
        },
        settings: {
          darkMode: false,
          accentColor: '#F4A0B8',
          showWeekends: true,
          startDayOfWeek: 1,
          appVersion: '1.0.0',
        },
        selectedMonth: 6,
        selectedYear: 2026,

        setDate: (year, month) => set({ selectedYear: year, selectedMonth: month }),

        toggleDay: (year, month, habitId, day) =>
          set((state) => {
            const yearStr = year.toString()
            const monthStr = month.toString()
            const dayStr = day.toString()
            const newLogs = { ...state.logs }

            if (!newLogs[yearStr]) newLogs[yearStr] = {}
            if (!newLogs[yearStr][monthStr]) newLogs[yearStr][monthStr] = {}
            if (!newLogs[yearStr][monthStr][habitId]) newLogs[yearStr][monthStr][habitId] = {}

            const currentVal = !!newLogs[yearStr][monthStr][habitId][dayStr]
            newLogs[yearStr][monthStr][habitId][dayStr] = !currentVal

            return { logs: newLogs }
          }),

        addHabit: (name, iconEmoji, color, goal) =>
          set((state) => {
            const createdAt = nowIso()
            const newHabit = normalizeHabit({
              id: Date.now().toString(),
              name,
              iconEmoji,
              color,
              goal,
              createdAt,
              updatedAt: createdAt,
            })

            const yearStr = state.selectedYear.toString()
            const monthStr = state.selectedMonth.toString()
            const newLogs = { ...state.logs }
            if (!newLogs[yearStr]) newLogs[yearStr] = {}
            if (!newLogs[yearStr][monthStr]) newLogs[yearStr][monthStr] = {}
            newLogs[yearStr][monthStr][newHabit.id] = {}

            return {
              habits: [...state.habits, newHabit],
              logs: newLogs,
            }
          }),

        updateHabit: (id, updates) =>
          set((state) => ({
            habits: state.habits.map((h) =>
              h.id === id ? updateHabitTimestamp(h, updates) : h,
            ),
          })),

        deleteHabit: (id) =>
          set((state) => ({
            habits: state.habits.filter((h) => h.id !== id),
          })),

        reorderHabits: (startIndex, endIndex) =>
          set((state) => {
            const result = Array.from(state.habits)
            const [removed] = result.splice(startIndex, 1)
            result.splice(endIndex, 0, removed)
            return { habits: result }
          }),

        updateProfile: (updates) =>
          set((state) => ({
            profile: { ...state.profile, ...updates },
          })),

        updateSettings: (updates) =>
          set((state) => ({
            settings: { ...state.settings, ...updates },
          })),

        setTodayCompletion: (habitId, completed) =>
          set((state) => {
            const now = new Date()
            const yearStr = now.getFullYear().toString()
            const monthStr = (now.getMonth() + 1).toString()
            const dayStr = now.getDate().toString()
            const newLogs = { ...state.logs }
            if (!newLogs[yearStr]) newLogs[yearStr] = {}
            if (!newLogs[yearStr][monthStr]) newLogs[yearStr][monthStr] = {}
            if (!newLogs[yearStr][monthStr][habitId]) newLogs[yearStr][monthStr][habitId] = {}
            newLogs[yearStr][monthStr][habitId][dayStr] = completed
            return { logs: newLogs }
          }),

        saveProgressBackup: (source) => {
          const state = get()
          saveBackup(
            {
              habits: state.habits,
              logs: state.logs,
              profile: state.profile,
              settings: state.settings,
              selectedMonth: state.selectedMonth,
              selectedYear: state.selectedYear,
            },
            source,
          )
        },

        restoreProgressBackup: () => {
          const backup = getLatestBackup()
          if (!backup) return false
          set({
            habits: backup.habits.map((h) => migrateHabit(h as Habit)),
            logs: backup.logs,
            profile: backup.profile,
            settings: backup.settings,
            selectedMonth: backup.selectedMonth,
            selectedYear: backup.selectedYear,
          })
          return true
        },

        getLatestBackupLabel: () => {
          const backup = getLatestBackup()
          return backup ? formatBackupLabel(backup) : null
        },

        resetData: () => {
          const state = get()
          saveBackup(
            {
              habits: state.habits,
              logs: state.logs,
              profile: state.profile,
              settings: state.settings,
              selectedMonth: state.selectedMonth,
              selectedYear: state.selectedYear,
            },
            'pre-reset',
          )
          const habits = DEFAULT_HABITS
          set({
            habits,
            logs: generateDemoLogs(habits),
          })
        },

        clearDatabase: () => {
          const state = get()
          saveBackup(
            {
              habits: state.habits,
              logs: state.logs,
              profile: state.profile,
              settings: state.settings,
              selectedMonth: state.selectedMonth,
              selectedYear: state.selectedYear,
            },
            'pre-reset',
          )
          set({
            habits: [],
            logs: {},
            profile: { name: '', affirmationText: '', photoDataURL: '' },
            settings: {
              darkMode: false,
              accentColor: '#F4A0B8',
              showWeekends: true,
              startDayOfWeek: 1,
              appVersion: '1.0.0',
            },
            selectedMonth: new Date().getMonth() + 1,
            selectedYear: new Date().getFullYear(),
          })
        },
      }
    },
    {
      name: 'habit-tracker-storage',
      partialize: (state) => ({
        habits: state.habits,
        logs: state.logs,
        profile: state.profile,
        settings: state.settings,
        selectedMonth: state.selectedMonth,
        selectedYear: state.selectedYear,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        state.habits = state.habits.map((h) => migrateHabit(h))
      },
    },
  ),
)

