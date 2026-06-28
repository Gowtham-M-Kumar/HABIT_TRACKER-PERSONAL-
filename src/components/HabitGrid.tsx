import React from 'react'
import { motion } from 'framer-motion'
import { useHabitStore } from '../store/habitStore'
import type { Habit } from '../store/habitStore'
import { getDaysInMonth, getDayOfWeekLabel } from '../utils/habitUtils'

interface DayCellProps {
  habit: Habit
  day: number
  year: number
  month: number
  isCompleted: boolean
  isToday: boolean
  isWeekend: boolean
}

const DayCell: React.FC<DayCellProps> = ({
  habit,
  day,
  year,
  month,
  isCompleted,
  isToday,
  isWeekend
}) => {
  const toggleDay = useHabitStore((state) => state.toggleDay)

  const handleToggle = () => {
    // Only toggle if not in the future (optional, but blueprints say "editing only allowed in current month" - wait, let's allow toggling any day of the selected month as requested, but maybe add visual hint for today)
    toggleDay(year, month, habit.id, day)
  }

  return (
    <motion.button
      type="button"
      onClick={handleToggle}
      whileTap={{ scale: 0.85 }}
      animate={{
        scale: isCompleted ? [1, 1.25, 1] : 1,
        backgroundColor: isCompleted ? habit.color : 'transparent'
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 15
      }}
      className={`
        w-5 h-5 rounded-[4px] border flex-shrink-0 cursor-pointer flex items-center justify-center transition-colors duration-150 relative spring-pop
        ${isCompleted 
          ? 'border-transparent text-white' 
          : isWeekend 
            ? 'border-app-border bg-slate-100/50 dark:border-zinc-800 dark:bg-zinc-800/30' 
            : 'border-app-border bg-white dark:border-zinc-800 dark:bg-zinc-900/50'}
        ${isToday ? 'ring-2 ring-blue-dark dark:ring-blue-brand ring-offset-1 dark:ring-offset-zinc-900' : ''}
        focus:outline-none focus:ring-1 focus:ring-purple-brand/50
      `}
      title={`${habit.name} - Day ${day}`}
      aria-label={`Toggle ${habit.name} on day ${day}`}
    >
      {isCompleted && (
        <svg className="w-3.5 h-3.5 text-white stroke-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </motion.button>
  )
}

export const HabitGrid: React.FC = () => {
  const habits = useHabitStore((state) => state.habits)
  const logs = useHabitStore((state) => state.logs)
  const selectedMonth = useHabitStore((state) => state.selectedMonth)
  const selectedYear = useHabitStore((state) => state.selectedYear)

  const activeHabits = habits.filter((h) => h.active)
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth)

  // Detect if today matches the displayed month/year
  const today = new Date()
  const currentDay = today.getDate()
  const isCurrentMonth = today.getMonth() + 1 === selectedMonth && today.getFullYear() === selectedYear

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="bg-white dark:bg-zinc-900 border border-app-border dark:border-zinc-800 rounded-xl overflow-hidden card-shadow">
      {/* Header Panel */}
      <div className="px-4 py-3 bg-pink-light/30 dark:bg-zinc-900/20 border-b border-app-border dark:border-zinc-800 flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-wider uppercase text-ink3 dark:text-zinc-400 flex items-center gap-1.5">
          📅 Habit Grid
        </span>
        <span className="text-[10px] text-ink2 dark:text-zinc-500 font-medium">
          Horizontal scroll for 31 days
        </span>
      </div>

      <div className="p-4 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="min-w-[820px] flex flex-col select-none">
          {/* Day Headers Row */}
          <div className="flex items-center mb-2.5">
            {/* Corner Cell */}
            <div className="w-[180px] pr-4 text-[10px] font-bold uppercase tracking-wider text-ink3 dark:text-zinc-500 text-left">
              Habit
            </div>
            
            {/* Days Cells */}
            <div className="flex gap-[3px]">
              {daysArray.map((day) => {
                const dayLabel = getDayOfWeekLabel(selectedYear, selectedMonth, day)
                const isWeekend = dayLabel === 'S'
                const isToday = isCurrentMonth && day === currentDay

                return (
                  <div
                    key={day}
                    className={`w-5 flex flex-col items-center justify-center ${
                      isToday 
                        ? 'text-blue-dark dark:text-blue-brand font-bold' 
                        : isWeekend 
                          ? 'text-ink3 dark:text-zinc-500 font-semibold' 
                          : 'text-ink2 dark:text-zinc-400'
                    }`}
                  >
                    <span className="text-[10px] block leading-none mb-1 font-mono">{day}</span>
                    <span className={`text-[8px] uppercase tracking-tighter ${isWeekend ? 'text-coral-dark dark:text-coral-brand' : ''}`}>
                      {dayLabel}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Habit Rows */}
          {activeHabits.length === 0 ? (
            <div className="py-8 text-center text-xs text-ink3 dark:text-zinc-500">
              No habits defined. Add habits in settings.
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {activeHabits.map((habit) => {
                const habitLogs = logs[selectedYear.toString()]?.[selectedMonth.toString()]?.[habit.id] || {}

                return (
                  <div key={habit.id} className="flex items-center py-0.5 hover:bg-slate-50 dark:hover:bg-zinc-800/20 rounded transition-colors duration-150">
                    {/* Habit Title Column */}
                    <div className="w-[180px] pr-4 flex items-center gap-2 text-left truncate">
                      <span className="text-sm select-none" role="img" aria-label={habit.name}>
                        {habit.iconEmoji || '✨'}
                      </span>
                      <span className="text-[12px] font-semibold text-ink dark:text-zinc-200 truncate" title={habit.name}>
                        {habit.name}
                      </span>
                    </div>

                    {/* Day Checkboxes */}
                    <div className="flex gap-[3px]">
                      {daysArray.map((day) => {
                        const isCompleted = !!habitLogs[day.toString()]
                        const dayLabel = getDayOfWeekLabel(selectedYear, selectedMonth, day)
                        const isWeekend = dayLabel === 'S'
                        const isToday = isCurrentMonth && day === currentDay

                        return (
                          <DayCell
                            key={day}
                            habit={habit}
                            day={day}
                            year={selectedYear}
                            month={selectedMonth}
                            isCompleted={isCompleted}
                            isToday={isToday}
                            isWeekend={isWeekend}
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
