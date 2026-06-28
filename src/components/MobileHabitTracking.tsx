import React, { useMemo, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useHabitStore } from '../store/habitStore'
import type { Habit } from '../store/habitStore'
import { getDaysInMonth, getDayOfWeekLabel, getHabitStats } from '../utils/habitUtils'
import { ChevronRight } from 'lucide-react'

interface MobileDayCellProps {
  habit: Habit
  day: number
  year: number
  month: number
  isCompleted: boolean
  isToday: boolean
  isWeekend: boolean
}

const MobileDayCell: React.FC<MobileDayCellProps> = ({
  habit,
  day,
  year,
  month,
  isCompleted,
  isToday,
  isWeekend,
}) => {
  const toggleDay = useHabitStore((s) => s.toggleDay)

  return (
    <motion.button
      type="button"
      onClick={() => toggleDay(year, month, habit.id, day)}
      whileTap={{ scale: 0.88 }}
      animate={{ scale: isCompleted ? [1, 1.15, 1] : 1 }}
      transition={{ type: 'spring', stiffness: 450, damping: 18 }}
      className={`
        w-7 h-7 rounded-lg border flex-shrink-0 cursor-pointer flex items-center justify-center
        transition-colors duration-150 touch-manipulation
        ${isCompleted
          ? 'border-transparent text-white shadow-sm'
          : isWeekend
            ? 'border-app-border/70 bg-slate-50 dark:border-zinc-700/80 dark:bg-zinc-800/50'
            : 'border-app-border bg-white dark:border-zinc-700 dark:bg-zinc-900/80'}
        ${isToday ? 'ring-2 ring-blue-dark/80 dark:ring-blue-brand ring-offset-1 dark:ring-offset-zinc-900' : ''}
        focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-brand/60
      `}
      style={{ backgroundColor: isCompleted ? habit.color : undefined }}
      aria-label={`${habit.name}, day ${day}, ${isCompleted ? 'completed' : 'not completed'}`}
    >
      {isCompleted ? (
        <svg className="w-3.5 h-3.5 text-white stroke-[2.5px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <span className="text-[9px] font-mono font-medium text-ink3/60 dark:text-zinc-600">{day}</span>
      )}
    </motion.button>
  )
}

interface HabitRowProps {
  habit: Habit
  year: number
  month: number
  daysArray: number[]
  isCurrentMonth: boolean
  currentDay: number
  habitLogs: Record<string, boolean>
  scrollRef?: React.RefObject<HTMLDivElement | null>
}

const HabitRow: React.FC<HabitRowProps> = ({
  habit,
  year,
  month,
  daysArray,
  isCurrentMonth,
  currentDay,
  habitLogs,
  scrollRef,
}) => (
  <div className="flex items-center gap-2.5 py-3 px-3.5 min-h-[52px]">
    <div className="flex items-center gap-2 min-w-0 flex-shrink-0 w-[108px]">
      <span className="text-[17px] leading-none select-none flex-shrink-0" role="img" aria-hidden>
        {habit.iconEmoji || '✨'}
      </span>
      <span className="text-[13px] font-semibold text-ink dark:text-zinc-100 truncate leading-tight">
        {habit.name}
      </span>
    </div>

    <div
      ref={scrollRef}
      className="flex-1 min-w-0 overflow-x-auto no-scrollbar overscroll-x-contain -mr-1 pr-1"
    >
      <div className="flex gap-1.5 items-center w-max py-0.5">
        {daysArray.map((day) => {
          const dayLabel = getDayOfWeekLabel(year, month, day)
          const isWeekend = dayLabel === 'S'
          const isToday = isCurrentMonth && day === currentDay
          const isCompleted = !!habitLogs[day.toString()]

          return (
            <MobileDayCell
              key={day}
              habit={habit}
              day={day}
              year={year}
              month={month}
              isCompleted={isCompleted}
              isToday={isToday}
              isWeekend={isWeekend}
            />
          )
        })}
      </div>
    </div>
  </div>
)

