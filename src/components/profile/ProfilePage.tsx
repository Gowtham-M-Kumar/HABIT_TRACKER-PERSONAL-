import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Calendar, Flame, CheckSquare, LayoutList, LogOut, Trash2, Shield, Edit3, Check, Loader2, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useHabitStore } from '../../store/habitStore'
import { ChangePasswordModal } from '../auth/AuthModal'
import { applyTheme } from '../../utils/theme'

function formatJoinDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  } catch {
    return 'Unknown'
  }
}

interface ProfilePageProps {
  isOpen: boolean
  onClose: () => void
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ isOpen, onClose }) => {
  const { user, mode, signOut, deleteAccount, isLoading } = useAuthStore()
  const profile = useHabitStore((s) => s.profile)
  const habits = useHabitStore((s) => s.habits)
  const logs = useHabitStore((s) => s.logs)
  const settings = useHabitStore((s) => s.settings)
  const updateProfile = useHabitStore((s) => s.updateProfile)

  const [isChangePwOpen, setIsChangePwOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [draftName, setDraftName] = useState(profile.name)
  const [nameSaved, setNameSaved] = useState(false)

  // Compute stats
  const totalHabits = habits.filter((h) => h.active).length
  let totalCompletions = 0
  for (const year of Object.values(logs)) {
    for (const month of Object.values(year)) {
      for (const days of Object.values(month)) {
        totalCompletions += Object.values(days).filter(Boolean).length
      }
    }
  }

  // Current streak: count consecutive completed days for any habit up to today
  const today = new Date()
  let currentStreak = 0
  if (habits.length > 0) {
    const d = new Date(today)
    for (let i = 0; i < 365; i++) {
      const y = d.getFullYear().toString()
      const m = (d.getMonth() + 1).toString()
      const day = d.getDate().toString()
      const dayLogs = logs[y]?.[m]
      if (!dayLogs) break
      const anyCompleted = habits.some((h) => dayLogs[h.id]?.[day])
      if (anyCompleted) {
        currentStreak++
        d.setDate(d.getDate() - 1)
      } else {
        break
      }
    }
  }

  const handleSaveName = () => {
    updateProfile({ name: draftName })
    setIsEditingName(false)
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2000)
  }

  const handleSignOut = async () => {
    await signOut()
    // Re-apply theme from local settings after sign-out
    applyTheme(settings.darkMode, settings.accentColor)
    onClose()
  }

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return
    try {
      await deleteAccount()
      onClose()
    } catch { /* error shown in store */ }
  }

  const displayName = profile.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Account'
  const initial = displayName.charAt(0).toUpperCase()
  const joinDate = user?.created_at ? formatJoinDate(user.created_at) : null

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 200 }}
              className="fixed top-0 right-0 w-full max-w-sm h-full bg-cream dark:bg-zinc-900 border-l border-app-border dark:border-zinc-800 z-50 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-app-border dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-pink-brand" />
                  <h2 className="text-sm font-bold text-ink dark:text-zinc-200 tracking-wide uppercase">My Account</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-ink3 hover:text-ink hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                  aria-label="Close profile"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">

                {/* Avatar & Identity */}
                <div className="bg-gradient-to-br from-pink-light/60 to-purple-light/40 dark:from-zinc-800/60 dark:to-zinc-900/40 border border-app-border dark:border-zinc-700 rounded-2xl p-5 flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-brand to-purple-brand flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0 overflow-hidden">
                    {profile.photoDataURL
                      ? <img src={profile.photoDataURL} alt="" className="w-full h-full object-cover" />
                      : initial
                    }
                  </div>

                  {/* Name + email */}
                  <div className="min-w-0 flex-1">
                    {isEditingName ? (
                      <div className="flex items-center gap-1.5 mb-1">
                        <input
                          type="text"
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                          className="flex-1 text-sm font-bold text-ink dark:text-zinc-100 bg-white dark:bg-zinc-800 border border-app-border dark:border-zinc-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-pink-brand min-w-0"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                        />
                        <button onClick={handleSaveName}
                          className="p-1 rounded-lg bg-pink-brand text-white hover:opacity-90 cursor-pointer transition-opacity">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 mb-1">
                        <h3 className="text-sm font-bold text-ink dark:text-zinc-100 truncate">{displayName}</h3>
                        <button
                          onClick={() => { setIsEditingName(true); setDraftName(profile.name || displayName) }}
                          className="p-0.5 rounded text-ink3 dark:text-zinc-500 hover:text-ink dark:hover:text-zinc-300 cursor-pointer transition-colors flex-shrink-0"
                          title="Edit name"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        {nameSaved && <span className="text-[9px] text-green-600 dark:text-green-400 font-bold">Saved!</span>}
                      </div>
                    )}

                    {mode === 'cloud' && user?.email && (
                      <p className="text-[11px] text-ink3 dark:text-zinc-500 truncate flex items-center gap-1">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        {user.email}
                      </p>
                    )}
                    {mode === 'guest' && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                        Guest Mode
                      </p>
                    )}
                    {joinDate && (
                      <p className="text-[10px] text-ink3 dark:text-zinc-600 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        Joined {joinDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Flame, label: 'Streak', value: `${currentStreak}d`, color: 'text-orange-500 dark:text-orange-400' },
                    { icon: CheckSquare, label: 'Completions', value: totalCompletions.toLocaleString(), color: 'text-green-600 dark:text-green-400' },
                    { icon: LayoutList, label: 'Active Habits', value: totalHabits.toString(), color: 'text-blue-dark dark:text-blue-brand' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="bg-white dark:bg-zinc-950 border border-app-border dark:border-zinc-800 rounded-xl p-3 text-center card-shadow">
                      <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
                      <p className="text-base font-bold text-ink dark:text-zinc-100">{value}</p>
                      <p className="text-[9px] text-ink3 dark:text-zinc-500 font-medium uppercase tracking-wider">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Account Actions — Cloud only */}
                {mode === 'cloud' && (
                  <div className="bg-white dark:bg-zinc-950 border border-app-border dark:border-zinc-800 rounded-xl p-4 card-shadow space-y-2">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-ink3 dark:text-zinc-500 mb-3">
                      🔐 Account Security
                    </p>

                    <button
                      onClick={() => setIsChangePwOpen(true)}
                      className="w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-light dark:bg-blue-brand/10 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-3.5 h-3.5 text-blue-dark dark:text-blue-brand" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-ink dark:text-zinc-200">Change Password</p>
                        <p className="text-[10px] text-ink3 dark:text-zinc-500">Update your account password</p>
                      </div>
                    </button>

                    <button
                      onClick={handleSignOut}
                      disabled={isLoading}
                      className="w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-ink3" /> : <LogOut className="w-3.5 h-3.5 text-ink3 dark:text-zinc-400" />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-ink dark:text-zinc-200">Sign Out</p>
                        <p className="text-[10px] text-ink3 dark:text-zinc-500">Revert to guest mode</p>
                      </div>
                    </button>
                  </div>
                )}

                {/* Danger Zone — Cloud only */}
                {mode === 'cloud' && (
                  <div className="bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4 space-y-3">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-red-500 dark:text-red-400">
                      ⚠️ Danger Zone
                    </p>
                    {!isDeleteConfirmOpen ? (
                      <button
                        onClick={() => setIsDeleteConfirmOpen(true)}
                        className="w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-xl hover:bg-red-100/60 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/40 flex items-center justify-center flex-shrink-0">
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-red-600 dark:text-red-400">Delete Account</p>
                          <p className="text-[10px] text-red-400/70 dark:text-red-500/60">Permanently remove all your data</p>
                        </div>
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-start gap-2 text-red-600 dark:text-red-400">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <p className="text-[11px] leading-relaxed font-medium">
                            This will delete all your habits, logs, and account data permanently. Type <strong>DELETE</strong> to confirm.
                          </p>
                        </div>
                        <input
                          type="text"
                          placeholder="Type DELETE to confirm"
                          value={deleteInput}
                          onChange={(e) => setDeleteInput(e.target.value)}
                          className="w-full text-xs font-mono bg-white dark:bg-zinc-900 border border-red-300 dark:border-red-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-400 text-red-700 dark:text-red-300 placeholder-red-300 dark:placeholder-red-800"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setIsDeleteConfirmOpen(false); setDeleteInput('') }}
                            className="flex-1 py-2 text-xs font-semibold text-ink3 dark:text-zinc-400 border border-app-border dark:border-zinc-700 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDeleteAccount}
                            disabled={deleteInput !== 'DELETE' || isLoading}
                            className="flex-1 py-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1"
                          >
                            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Guest prompt to create account */}
                {mode === 'guest' && (
                  <div className="bg-gradient-to-br from-purple-light/60 to-pink-light/40 dark:from-purple-brand/10 dark:to-pink-brand/5 border border-purple-brand/20 dark:border-purple-brand/15 rounded-xl p-4 space-y-3 text-center">
                    <p className="text-[11px] font-semibold text-purple-dark dark:text-purple-brand">
                      🚀 Unlock Cloud Sync
                    </p>
                    <p className="text-[10px] text-ink2 dark:text-zinc-400 leading-relaxed">
                      Create a free account to sync your habits across all your devices and keep your data safe forever.
                    </p>
                    <button
                      onClick={() => {
                        onClose()
                        useAuthStore.getState().openAuthModal('signup')
                      }}
                      className="w-full py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 active:scale-[0.98] transition-all duration-150 cursor-pointer"
                    >
                      Create Free Account
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-app-border dark:border-zinc-800 text-center">
                <p className="text-[9px] font-mono text-ink3 dark:text-zinc-600 uppercase tracking-widest">
                  {mode === 'cloud' ? '☁️ Cloud Sync Active' : '🔒 Guest Mode — Data local only'}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ChangePasswordModal isOpen={isChangePwOpen} onClose={() => setIsChangePwOpen(false)} />
    </>
  )
}
