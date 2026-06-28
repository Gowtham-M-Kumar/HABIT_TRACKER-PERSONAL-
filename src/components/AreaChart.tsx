import React, { useMemo } from 'react'
import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useHabitStore } from '../store/habitStore'
import { getDaysInMonth, getDayCompletionStats } from '../utils/habitUtils'

export const AreaChart: React.FC = () => {
  const habits = useHabitStore((state) => state.habits)
  const logs = useHabitStore((state) => state.logs)
  const selectedMonth = useHabitStore((state) => state.selectedMonth)
  const selectedYear = useHabitStore((state) => state.selectedYear)

  const chartData = useMemo(() => {
    const daysCount = getDaysInMonth(selectedYear, selectedMonth)
    return Array.from({ length: daysCount }, (_, i) => {
      const day = i + 1
      const stats = getDayCompletionStats(habits, logs, selectedYear, selectedMonth, day)
      return {
        dayName: day.toString(),
        percentage: Math.round(stats.percentage)
      }
    })
  }, [habits, logs, selectedMonth, selectedYear])

  const isEmpty = habits.filter(h => h.active).length === 0

  return (
    <div className="bg-white dark:bg-zinc-900 border border-app-border/80 dark:border-zinc-800 rounded-2xl md:rounded-xl p-4 card-shadow min-h-[200px] md:min-h-[160px] md:h-full flex flex-col justify-between hover:border-blue-brand/30 transition-colors duration-300">
      <div className="flex justify-between items-start gap-2 mb-2 md:mb-1">
        <div>
          <h2 className="text-[13px] md:text-[11px] font-bold tracking-tight md:tracking-wider md:uppercase text-ink dark:text-zinc-100 md:text-ink3 md:dark:text-zinc-400">
            Monthly Trend
          </h2>
          <p className="text-[11px] text-ink3 dark:text-zinc-500 mt-0.5 md:hidden">
            Daily completion rate
          </p>
        </div>
        <span className="text-[10px] text-ink2 dark:text-zinc-500 font-mono flex-shrink-0">
          1–{chartData.length}
        </span>
      </div>

      <div className="w-full flex-1 min-h-[160px] md:min-h-0 relative">
        {isEmpty ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-ink3 dark:text-zinc-500">
            Add habits to view trend
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsAreaChart
              data={chartData}
              margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A8C5E8" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#E8EFFC" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="#E8E4F0" 
                className="dark:stroke-zinc-800"
              />
              <XAxis 
                dataKey="dayName" 
                stroke="#9090b0" 
                fontSize={9}
                tickLine={false}
                axisLine={false}
                dy={5}
              />
              <YAxis 
                domain={[0, 100]} 
                stroke="#9090b0" 
                fontSize={9}
                tickLine={false}
                axisLine={false}
                dx={-5}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-ink dark:bg-zinc-800 text-white dark:text-zinc-100 text-[10px] px-2 py-1 rounded shadow-md border border-zinc-700/50">
                        <p className="font-bold">Day {payload[0].payload.dayName}</p>
                        <p className="font-mono">{payload[0].value}% Done</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area 
                type="monotone" 
                dataKey="percentage" 
                stroke="#4A7FAB" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPercentage)" 
                animationDuration={400}
              />
            </RechartsAreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
