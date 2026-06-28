import type { CompletionLogs, Habit } from '../store/habitStore'

// Helper to get number of days in a month (1-indexed month)
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate()
}

// Helper to get day of week name (M, T, W, T, F, S, S)
export const getDayOfWeekLabel = (year: number, month: number, day: number): string => {
  const date = new Date(year, month - 1, day)
  const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, etc.
  const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  return labels[dayOfWeek]
}

// Calculate the longest consecutive streak of checked days in the selected month
export const calculateLongestStreak = (
  logs: CompletionLogs,
  year: number,
  month: number,
  habitId: string
): number => {
  const yearStr = year.toString()
  const monthStr = month.toString()
  const totalDays = getDaysInMonth(year, month)
  
  let maxStreak = 0
  let currentStreak = 0
  
  const habitLogs = logs[yearStr]?.[monthStr]?.[habitId] || {}
  
  for (let day = 1; day <= totalDays; day++) {
    if (habitLogs[day.toString()]) {
      currentStreak++
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak
      }
    } else {
      currentStreak = 0
    }
  }
  
  return maxStreak
}

// Calculate completion stats for a habit in the selected month
export const getHabitStats = (
  logs: CompletionLogs,
  year: number,
  month: number,
  habitId: string,
  goal: number
) => {
  const yearStr = year.toString()
  const monthStr = month.toString()
  const totalDays = getDaysInMonth(year, month)
  
  let completedCount = 0
  const habitLogs = logs[yearStr]?.[monthStr]?.[habitId] || {}
  
  for (let day = 1; day <= totalDays; day++) {
    if (habitLogs[day.toString()]) {
      completedCount++
    }
  }
  
  const completionPercentage = totalDays > 0 ? (completedCount / totalDays) * 100 : 0
  const goalProgressPercentage = goal > 0 ? Math.min((completedCount / goal) * 100, 100) : 0
  
  return {
    completedCount,
    completionPercentage,
    goalProgressPercentage,
    longestStreak: calculateLongestStreak(logs, year, month, habitId)
  }
}

// Calculate the overall completion percentage of the entire dashboard for a specific day
export const getDayCompletionStats = (
  habits: Habit[],
  logs: CompletionLogs,
  year: number,
  month: number,
  day: number
) => {
  const activeHabits = habits.filter(h => h.active)
  if (activeHabits.length === 0) return { completed: 0, total: 0, percentage: 0 }
  
  const yearStr = year.toString()
  const monthStr = month.toString()
  const dayStr = day.toString()
  
  let completed = 0
  activeHabits.forEach(habit => {
    if (logs[yearStr]?.[monthStr]?.[habit.id]?.[dayStr]) {
      completed++
    }
  })
  
  return {
    completed,
    total: activeHabits.length,
    percentage: (completed / activeHabits.length) * 100
  }
}

// Divide month into 5 weeks
export const getWeeksInMonth = (year: number, month: number) => {
  const totalDays = getDaysInMonth(year, month)
  
  const weeks = [
    { name: 'Week 1', days: Array.from({ length: 7 }, (_, i) => i + 1) },
    { name: 'Week 2', days: Array.from({ length: 7 }, (_, i) => i + 8) },
    { name: 'Week 3', days: Array.from({ length: 7 }, (_, i) => i + 15) },
    { name: 'Week 4', days: Array.from({ length: 7 }, (_, i) => i + 22) },
    { name: 'Week 5', days: Array.from({ length: Math.max(0, totalDays - 28) }, (_, i) => i + 29) }
  ]
  
  return weeks.filter(w => w.days.length > 0)
}

// Get the weekly completion percentage across all active habits
export const getWeeklyCompletionPercentage = (
  habits: Habit[],
  logs: CompletionLogs,
  year: number,
  month: number,
  days: number[]
): number => {
  const activeHabits = habits.filter(h => h.active)
  if (activeHabits.length === 0 || days.length === 0) return 0
  
  const yearStr = year.toString()
  const monthStr = month.toString()
  
  let totalPossible = activeHabits.length * days.length
  let totalCompleted = 0
  
  activeHabits.forEach(habit => {
    const habitLogs = logs[yearStr]?.[monthStr]?.[habit.id] || {}
    days.forEach(day => {
      if (habitLogs[day.toString()]) {
        totalCompleted++
      }
    })
  })
  
  return (totalCompleted / totalPossible) * 100
}

// Get the cumulative monthly stats (X / total possible cells checked)
export const getMonthlyCumulativeStats = (
  habits: Habit[],
  logs: CompletionLogs,
  year: number,
  month: number
) => {
  const activeHabits = habits.filter(h => h.active)
  const totalDays = getDaysInMonth(year, month)
  
  const totalPossible = activeHabits.length * totalDays
  if (totalPossible === 0) return { completed: 0, total: 0, percentage: 0 }
  
  const yearStr = year.toString()
  const monthStr = month.toString()
  
  let completed = 0
  activeHabits.forEach(habit => {
    const habitLogs = logs[yearStr]?.[monthStr]?.[habit.id] || {}
    for (let d = 1; d <= totalDays; d++) {
      if (habitLogs[d.toString()]) {
        completed++
      }
    }
  })
  
  return {
    completed,
    total: totalPossible,
    percentage: (completed / totalPossible) * 100
  }
}

// Get leaderboard sorted habits
export const getLeaderboardData = (
  habits: Habit[],
  logs: CompletionLogs,
  year: number,
  month: number
) => {
  const activeHabits = habits.filter(h => h.active)
  
  const ranked = activeHabits.map(habit => {
    const stats = getHabitStats(logs, year, month, habit.id, habit.goal)
    return {
      habit,
      completionPercentage: stats.completionPercentage,
      completedCount: stats.completedCount
    }
  })
  
  // Sort descending by completion percentage, then by completed count, then alphabetically
  return ranked.sort((a, b) => {
    if (b.completionPercentage !== a.completionPercentage) {
      return b.completionPercentage - a.completionPercentage
    }
    if (b.completedCount !== a.completedCount) {
      return b.completedCount - a.completedCount
    }
    return a.habit.name.localeCompare(b.habit.name)
  })
}
