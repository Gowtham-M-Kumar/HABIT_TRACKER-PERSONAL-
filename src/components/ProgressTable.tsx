import React, { useMemo } from 'react'
import { useHabitStore } from '../store/habitStore'
import { getHabitStats } from '../utils/habitUtils'

export const ProgressTable: React.FC = () => {
  const habits = useHabitStore((state) => state.habits)
  const logs = useHabitStore((state) => state.logs)
  const selectedMonth = useHabitStore((state) => state.selectedMonth)
  const selectedYear = useHabitStore((state) => state.selectedYear)

  const activeHabits = habits.filter((h) => h.active)

  const tableData = useMemo(() => {
    return activeHabits.map((habit) => {
      const stats = getHabitStats(logs, selectedYear, selectedMonth, habit.id, habit.goal)
      return {
        habit,
        ...stats
      }
    })
  }, [activeHabits, logs, selectedYear, selectedMonth])

  return (
    <div className="bg-white dark:bg-zinc-900 border border-app-border dark:border-zinc-800 rounded-xl p-4 card-shadow flex flex-col h-[280px]">
      <div className="flex items-center justify-between mb-3 border-b border-app-border dark:border-zinc-800 pb-2">
        <span className="text-[11px] font-bold tracking-wider uppercase text-ink3 dark:text-zinc-400 flex items-center gap-1.5">
          📋 Daily Progress Table
        </span>
        <span className="text-[9px] text-ink2 dark:text-zinc-500 font-medium">
          Goal progress & streaks
        </span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {tableData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-ink3 dark:text-zinc-500">
            No habits active
          </div>
        ) : (
          <div className="min-w-[400px] flex flex-col text-left">
            {/* Headers */}
            <div className="flex items-center text-[9px] font-bold uppercase tracking-wider text-ink3 dark:text-zinc-500 mb-2 px-1">
              <div className="w-[140px] truncate">Habit</div>
              <div className="flex-1 px-2">Progress</div>
              <div className="w-[60px] text-center">Count</div>
              <div className="w-[60px] text-right">Streak</div>
            </div>

            {/* Rows */}
            <div className="flex flex-col gap-1.5">
              {tableData.map(({ habit, completedCount, goalProgressPercentage, longestStreak }) => {
                return (
                  <div 
                    key={habit.id}
                    className="flex items-center p-1.5 rounded-lg border border-app-border/30 dark:border-zinc-800/30 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors duration-150"
                  >
                    {/* Name */}
                    <div className="w-[140px] flex items-center gap-1.5 truncate">
                      <span className="text-xs select-none" role="img" aria-label={habit.name}>
                        {habit.iconEmoji || '✨'}
                      </span>
                      <span className="text-[11px] font-semibold text-ink dark:text-zinc-200 truncate">
                        {habit.name}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex-1 px-2">
                      <div className="h-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden relative border border-slate-200/20 dark:border-zinc-700/20">
                        <div 
                          style={{ 
                            width: `${goalProgressPercentage}%`, 
                            backgroundColor: habit.color 
                          }}
                          className="h-full rounded-full transition-all duration-300 ease-out"
                        />
                      </div>
                    </div>

                    {/* Count */}
                    <div className="w-[60px] text-center text-[10px] font-mono font-bold text-ink2 dark:text-zinc-300">
                      {completedCount} <span className="text-ink3 dark:text-zinc-500 font-normal">/ {habit.goal}</span>
                    </div>

                    {/* Streak */}
                    <div className="w-[60px] text-right flex items-center justify-end gap-0.5">
                      {longestStreak > 0 ? (
                        <>
                          <span className="text-[9px] select-none" role="img" aria-label="Streak fire">🔥</span>
                          <span className="text-[10px] font-mono font-bold text-coral-dark dark:text-coral-brand">
                            {longestStreak}d
                          </span>
                        </>
                      ) : (
                        <span className="text-[10px] font-mono text-ink3 dark:text-zinc-600">—</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
