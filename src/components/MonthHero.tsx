import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHabitStore } from '../store/habitStore'
import { getDayCompletionStats } from '../utils/habitUtils'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const YEARS = [2025, 2026, 2027, 2028]

export const MonthHero: React.FC = () => {
  const selectedMonth = useHabitStore((state) => state.selectedMonth)
  const selectedYear = useHabitStore((state) => state.selectedYear)
  const setDate = useHabitStore((state) => state.setDate)
  const habits = useHabitStore((state) => state.habits)
  const logs = useHabitStore((state) => state.logs)

  const monthName = MONTHS[selectedMonth - 1]

  const todaySummary = useMemo(() => {
    const today = new Date()
    const isCurrentMonth =
      today.getMonth() + 1 === selectedMonth && today.getFullYear() === selectedYear
    if (!isCurrentMonth) return null
    const stats = getDayCompletionStats(
      habits,
      logs,
      selectedYear,
      selectedMonth,
      today.getDate(),
    )
    return { day: today.getDate(), ...stats }
  }, [habits, logs, selectedMonth, selectedYear])

  return (
    <div className="bg-white dark:bg-zinc-900 border border-app-border dark:border-zinc-800 rounded-2xl md:rounded-xl p-4 md:p-5 card-shadow flex flex-col justify-between min-h-0 md:min-h-[160px] group hover:border-pink-brand/30 transition-colors duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.h2
              key={`${selectedMonth}-${selectedYear}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="text-3xl md:text-4xl font-serif-display font-bold text-ink dark:text-zinc-100 leading-none tracking-tight"
            >
              {monthName}
            </motion.h2>
          </AnimatePresence>
          <p className="text-[10px] font-bold text-pink-dark dark:text-pink-brand uppercase tracking-[0.2em] mt-1.5 md:mt-2">
            Habit Tracker
          </p>
        </div>

        {todaySummary && (
          <div className="flex-shrink-0 text-right bg-pink-light/50 dark:bg-pink-brand/10 rounded-xl px-3 py-2 border border-pink-brand/15 dark:border-pink-brand/20 md:hidden">
            <p className="text-[10px] font-bold uppercase tracking-wider text-pink-dark dark:text-pink-brand">
              Today
            </p>
            <p className="text-lg font-mono font-bold text-ink dark:text-zinc-100 leading-tight mt-0.5">
              {todaySummary.completed}/{todaySummary.total}
            </p>
            <p className="text-[10px] text-ink3 dark:text-zinc-500">
              Day {todaySummary.day}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-4 md:mt-4">
        <select
          value={selectedMonth}
          onChange={(e) => setDate(selectedYear, parseInt(e.target.value))}
          className="flex-1 text-[12px] md:text-[11px] font-semibold text-ink dark:text-zinc-300 bg-slate-50 dark:bg-zinc-800 border border-app-border dark:border-zinc-700 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-brand/50 cursor-pointer touch-manipulation"
          aria-label="Select month"
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setDate(parseInt(e.target.value), selectedMonth)}
          className="w-[76px] text-[12px] md:text-[11px] font-semibold text-ink dark:text-zinc-300 bg-slate-50 dark:bg-zinc-800 border border-app-border dark:border-zinc-700 px-3 py-2.5 md:py-1.5 rounded-xl md:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-brand/50 cursor-pointer touch-manipulation"
          aria-label="Select year"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
