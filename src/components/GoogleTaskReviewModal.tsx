import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSyncStore } from '../store/syncStore'
import { importSelectedGoogleTasks } from '../services/syncEngine'

export const GoogleTaskReviewModal: React.FC = () => {
  const review = useSyncStore((state) => state.pendingImportReview)
  const show = useSyncStore((state) => state.showTaskReviewModal)
  const setShowTaskReviewModal = useSyncStore((state) => state.setShowTaskReviewModal)
  const setPendingImportReview = useSyncStore((state) => state.setPendingImportReview)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const tasks = useMemo(() => review?.tasks ?? [], [review?.tasks])

  useEffect(() => {
    if (show) {
      setSelectedIds(tasks.map((task) => task.id))
    }
  }, [show, tasks])

  const toggleTask = (taskId: string) => {
    setSelectedIds((current) =>
      current.includes(taskId) ? current.filter((id) => id !== taskId) : [...current, taskId],
    )
  }

  const selectedTasks = useMemo(() => tasks.filter((task) => selectedIds.includes(task.id)), [selectedIds, tasks])
  const hasSelection = selectedTasks.length > 0

  if (!show || !review) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[66] flex items-center justify-center bg-black/55 p-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          className="w-full max-w-2xl rounded-2xl border border-app-border bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-ink dark:text-zinc-100">Import Google Tasks</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-ink2 dark:text-zinc-400">
                Select the tasks you want to turn into habits. Unchecked tasks remain in Google Tasks only.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowTaskReviewModal(false)
                setPendingImportReview(null)
              }}
              className="rounded-lg px-2 py-1 text-[11px] font-semibold text-ink2 hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds(tasks.map((task) => task.id))}
              className="rounded-lg border border-app-border px-2.5 py-1.5 text-[10px] font-semibold text-ink2 dark:border-zinc-700 dark:text-zinc-300"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="rounded-lg border border-app-border px-2.5 py-1.5 text-[10px] font-semibold text-ink2 dark:border-zinc-700 dark:text-zinc-300"
            >
              Deselect All
            </button>
          </div>

          <div className="mt-4 max-h-[52vh] space-y-2 overflow-y-auto pr-1">
            {tasks.map((task) => {
              const checked = selectedIds.includes(task.id)
              return (
                <label
                  key={task.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 ${
                    checked
                      ? 'border-pink-brand/30 bg-pink-light/30 dark:border-pink-brand/30 dark:bg-pink-brand/10'
                      : 'border-app-border bg-white dark:border-zinc-800 dark:bg-zinc-950'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTask(task.id)}
                    className="mt-1 h-4 w-4 rounded border-app-border text-pink-brand focus:ring-pink-brand"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold text-ink dark:text-zinc-200">{task.title ?? 'Untitled Task'}</p>
                      <span className={`text-[9px] font-bold uppercase tracking-wide ${task.status === 'completed' ? 'text-green-dark dark:text-green-brand' : 'text-ink3 dark:text-zinc-500'}`}>
                        {task.status === 'completed' ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[9px] text-ink3 dark:text-zinc-500">
                      {task.due ? <span>Due: {new Date(task.due).toLocaleDateString()}</span> : <span>No due date</span>}
                    </div>
                  </div>
                </label>
              )
            })}
          </div>

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              disabled={!hasSelection}
              onClick={() => {
                void importSelectedGoogleTasks(selectedTasks)
              }}
              className="flex-1 rounded-lg bg-pink-dark px-3 py-2 text-[11px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-pink-brand"
            >
              Import Selected
            </button>
            <button
              type="button"
              onClick={() => {
                setShowTaskReviewModal(false)
                setPendingImportReview(null)
              }}
              className="flex-1 rounded-lg border border-app-border px-3 py-2 text-[11px] font-bold text-ink2 dark:border-zinc-700 dark:text-zinc-300"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