export const MobileHabitTracking: React.FC = () => {
  const habits = useHabitStore((s) => s.habits)
  const logs = useHabitStore((s) => s.logs)
  const selectedMonth = useHabitStore((s) => s.selectedMonth)
  const selectedYear = useHabitStore((s) => s.selectedYear)

  const activeHabits = habits.filter((h) => h.active)
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth)
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const today = new Date()
  const currentDay = today.getDate()
  const isCurrentMonth = today.getMonth() + 1 === selectedMonth && today.getFullYear() === selectedYear

  const firstRowScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isCurrentMonth || !firstRowScrollRef.current) return
    const cellWidth = 28 + 6
    const scrollTo = Math.max(0, (currentDay - 3) * cellWidth)
    firstRowScrollRef.current.scrollLeft = scrollTo
  }, [isCurrentMonth, currentDay, selectedMonth, selectedYear])

  const tableData = useMemo(
    () =>
      activeHabits.map((habit) => ({
        habit,
        ...getHabitStats(logs, selectedYear, selectedMonth, habit.id, habit.goal),
      })),
    [activeHabits, logs, selectedYear, selectedMonth],
  )

  return (
    <div className="space-y-3">
      {/* Habit grid */}
      <section className="bg-white dark:bg-zinc-900 border border-app-border/80 dark:border-zinc-800 rounded-2xl overflow-hidden card-shadow">
        <div className="px-4 py-3.5 border-b border-app-border/60 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-[13px] font-bold text-ink dark:text-zinc-100 tracking-tight">
              Daily Habits
            </h2>
            <p className="text-[11px] text-ink3 dark:text-zinc-500 mt-0.5">
              Tap a day to mark complete
            </p>
          </div>
          <div className="flex items-center gap-0.5 text-[10px] font-medium text-ink3 dark:text-zinc-500">
            <span>Scroll</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {activeHabits.length === 0 ? (
          <div className="py-10 px-4 text-center">
            <p className="text-sm font-medium text-ink2 dark:text-zinc-400">No habits yet</p>
            <p className="text-[11px] text-ink3 dark:text-zinc-500 mt-1">
              Open settings to add your first habit
            </p>
          </div>
        ) : (
          <div className="divide-y divide-app-border/50 dark:divide-zinc-800/80">
            {activeHabits.map((habit, index) => {
              const habitLogs =
                logs[selectedYear.toString()]?.[selectedMonth.toString()]?.[habit.id] || {}

              return (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  year={selectedYear}
                  month={selectedMonth}
                  daysArray={daysArray}
                  isCurrentMonth={isCurrentMonth}
                  currentDay={currentDay}
                  habitLogs={habitLogs}
                  scrollRef={index === 0 ? firstRowScrollRef : undefined}
                />
              )
            })}
          </div>
        )}
      </section>

      {/* Goal progress */}
      {activeHabits.length > 0 && (
        <section className="bg-white dark:bg-zinc-900 border border-app-border/80 dark:border-zinc-800 rounded-2xl overflow-hidden card-shadow">
          <div className="px-4 py-3.5 border-b border-app-border/60 dark:border-zinc-800">
            <h2 className="text-[13px] font-bold text-ink dark:text-zinc-100 tracking-tight">
              Goal Progress
            </h2>
            <p className="text-[11px] text-ink3 dark:text-zinc-500 mt-0.5">
              Monthly targets & streaks
            </p>
          </div>

          <div className="divide-y divide-app-border/40 dark:divide-zinc-800/60">
            {tableData.map(({ habit, completedCount, goalProgressPercentage, longestStreak }) => (
              <div key={habit.id} className="px-4 py-3 flex items-center gap-3">
                <span className="text-base flex-shrink-0" role="img" aria-hidden>
                  {habit.iconEmoji || '✨'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[12px] font-semibold text-ink dark:text-zinc-200 truncate">
                      {habit.name}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-ink2 dark:text-zinc-400 flex-shrink-0">
                      {completedCount}
                      <span className="text-ink3 dark:text-zinc-500 font-normal">/{habit.goal}</span>
                    </span>
                  </div>
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
                {longestStreak > 0 && (
                  <span className="text-[10px] font-mono font-bold text-coral-dark dark:text-coral-brand flex-shrink-0 tabular-nums">
                    🔥{longestStreak}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
