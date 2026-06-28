import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
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
        ...stats,
      }
    })
  }, [activeHabits, logs, selectedYear, selectedMonth])

  return (
    <div className="bg-white dark:bg-zinc-900 border border-app-border/80 dark:border-zinc-800 rounded-2xl md:rounded-xl p-4 card-shadow flex flex-col md:h-[280px]">
      <div className="flex items-center justify-between mb-3 border-b border-app-border/60 dark:border-zinc-800 pb-3">
        <div>
          <h2 className="text-[13px] md:text-[11px] font-bold tracking-tight md:tracking-wider md:uppercase text-ink dark:text-zinc-100 md:text-ink3 md:dark:text-zinc-400">
            Progress Details
          </h2>
          <p className="text-[11px] text-ink3 dark:text-zinc-500 mt-0.5 md:hidden">
            Goals, counts & streaks
          </p>
        </div>
        <span className="hidden md:inline text-[9px] text-ink2 dark:text-zinc-500 font-medium">
          Goal progress & streaks
        </span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {tableData.length === 0 ? (
          <div className="h-full min-h-[120px] flex items-center justify-center text-sm text-ink3 dark:text-zinc-500">
            No habits active
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block min-w-[400px] flex flex-col text-left">
              <div className="flex items-center text-[9px] font-bold uppercase tracking-wider text-ink3 dark:text-zinc-500 mb-2 px-1">
                <div className="w-[140px] truncate">Habit</div>
                <div className="flex-1 px-2">Progress</div>
                <div className="w-[60px] text-center">Count</div>
                <div className="w-[60px] text-right">Streak</div>
              </div>

              <div className="flex flex-col gap-1.5">
                {tableData.map(({ habit, completedCount, goalProgressPercentage, longestStreak }) => (
                  <div
                    key={habit.id}
                    className="flex items-center p-1.5 rounded-lg border border-app-border/30 dark:border-zinc-800/30 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors duration-150"
                  >
                    <div className="w-[140px] flex items-center gap-1.5 truncate">
                      <span className="text-xs select-none" role="img" aria-label={habit.name}>
                        {habit.iconEmoji || '✨'}
                      </span>
                      <span className="text-[11px] font-semibold text-ink dark:text-zinc-200 truncate">
                        {habit.name}
                      </span>
                    </div>

                    <div className="flex-1 px-2">
                      <div className="h-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden relative border border-slate-200/20 dark:border-zinc-700/20">
                        <div
                          style={{
                            width: `${goalProgressPercentage}%`,
                            backgroundColor: habit.color,
                          }}
                          className="h-full rounded-full transition-all duration-300 ease-out"
                        />
                      </div>
                    </div>

                    <div className="w-[60px] text-center text-[10px] font-mono font-bold text-ink2 dark:text-zinc-300">
                      {completedCount}{' '}
                      <span className="text-ink3 dark:text-zinc-500 font-normal">/ {habit.goal}</span>
                    </div>

                    <div className="w-[60px] text-right flex items-center justify-end gap-0.5">
                      {longestStreak > 0 ? (
                        <>
                          <span className="text-[9px] select-none" role="img" aria-label="Streak fire">
                            🔥
                          </span>
                          <span className="text-[10px] font-mono font-bold text-coral-dark dark:text-coral-brand">
                            {longestStreak}d
                          </span>
                        </>
                      ) : (
                        <span className="text-[10px] font-mono text-ink3 dark:text-zinc-600">—</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col gap-2">
              {tableData.map(({ habit, completedCount, goalProgressPercentage, longestStreak }) => (
                <div
                  key={habit.id}
                  className="rounded-xl border border-app-border/50 dark:border-zinc-800/80 p-3 bg-slate-50/40 dark:bg-zinc-800/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base" role="img" aria-hidden>
                      {habit.iconEmoji || '✨'}
                    </span>
                    <span className="text-[13px] font-semibold text-ink dark:text-zinc-100 truncate flex-1">
                      {habit.name}
                    </span>
                    {longestStreak > 0 && (
                      <span className="text-[10px] font-mono font-bold text-coral-dark dark:text-coral-brand flex-shrink-0">
                        🔥 {longestStreak}d
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="h-1.5 flex-1 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={false}
                        animate={{ width: `${goalProgressPercentage}%` }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        style={{ backgroundColor: habit.color }}
                        className="h-full rounded-full"
                      />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-ink2 dark:text-zinc-300 flex-shrink-0 tabular-nums">
                      {completedCount}/{habit.goal}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
