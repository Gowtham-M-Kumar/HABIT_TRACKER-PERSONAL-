import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHabitStore } from '../store/habitStore'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const YEARS = [2025, 2026, 2027, 2028]

export const MonthHero: React.FC = () => {
  const selectedMonth = useHabitStore((state) => state.selectedMonth)
  const selectedYear = useHabitStore((state) => state.selectedYear)
  const setDate = useHabitStore((state) => state.setDate)

  const monthName = MONTHS[selectedMonth - 1]

  return (
    <div className="bg-white dark:bg-zinc-900 border border-app-border dark:border-zinc-800 rounded-xl p-5 card-shadow flex flex-col justify-between h-full min-h-[160px] group hover:border-pink-brand/30 transition-colors duration-300">
      <div>
        <AnimatePresence mode="wait">
          <motion.h2
            key={`${selectedMonth}-${selectedYear}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="text-4xl font-serif-display font-bold text-ink dark:text-zinc-100 leading-none tracking-tight"
          >
            {monthName}
          </motion.h2>
        </AnimatePresence>
        <p className="text-[10px] font-bold text-pink-dark dark:text-pink-brand uppercase tracking-[0.25em] mt-2">
          Habit Tracker
        </p>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <label className="text-[9px] font-bold uppercase tracking-wider text-ink3 dark:text-zinc-500 sr-only">
          Month
        </label>
        <select
          value={selectedMonth}
          onChange={(e) => setDate(selectedYear, parseInt(e.target.value))}
          className="flex-1 text-[11px] font-semibold text-ink dark:text-zinc-300 bg-pink-light/40 dark:bg-zinc-800 border border-app-border dark:border-zinc-700 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-brand/50 cursor-pointer hover:border-pink-brand/40 transition-colors"
          aria-label="Select month"
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setDate(parseInt(e.target.value), selectedMonth)}
          className="w-[72px] text-[11px] font-semibold text-ink dark:text-zinc-300 bg-blue-light/40 dark:bg-zinc-800 border border-app-border dark:border-zinc-700 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-brand/50 cursor-pointer hover:border-blue-brand/40 transition-colors"
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
