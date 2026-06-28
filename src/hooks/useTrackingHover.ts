import { createContext, useContext } from 'react'

export interface TrackingContextValue {
  hoveredHabitId: string | null
  hoveredDay: number | null
  setHoveredHabitId: (id: string | null) => void
  setHoveredDay: (day: number | null) => void
}

export const TrackingContext = createContext<TrackingContextValue | null>(null)

export function useTrackingHover() {
  const ctx = useContext(TrackingContext)
  if (!ctx) throw new Error('useTrackingHover must be used within HabitTrackingSection')
  return ctx
}
