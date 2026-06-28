import { create } from 'zustand'

export interface SyncNotification {
  id: string
  title: string
  message: string
  kind: 'info' | 'success' | 'warning' | 'error'
}

interface NotificationState {
  notifications: SyncNotification[]
  addNotification: (notification: Omit<SyncNotification, 'id'>) => void
  dismissNotification: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (notification) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    set((state) => ({ notifications: [...state.notifications, { ...notification, id }] }))
  },
  dismissNotification: (id) => set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),
  clearAll: () => set({ notifications: [] }),
}))
