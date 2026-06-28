import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSyncStore } from '../store/syncStore'
import {
  resolvePendingDeletion,
  resolvePendingDuplicate,
  resolvePendingNewTask,
} from '../services/syncEngine'

export const SyncDecisionModal: React.FC = () => {
  const pendingDuplicateResolution = useSyncStore((state) => state.pendingDuplicateResolution)
  const pendingDeletionResolution = useSyncStore((state) => state.pendingDeletionResolution)
  const pendingNewTaskImport = useSyncStore((state) => state.pendingNewTaskImport)

  if (pendingDuplicateResolution) {
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[67] flex items-center justify-center bg-black/55 p-4">
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} className="w-full max-w-md rounded-2xl border border-app-border bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-sm font-bold text-ink dark:text-zinc-100">Duplicate habit detected</h3>
            <p className="mt-2 text-[11px] leading-relaxed text-ink2 dark:text-zinc-400">
              A habit named “{pendingDuplicateResolution.existingHabit.name}” already exists. Choose how to handle “{pendingDuplicateResolution.task.title ?? 'Untitled Task'}”.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button type="button" onClick={() => void resolvePendingDuplicate('link')} className="rounded-lg bg-pink-dark px-3 py-2 text-[11px] font-bold text-white dark:bg-pink-brand">Link to Existing Habit</button>
              <button type="button" onClick={() => void resolvePendingDuplicate('new')} className="rounded-lg border border-app-border px-3 py-2 text-[11px] font-bold text-ink2 dark:border-zinc-700 dark:text-zinc-300">Import as New Habit</button>
              <button type="button" onClick={() => void resolvePendingDuplicate('skip')} className="rounded-lg border border-app-border px-3 py-2 text-[11px] font-bold text-ink2 dark:border-zinc-700 dark:text-zinc-300">Skip</button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  if (pendingDeletionResolution) {
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[67] flex items-center justify-center bg-black/55 p-4">
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} className="w-full max-w-md rounded-2xl border border-app-border bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-sm font-bold text-ink dark:text-zinc-100">Google Task deleted</h3>
            <p className="mt-2 text-[11px] leading-relaxed text-ink2 dark:text-zinc-400">
              “{pendingDeletionResolution.taskTitle}” was deleted in Google Tasks. What should happen to the linked habit?
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button type="button" onClick={() => void resolvePendingDeletion('delete')} className="rounded-lg bg-pink-dark px-3 py-2 text-[11px] font-bold text-white dark:bg-pink-brand">Delete linked habit</button>
              <button type="button" onClick={() => void resolvePendingDeletion('keep')} className="rounded-lg border border-app-border px-3 py-2 text-[11px] font-bold text-ink2 dark:border-zinc-700 dark:text-zinc-300">Keep habit locally</button>
              <button type="button" onClick={() => void resolvePendingDeletion('disconnect')} className="rounded-lg border border-app-border px-3 py-2 text-[11px] font-bold text-ink2 dark:border-zinc-700 dark:text-zinc-300">Disconnect sync</button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  if (pendingNewTaskImport) {
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[67] flex items-center justify-center bg-black/55 p-4">
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} className="w-full max-w-md rounded-2xl border border-app-border bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-sm font-bold text-ink dark:text-zinc-100">New Google Task detected</h3>
            <p className="mt-2 text-[11px] leading-relaxed text-ink2 dark:text-zinc-400">
              “{pendingNewTaskImport.task.title ?? 'Untitled Task'}” is available in Google Tasks. Would you like to track it as a habit?
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button type="button" onClick={() => void resolvePendingNewTask('import')} className="rounded-lg bg-pink-dark px-3 py-2 text-[11px] font-bold text-white dark:bg-pink-brand">Import</button>
              <button type="button" onClick={() => void resolvePendingNewTask('ignore')} className="rounded-lg border border-app-border px-3 py-2 text-[11px] font-bold text-ink2 dark:border-zinc-700 dark:text-zinc-300">Ignore</button>
              <button type="button" onClick={() => void resolvePendingNewTask('never')} className="rounded-lg border border-app-border px-3 py-2 text-[11px] font-bold text-ink2 dark:border-zinc-700 dark:text-zinc-300">Never Ask Again</button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return null
}
