export const WEEK_COLORS = [
  { main: '#A8D8EA', dark: '#4A7FAB', light: '#EFF5FC' },
  { main: '#F4A0B8', dark: '#C4607A', light: '#FDF0F4' },
  { main: '#8ED4B4', dark: '#2E7D52', light: '#F0FAF4' },
  { main: '#F5D87A', dark: '#B8942A', light: '#FFFBEE' },
  { main: '#C0A8E8', dark: '#6B4FA8', light: '#F5F0FD' },
] as const

export const getWeekIndexForDay = (day: number): number => {
  if (day <= 7) return 0
  if (day <= 14) return 1
  if (day <= 21) return 2
  if (day <= 28) return 3
  return 4
}
