import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useNotificationStore } from '../store/notificationStore'

export const SyncNotificationCenter: React.FC = () => {
  const notifications = useNotificationStore((state) => state.notifications)
  const dismissNotification = useNotificationStore((state) => state.dismissNotification)

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex w-[min(92vw,360px)] flex-col gap-2">
      <AnimatePresence initial={false}>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className={`rounded-xl border px-3 py-3 shadow-lg backdrop-blur ${
              notification.kind === 'success'
                ? 'border-green-200 bg-green-50 text-green-900 dark:border-green-900/50 dark:bg-green-950/80 dark:text-green-200'
                : notification.kind === 'warning'
                  ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/80 dark:text-amber-200'
                  : notification.kind === 'error'
                    ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/80 dark:text-red-200'
                    : 'border-app-border bg-white text-ink dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold">{notification.title}</p>
                <p className="mt-1 text-[10px] leading-relaxed opacity-90">{notification.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismissNotification(notification.id)}
                className="rounded p-1 hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
