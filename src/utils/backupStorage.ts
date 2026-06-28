import type { CompletionLogs, Habit, Profile, Settings } from '../store/habitStore'

export type BackupSource = 'midnight' | 'manual' | 'pre-reset'

export interface BackupSnapshot {
  id: string
  savedAt: string
  source: BackupSource
  habits: Habit[]
  logs: CompletionLogs
  profile: Profile
  settings: Settings
  selectedMonth: number
  selectedYear: number
}

const BACKUP_KEY = 'habit-tracker-backups'
const LAST_MIDNIGHT_KEY = 'habit-tracker-last-midnight-backup'
const MAX_BACKUPS = 14

export interface BackupPayload {
  habits: Habit[]
  logs: CompletionLogs
  profile: Profile
  settings: Settings
  selectedMonth: number
  selectedYear: number
}

function readBackups(): BackupSnapshot[] {
  try {
    const raw = localStorage.getItem(BACKUP_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as BackupSnapshot[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeBackups(backups: BackupSnapshot[]): void {
  localStorage.setItem(BACKUP_KEY, JSON.stringify(backups.slice(0, MAX_BACKUPS)))
}

export function saveBackup(payload: BackupPayload, source: BackupSource): BackupSnapshot {
  const snapshot: BackupSnapshot = {
    id: `${Date.now()}`,
    savedAt: new Date().toISOString(),
    source,
    ...payload,
  }
  const backups = readBackups()
  backups.unshift(snapshot)
  writeBackups(backups)
  return snapshot
}

export function getLatestBackup(): BackupSnapshot | null {
  return readBackups()[0] ?? null
}

export function getBackupCount(): number {
  return readBackups().length
}

export function formatBackupLabel(backup: BackupSnapshot): string {
  const date = new Date(backup.savedAt)
  const when = date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
  const tag =
    backup.source === 'midnight'
      ? 'Midnight auto-save'
      : backup.source === 'pre-reset'
        ? 'Before reset'
        : 'Manual save'
  return `${tag} · ${when}`
}

const todayKey = (): string => new Date().toISOString().slice(0, 10)

export function shouldRunMidnightBackup(): boolean {
  return localStorage.getItem(LAST_MIDNIGHT_KEY) !== todayKey()
}

export function markMidnightBackupDone(): void {
  localStorage.setItem(LAST_MIDNIGHT_KEY, todayKey())
}

export function msUntilNextMidnight(): number {
  const now = new Date()
  const next = new Date(now)
  next.setHours(24, 0, 0, 0)
  return next.getTime() - now.getTime()
}
