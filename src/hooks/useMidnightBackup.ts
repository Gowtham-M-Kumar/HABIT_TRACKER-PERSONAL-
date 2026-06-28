import { useEffect } from 'react'
import { useHabitStore } from '../store/habitStore'
import {
  markMidnightBackupDone,
  msUntilNextMidnight,
  shouldRunMidnightBackup,
} from '../utils/backupStorage'

/** Schedules daily progress snapshots at local midnight */
export function useMidnightBackup(): void {
  const saveProgressBackup = useHabitStore((s) => s.saveProgressBackup)

  useEffect(() => {
    const runIfNeeded = () => {
      if (shouldRunMidnightBackup()) {
        saveProgressBackup('midnight')
        markMidnightBackupDone()
      }
    }

    runIfNeeded()

    let intervalId: ReturnType<typeof setInterval> | undefined
    const timeoutId = setTimeout(() => {
      runIfNeeded()
      intervalId = setInterval(runIfNeeded, 24 * 60 * 60 * 1000)
    }, msUntilNextMidnight())

    return () => {
      clearTimeout(timeoutId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [saveProgressBackup])
}
