import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSyncStore } from '../store/syncStore'
import { resolveConflict } from '../services/syncEngine'

export const ConflictResolutionModal: React.FC = () => {
  const conflict = useSyncStore((s) => s.pendingConflict)

  return (
    <AnimatePresence>
      {conflict && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(92vw,420px)] bg-white dark:bg-zinc-950 border border-app-border dark:border-zinc-800 rounded-2xl shadow-2xl z-[61] p-5"
          >
            <h3 className="text-sm font-bold text-ink dark:text-zinc-100 mb-1">Sync Conflict</h3>
            <p className="text-[11px] text-ink2 dark:text-zinc-400 mb-4">
              &ldquo;{conflict.habitName}&rdquo; was edited in both Habit Tracker and Google Tasks at the same time. Which version should we keep?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <ConflictCard
                title="Habit Tracker"
                snapshot={conflict.localSnapshot}
                updatedAt={conflict.localUpdatedAt}
              />
              <ConflictCard
                title="Google Tasks"
                snapshot={conflict.remoteSnapshot}
                updatedAt={conflict.remoteUpdatedAt}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => resolveConflict('local')}
                className="flex-1 text-[11px] font-bold text-white bg-pink-dark dark:bg-pink-brand py-2.5 rounded-lg cursor-pointer hover:opacity-95"
              >
                Keep Habit Tracker
              </button>
              <button
                type="button"
                onClick={() => resolveConflict('remote')}
                className="flex-1 text-[11px] font-bold text-ink dark:text-zinc-200 border border-app-border dark:border-zinc-700 py-2.5 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800"
              >
                Keep Google Tasks
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function ConflictCard({
  title,
  snapshot,
  updatedAt,
}: {
  title: string
  snapshot: { name: string; completed: boolean; goal: number; dueDate: string | null }
  updatedAt: string
}) {
  return (
    <div className="rounded-xl border border-app-border dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 p-3 text-[10px]">
      <p className="font-bold uppercase tracking-wider text-ink3 mb-2">{title}</p>
      <p className="font-semibold text-ink dark:text-zinc-200">{snapshot.name}</p>
      <p className="text-ink2 dark:text-zinc-400 mt-1">Goal: {snapshot.goal} days</p>
      <p className="text-ink2 dark:text-zinc-400">Status: {snapshot.completed ? 'Completed' : 'Active'}</p>
      <p className="text-ink2 dark:text-zinc-400">Due: {snapshot.dueDate ?? 'None'}</p>
      <p className="text-[9px] text-ink3 mt-2">{new Date(updatedAt).toLocaleString()}</p>
    </div>
  )
}
