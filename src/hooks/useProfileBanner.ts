import { useMemo, useRef, type ChangeEvent } from 'react'
import { useHabitStore } from '../store/habitStore'
import { getHabitStats } from '../utils/habitUtils'

export function useProfileBanner() {
  const profile = useHabitStore((s) => s.profile)
  const habits = useHabitStore((s) => s.habits)
  const logs = useHabitStore((s) => s.logs)
  const selectedMonth = useHabitStore((s) => s.selectedMonth)
  const selectedYear = useHabitStore((s) => s.selectedYear)
  const updateProfile = useHabitStore((s) => s.updateProfile)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const goalsMetCount = useMemo(() => {
    let metCount = 0
    habits.filter((h) => h.active).forEach((h) => {
      const stats = getHabitStats(logs, selectedYear, selectedMonth, h.id, h.goal)
      if (stats.completedCount >= h.goal) metCount++
    })
    return metCount
  }, [habits, logs, selectedYear, selectedMonth])

  const motivationalMessage = useMemo(() => {
    if (goalsMetCount === 0) return 'Every step counts. Complete a habit to start your streak!'
    if (goalsMetCount === 1) return "Goal reached for 1 habit! That's a great start. Keep going!"
    return `Goal reached for ${goalsMetCount} habits — consistency pays off!`
  }, [goalsMetCount])

  const handlePhotoClick = () => fileInputRef.current?.click()

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        updateProfile({ photoDataURL: reader.result })
      }
    }
    reader.readAsDataURL(file)
  }

  return {
    profile,
    motivationalMessage,
    fileInputRef,
    handlePhotoClick,
    handlePhotoChange,
  }
}
