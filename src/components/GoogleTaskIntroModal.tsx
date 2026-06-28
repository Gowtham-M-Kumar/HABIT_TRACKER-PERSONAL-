import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSyncStore } from '../store/syncStore'

export const GoogleTaskIntroModal: React.FC = () => {
  const review = useSyncStore((state) => state.pendingImportReview)
  const showTaskReviewModal = useSyncStore((state) => state.showTaskReviewModal)
  const setPendingImportReview = useSyncStore((state) => state.setPendingImportReview)
  const setShowTaskReviewModal = useSyncStore((state) => state.setShowTaskReviewModal)
  const setHasShownInitialReview = useSyncStore((state) => state.setHasShownInitialReview)

  const open = Boolean(review && review.source === 'initial' && !showTaskReviewModal)

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[65] flex items-center justify-center bg-black/55 p-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          className="w-full max-w-md rounded-2xl border border-app-border bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
        >
          <h3 className="text-sm font-bold text-ink dark:text-zinc-100">Review Google Tasks before importing?</h3>
          <p className="mt-2 text-[11px] leading-relaxed text-ink2 dark:text-zinc-400">
            We found {review?.tasks.length ?? 0} Google Tasks. They will stay in Google Tasks until you choose to import them as habits.
          </p>

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowTaskReviewModal(true)
              }}
              className="flex-1 rounded-lg bg-pink-dark px-3 py-2 text-[11px] font-bold text-white dark:bg-pink-brand"
            >
              Review Tasks
            </button>
            <button
              type="button"
              onClick={() => {
                setPendingImportReview(null)
                setHasShownInitialReview(true)
              }}
              className="flex-1 rounded-lg border border-app-border px-3 py-2 text-[11px] font-bold text-ink2 dark:border-zinc-700 dark:text-zinc-300"
            >
              Skip for Now
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
