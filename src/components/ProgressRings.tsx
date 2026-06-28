import React, { useMemo, useEffect, useState } from 'react'
import { useHabitStore } from '../store/habitStore'
import { getDaysInMonth, getDayCompletionStats, getMonthlyCumulativeStats } from '../utils/habitUtils'

interface RingProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color: string
  trackColor?: string
  children?: React.ReactNode
}

export const ProgressRing: React.FC<RingProps> = ({
  percentage,
  size = 72,
  strokeWidth = 6,
  color,
  trackColor = '#E8E4F0',
  children
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const [offset, setOffset] = useState(circumference)

  useEffect(() => {
    const progressOffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference
    setOffset(progressOffset)
  }, [percentage, circumference])

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          className="transition-colors duration-300"
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.4s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}

export const ProgressRings: React.FC = () => {
  const habits = useHabitStore((state) => state.habits)
  const logs = useHabitStore((state) => state.logs)
  const selectedMonth = useHabitStore((state) => state.selectedMonth)
  const selectedYear = useHabitStore((state) => state.selectedYear)
  // Determine active tracking day for "Today's Progress"
  const trackingDay = useMemo(() => {
    const today = new Date()
    const isCurrentMonth = today.getMonth() + 1 === selectedMonth && today.getFullYear() === selectedYear
    if (isCurrentMonth) {
      return today.getDate()
    }
    // If past, default to last day. If future, default to 1st.
    const nowSelected = new Date(selectedYear, selectedMonth - 1, 1)
    const current = new Date()
    if (nowSelected < new Date(current.getFullYear(), current.getMonth(), 1)) {
      return getDaysInMonth(selectedYear, selectedMonth)
    }
    return 1
  }, [selectedMonth, selectedYear])

  // Today completion
  const todayStats = useMemo(() => {
    return getDayCompletionStats(habits, logs, selectedYear, selectedMonth, trackingDay)
  }, [habits, logs, selectedYear, selectedMonth, trackingDay])

  // Cumulative monthly completes
  const monthlyStats = useMemo(() => {
    return getMonthlyCumulativeStats(habits, logs, selectedYear, selectedMonth)
  }, [habits, logs, selectedYear, selectedMonth])

  return (
    <div className="bg-white dark:bg-zinc-900 border border-app-border dark:border-zinc-800 rounded-xl p-4 card-shadow flex flex-col justify-between h-full min-h-[160px] hover:border-green-brand/30 transition-colors duration-300">
      <span className="text-[11px] font-bold tracking-wider uppercase text-ink3 dark:text-zinc-400 block">
        Daily Progress
      </span>

      <div className="grid grid-cols-2 gap-3 flex-1 items-center mt-2">
        {/* Ring 1: Today's Completion */}
        <div className="flex flex-col items-center justify-center group cursor-default">
          <div className="transition-transform duration-200 group-hover:scale-105">
            <ProgressRing
              percentage={todayStats.percentage}
              size={80}
              strokeWidth={7}
              color="#C4607A"
              trackColor="var(--color-pink-light)"
            >
              <span className="text-[12px] font-mono-pct font-bold text-pink-dark dark:text-pink-brand">
                {Math.round(todayStats.percentage)}%
              </span>
            </ProgressRing>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-pink-dark dark:text-pink-brand mt-2">
            Today
          </span>
          <span className="text-[8px] font-mono text-ink3 dark:text-zinc-500">
            Day {trackingDay} · {todayStats.completed}/{todayStats.total}
          </span>
        </div>

        {/* Ring 2: Monthly Cumulative */}
        <div className="flex flex-col items-center justify-center group cursor-default">
          <div className="transition-transform duration-200 group-hover:scale-105">
            <ProgressRing
              percentage={monthlyStats.percentage}
              size={80}
              strokeWidth={7}
              color="#2E7D52"
              trackColor="var(--color-green-light)"
            >
              <span className="text-[12px] font-mono-pct font-bold text-green-dark dark:text-green-brand">
                {Math.round(monthlyStats.percentage)}%
              </span>
            </ProgressRing>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-green-dark dark:text-green-brand mt-2">
            Habits
          </span>
          <span className="text-[8px] font-mono text-ink3 dark:text-zinc-500">
            {monthlyStats.completed} / {monthlyStats.total} cells
          </span>
        </div>
      </div>
    </div>
  )
}
