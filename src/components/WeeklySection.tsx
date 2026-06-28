import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useHabitStore } from '../store/habitStore'
import { getWeeksInMonth, getDayCompletionStats, getWeeklyCompletionPercentage, getDayOfWeekLabel } from '../utils/habitUtils'
import { ProgressRing } from './ProgressRings'
import { WEEK_COLORS } from '../constants/weekColors'

export const WeeklySection: React.FC = () => {
  const habits = useHabitStore((state) => state.habits)
  const logs = useHabitStore((state) => state.logs)
  const selectedMonth = useHabitStore((state) => state.selectedMonth)
  const selectedYear = useHabitStore((state) => state.selectedYear)

  const activeHabits = habits.filter((h) => h.active)
  const weeks = useMemo(() => getWeeksInMonth(selectedYear, selectedMonth), [selectedYear, selectedMonth])

  return (
    <div className="bg-white dark:bg-zinc-900 border border-app-border/80 dark:border-zinc-800 rounded-2xl md:rounded-xl p-4 card-shadow flex flex-col">
      <div className="mb-3">
        <h2 className="text-[13px] md:text-[11px] font-bold tracking-tight md:tracking-wider md:uppercase text-ink dark:text-zinc-100 md:text-ink3 md:dark:text-zinc-400">
          Weekly Breakdown
        </h2>
        <p className="text-[11px] text-ink3 dark:text-zinc-500 mt-0.5 md:hidden">
          Swipe to see all weeks
        </p>
      </div>

      <div className="flex md:grid md:grid-cols-5 gap-3 overflow-x-auto no-scrollbar overscroll-x-contain pb-1 -mx-1 px-1 md:mx-0 md:px-0 md:overflow-visible md:pb-0 flex-1">
        {weeks.map((week, weekIndex) => {
          const colors = WEEK_COLORS[weekIndex % WEEK_COLORS.length]
          const weekPercentage = getWeeklyCompletionPercentage(habits, logs, selectedYear, selectedMonth, week.days)
          const daysStats = week.days.map((day) => {
            const stats = getDayCompletionStats(habits, logs, selectedYear, selectedMonth, day)
            const dayLabel = getDayOfWeekLabel(selectedYear, selectedMonth, day)
            return {
              day,
              dayLabel,
              percentage: stats.percentage,
            }
          })

          return (
            <div
              key={week.name}
              style={{ backgroundColor: colors.light }}
              className="min-w-[132px] flex-shrink-0 md:min-w-0 md:flex-shrink rounded-xl md:rounded-lg p-3 md:p-2 flex flex-col justify-between items-center text-center dark:bg-zinc-800/20 dark:border dark:border-zinc-800 border border-transparent transition-colors duration-150"
            >
              {/* Week Title */}
              <span 
                style={{ color: colors.dark }}
                className="text-[9px] font-bold uppercase tracking-wider mb-2 block"
              >
                {week.name}
              </span>

              {/* Day Bars Container */}
              <div className="w-full flex items-end justify-center h-16 gap-1.5 px-1 relative mb-2">
                {activeHabits.length === 0 ? (
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] text-ink3 dark:text-zinc-500">
                    No habits
                  </span>
                ) : (
                  daysStats.map((d, index) => (
                    <div 
                      key={d.day} 
                      className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer relative"
                    >
                      {/* Tooltip on Hover */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-ink text-white dark:bg-zinc-800 dark:text-zinc-200 text-[8px] px-1 py-0.5 rounded shadow pointer-events-none z-10 whitespace-nowrap">
                        Day {d.day}: {Math.round(d.percentage)}%
                      </div>

                      {/* Animated Bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${d.percentage || 1}%` }} // Min 1% height to make it visible
                        transition={{ 
                          delay: index * 0.03, 
                          type: 'spring', 
                          stiffness: 150, 
                          damping: 15 
                        }}
                        style={{ 
                          backgroundColor: colors.main,
                          opacity: d.percentage === 0 ? 0.2 : 1
                        }}
                        className="w-1.5 rounded-t-sm"
                      />
                      
                      {/* Day Label */}
                      <span className="text-[7px] text-ink2 dark:text-zinc-400 mt-1 font-mono font-bold leading-none">
                        {d.day}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Weekly Overall Ring */}
              <div className="mt-auto pt-2 border-t border-dotted border-app-border dark:border-zinc-700/50 w-full flex flex-col items-center">
                <ProgressRing
                  percentage={weekPercentage}
                  size={46}
                  strokeWidth={4.5}
                  color={colors.dark}
                  trackColor="rgba(255, 255, 255, 0.6)"
                >
                  <span className="text-[8px] font-mono-pct font-bold" style={{ color: colors.dark }}>
                    {Math.round(weekPercentage)}%
                  </span>
                </ProgressRing>
                <span className="text-[7px] font-semibold text-ink3 dark:text-zinc-500 mt-1 uppercase tracking-tight">
                  Week Score
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
