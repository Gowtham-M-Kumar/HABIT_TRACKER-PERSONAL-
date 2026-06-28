import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useHabitStore } from '../store/habitStore'
import type { Habit } from '../store/habitStore'
import { getDaysInMonth, getDayOfWeekLabel, getHabitStats } from '../utils/habitUtils'
import { WEEK_COLORS, getWeekIndexForDay } from '../constants/weekColors'
import { TrackingContext, useTrackingHover, type TrackingContextValue } from '../hooks/useTrackingHover'

const ROW_HEIGHT = 36

interface DayCellProps {
  habit: Habit
  day: number
  year: number
  month: number
  isCompleted: boolean
  isToday: boolean
  isWeekend: boolean
  weekColor: string
  isRowHighlighted: boolean
  isColHighlighted: boolean
}

const DayCell: React.FC<DayCellProps> = ({
  habit, day, year, month, isCompleted, isToday, isWeekend, weekColor,
  isRowHighlighted, isColHighlighted,
}) => {
  const toggleDay = useHabitStore((s) => s.toggleDay)
  const { setHoveredHabitId, setHoveredDay } = useTrackingHover()

  return (
    <motion.button
      type="button"
      onClick={() => toggleDay(year, month, habit.id, day)}
      onMouseEnter={() => { setHoveredHabitId(habit.id); setHoveredDay(day) }}
      onMouseLeave={() => { setHoveredHabitId(null); setHoveredDay(null) }}
      whileTap={{ scale: 0.82 }}
      animate={{ scale: isCompleted ? [1, 1.2, 1] : 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className={`
        w-5 h-5 rounded-[4px] border flex-shrink-0 cursor-pointer flex items-center justify-center
        transition-all duration-150 relative spring-pop
        ${isCompleted
          ? 'border-transparent text-white shadow-sm'
          : isWeekend
            ? 'border-app-border/60 bg-slate-100/60 dark:border-zinc-700 dark:bg-zinc-800/40'
            : 'border-app-border bg-white dark:border-zinc-700 dark:bg-zinc-900/60'}
        ${isToday ? 'ring-2 ring-blue-dark dark:ring-blue-brand ring-offset-1 dark:ring-offset-zinc-900' : ''}
        ${isRowHighlighted || isColHighlighted ? 'ring-1 ring-purple-brand/40 z-10' : ''}
        focus:outline-none focus:ring-2 focus:ring-purple-brand/50
      `}
      style={{
        backgroundColor: isCompleted ? habit.color : isColHighlighted ? `${weekColor}40` : undefined,
      }}
      title={`${habit.name} — Day ${day}`}
      aria-label={`Toggle ${habit.name} on day ${day}`}
    >
      {isCompleted && (
        <svg className="w-3 h-3 text-white stroke-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </motion.button>
  )
}

export const HabitTrackingSection: React.FC = () => {
  const habits = useHabitStore((s) => s.habits)
  const logs = useHabitStore((s) => s.logs)
  const selectedMonth = useHabitStore((s) => s.selectedMonth)
  const selectedYear = useHabitStore((s) => s.selectedYear)

  const [hoveredHabitId, setHoveredHabitId] = useState<string | null>(null)
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)

  const activeHabits = habits.filter((h) => h.active)
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth)
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const today = new Date()
  const currentDay = today.getDate()
  const isCurrentMonth = today.getMonth() + 1 === selectedMonth && today.getFullYear() === selectedYear

  const tableData = useMemo(() =>
    activeHabits.map((habit) => ({
      habit,
      ...getHabitStats(logs, selectedYear, selectedMonth, habit.id, habit.goal),
    })),
  [activeHabits, logs, selectedYear, selectedMonth])

  const ctx: TrackingContextValue = {
    hoveredHabitId, hoveredDay, setHoveredHabitId, setHoveredDay,
  }

  return (
    <TrackingContext.Provider value={ctx}>
      <div className="bg-white dark:bg-zinc-900 border border-app-border dark:border-zinc-800 rounded-2xl overflow-hidden card-shadow ring-1 ring-black/[0.02] dark:ring-white/[0.04] transition-shadow duration-300 hover:shadow-lg">
        <div className="px-4 py-3 bg-gradient-to-r from-pink-light/60 via-blue-light/40 to-teal-light/30 dark:from-zinc-900 dark:via-zinc-900/95 dark:to-zinc-900 border-b border-app-border/80 dark:border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-brand animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider uppercase text-ink dark:text-zinc-300">
              Daily Habits · Grid · Progress
            </span>
          </div>
          <span className="text-[9px] text-ink2 dark:text-zinc-500 font-medium hidden sm:block bg-white/60 dark:bg-zinc-800/60 px-2 py-0.5 rounded-full">
            Hover to highlight · Click to toggle
          </span>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* LEFT — Daily Habits List */}
          <div className="lg:w-[min(220px,22%)] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-app-border dark:border-zinc-800 bg-pink-light/5 dark:bg-zinc-900/50">
            <div className="px-3 py-2 bg-pink-light/20 dark:bg-zinc-800/30 border-b border-app-border/50 dark:border-zinc-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-pink-dark dark:text-pink-brand">
                Daily Habits
              </span>
            </div>
            <div className="p-2 overflow-y-auto no-scrollbar max-h-[320px] lg:max-h-none">
              {activeHabits.length === 0 ? (
                <p className="text-xs text-ink3 dark:text-zinc-500 text-center py-6">No habits yet</p>
              ) : (
                activeHabits.map((habit, index) => {
                  const isHighlighted = hoveredHabitId === habit.id
                  return (
                    <div
                      key={habit.id}
                      onMouseEnter={() => setHoveredHabitId(habit.id)}
                      onMouseLeave={() => setHoveredHabitId(null)}
                      style={{ height: ROW_HEIGHT }}
                      className={`
                        flex items-center gap-2 px-2 rounded-lg cursor-default transition-all duration-150
                        ${isHighlighted
                          ? 'bg-pink-light/60 dark:bg-pink-brand/10 scale-[1.01] shadow-sm'
                          : 'hover:bg-slate-50/80 dark:hover:bg-zinc-800/40'}
                      `}
                    >
                      <span
                        className="w-5 h-5 flex items-center justify-center text-[9px] font-bold rounded-full flex-shrink-0"
                        style={{ backgroundColor: `${habit.color}30`, color: habit.color }}
                      >
                        {index + 1}
                      </span>
                      <span className="text-sm select-none flex-shrink-0" role="img" aria-hidden>
                        {habit.iconEmoji || '✨'}
                      </span>
                      <span className="text-[11px] font-semibold text-ink dark:text-zinc-200 truncate" title={habit.name}>
                        {habit.name}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* CENTER — Habit Grid */}
          <div className="flex-1 min-w-0 border-b lg:border-b-0 lg:border-r border-app-border dark:border-zinc-800 bg-gradient-to-b from-white to-blue-light/10 dark:from-zinc-900 dark:to-zinc-900/80">
            <div className="p-3 overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain">
              <div className="min-w-[640px]">
                {/* Week band headers */}
                <div className="flex mb-1 pl-0">
                  {[0, 1, 2, 3, 4].map((wi) => {
                    const weekDays = daysArray.filter((d) => getWeekIndexForDay(d) === wi)
                    if (weekDays.length === 0) return null
                    const colors = WEEK_COLORS[wi]
                    return (
                      <div
                        key={wi}
                        style={{
                          width: weekDays.length * 23 - 3,
                          backgroundColor: colors.light,
                          color: colors.dark,
                        }}
                        className="text-[8px] font-bold uppercase tracking-wider text-center py-0.5 rounded-t-md mr-[3px] last:mr-0 dark:opacity-90"
                      >
                        Week {wi + 1}
                      </div>
                    )
                  })}
                </div>

                {/* Day headers */}
                <div className="flex items-end mb-1">
                  <div className="flex gap-[3px]">
                    {daysArray.map((day) => {
                      const dayLabel = getDayOfWeekLabel(selectedYear, selectedMonth, day)
                      const isWeekend = dayLabel === 'S'
                      const isToday = isCurrentMonth && day === currentDay
                      const isColHighlighted = hoveredDay === day
                      const wi = getWeekIndexForDay(day)
                      const colors = WEEK_COLORS[wi]

                      return (
                        <div
                          key={day}
                          style={{
                            backgroundColor: isColHighlighted ? `${colors.main}50` : `${colors.light}80`,
                          }}
                          className={`w-5 flex flex-col items-center justify-center py-0.5 rounded-t transition-colors duration-150 ${
                            isToday ? 'font-bold' : ''
                          }`}
                        >
                          <span
                            className={`text-[9px] font-mono leading-none ${
                              isToday ? 'text-blue-dark dark:text-blue-brand' : 'text-ink2 dark:text-zinc-400'
                            }`}
                          >
                            {day}
                          </span>
                          <span className={`text-[7px] uppercase ${isWeekend ? 'text-coral-dark dark:text-coral-brand' : 'text-ink3 dark:text-zinc-500'}`}>
                            {dayLabel}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Checkbox rows */}
                {activeHabits.length === 0 ? (
                  <div className="py-8 text-center text-xs text-ink3">Add habits in settings</div>
                ) : (
                  activeHabits.map((habit) => {
                    const habitLogs = logs[selectedYear.toString()]?.[selectedMonth.toString()]?.[habit.id] || {}
                    const isRowHighlighted = hoveredHabitId === habit.id

                    return (
                      <div
                        key={habit.id}
                        style={{ height: ROW_HEIGHT }}
                        className={`flex items-center rounded transition-colors duration-150 ${
                          isRowHighlighted ? 'bg-blue-light/40 dark:bg-blue-brand/5' : ''
                        }`}
                      >
                        <div className="flex gap-[3px]">
                          {daysArray.map((day) => {
                            const isCompleted = !!habitLogs[day.toString()]
                            const dayLabel = getDayOfWeekLabel(selectedYear, selectedMonth, day)
                            const isWeekend = dayLabel === 'S'
                            const isToday = isCurrentMonth && day === currentDay
                            const wi = getWeekIndexForDay(day)

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
                                weekColor={WEEK_COLORS[wi].main}
                                isRowHighlighted={isRowHighlighted}
                                isColHighlighted={hoveredDay === day}
                              />
                            )
                          })}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — Daily Progress Table */}
          <div className="lg:w-[min(250px,24%)] flex-shrink-0 bg-teal-light/5 dark:bg-zinc-900/50">
            <div className="px-3 py-2 bg-teal-light/30 dark:bg-zinc-800/30 border-b border-app-border/50 dark:border-zinc-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-dark dark:text-teal-brand">
                Daily Progress
              </span>
            </div>
            <div className="p-2 overflow-y-auto no-scrollbar max-h-[320px] lg:max-h-none">
              {/* Column headers */}
              <div
                style={{ height: 28 }}
                className="flex items-center text-[8px] font-bold uppercase tracking-wider text-ink3 dark:text-zinc-500 px-1 mb-0.5"
              >
                <div className="w-8 text-center">Goal</div>
                <div className="flex-1 px-1">%</div>
                <div className="w-12 text-center">Count</div>
                <div className="w-10 text-right">Streak</div>
              </div>

              {tableData.length === 0 ? (
                <p className="text-xs text-ink3 text-center py-6">—</p>
              ) : (
                tableData.map(({ habit, completedCount, goalProgressPercentage, longestStreak }) => {
                  const isHighlighted = hoveredHabitId === habit.id
                  return (
                    <div
                      key={habit.id}
                      onMouseEnter={() => setHoveredHabitId(habit.id)}
                      onMouseLeave={() => setHoveredHabitId(null)}
                      style={{ height: ROW_HEIGHT }}
                      className={`
                        flex items-center px-1 rounded-lg transition-all duration-150
                        ${isHighlighted
                          ? 'bg-teal-light/50 dark:bg-teal-brand/10 shadow-sm'
                          : 'hover:bg-slate-50/60 dark:hover:bg-zinc-800/30'}
                      `}
                    >
                      <div className="w-8 text-center text-[10px] font-mono font-bold text-ink2 dark:text-zinc-300">
                        {habit.goal}
                      </div>
                      <div className="flex-1 px-1">
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={false}
                            animate={{ width: `${goalProgressPercentage}%` }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            style={{ backgroundColor: habit.color }}
                            className="h-full rounded-full"
                          />
                        </div>
                      </div>
                      <div className="w-12 text-center text-[9px] font-mono font-bold text-ink2 dark:text-zinc-300">
                        {completedCount}<span className="text-ink3 dark:text-zinc-500 font-normal">/{habit.goal}</span>
                      </div>
                      <div className="w-10 text-right">
                        {longestStreak > 0 ? (
                          <span className="text-[9px] font-mono font-bold text-coral-dark dark:text-coral-brand">
                            🔥{longestStreak}
                          </span>
                        ) : (
                          <span className="text-[9px] text-ink3">—</span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </TrackingContext.Provider>
  )
}
