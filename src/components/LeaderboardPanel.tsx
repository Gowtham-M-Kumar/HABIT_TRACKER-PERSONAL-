import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHabitStore } from '../store/habitStore'
import { getLeaderboardData } from '../utils/habitUtils'

export const LeaderboardPanel: React.FC = () => {
  const habits = useHabitStore((state) => state.habits)
  const logs = useHabitStore((state) => state.logs)
  const selectedMonth = useHabitStore((state) => state.selectedMonth)
  const selectedYear = useHabitStore((state) => state.selectedYear)

  const rankedHabits = useMemo(() => {
    return getLeaderboardData(habits, logs, selectedYear, selectedMonth).slice(0, 10)
  }, [habits, logs, selectedYear, selectedMonth])

  return (
    <div className="bg-white dark:bg-zinc-900 border border-app-border dark:border-zinc-800 rounded-xl p-4 card-shadow flex flex-col h-full min-h-[200px] hover:border-yellow-brand/30 transition-colors duration-300">
      <div className="flex items-center justify-between mb-3 border-b border-app-border dark:border-zinc-800 pb-2">
        <span className="text-[11px] font-bold tracking-wider uppercase text-ink3 dark:text-zinc-400 flex items-center gap-1.5">
          🏆 Top 10 Leaderboard
        </span>
        <span className="text-[9px] text-ink2 dark:text-zinc-500 font-medium">
          Ranked by %
        </span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pr-0.5">
        {rankedHabits.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-ink3 dark:text-zinc-500">
            No habits active
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 relative">
            <AnimatePresence mode="popLayout">
              {rankedHabits.map((item, index) => {
                const rank = index + 1
                // Define special style for top 3 ranks
                const rankColor = 
                  rank === 1 
                    ? 'bg-yellow-light text-yellow-dark dark:bg-amber-900/30 dark:text-amber-300' 
                    : rank === 2 
                      ? 'bg-blue-light text-blue-dark dark:bg-zinc-800 dark:text-zinc-300' 
                      : rank === 3 
                        ? 'bg-coral-light text-coral-dark dark:bg-orange-900/20 dark:text-orange-300'
                        : 'bg-slate-50 text-ink2 dark:bg-zinc-800/50 dark:text-zinc-400'

                return (
                  <motion.div
                    key={item.habit.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 25,
                      mass: 0.8
                    }}
                    className="flex items-center justify-between p-2 rounded-lg border border-app-border/40 dark:border-zinc-800/40 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors duration-150"
                  >
                    {/* Left Rank and Name */}
                    <div className="flex items-center gap-2 truncate">
                      <span className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full flex-shrink-0 ${rankColor}`}>
                        {rank}
                      </span>
                      <span className="text-[12px] select-none" role="img" aria-label={item.habit.name}>
                        {item.habit.iconEmoji || '✨'}
                      </span>
                      <span className="text-[11px] font-semibold text-ink dark:text-zinc-200 truncate">
                        {item.habit.name}
                      </span>
                    </div>

                    {/* Right completion Rate */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Color Dot indicator */}
                      <span 
                        style={{ backgroundColor: item.habit.color }}
                        className="w-1.5 h-1.5 rounded-full"
                      />
                      <span className="text-[10px] font-mono font-bold text-ink2 dark:text-zinc-300">
                        {Math.round(item.completionPercentage)}%
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
