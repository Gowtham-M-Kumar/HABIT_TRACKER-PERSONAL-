import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHabitStore } from '../store/habitStore'
import type { Habit } from '../store/habitStore'
import { applyTheme } from '../utils/theme'
import { X, Trash2, Plus, ArrowUp, ArrowDown, Moon, Sun, Save, Check, RotateCcw, HardDriveDownload, Cloud, CloudOff, LogIn, LogOut, Shield } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { ChangePasswordModal } from './auth/AuthModal'

interface SettingsDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const PALETTE_COLORS = [
  '#F4A0B8', // Blush Pink
  '#A8D8EA', // Sky Blue
  '#8ED4B4', // Mint Green
  '#F5D87A', // Honey Yellow
  '#C0A8E8', // Soft Purple
  '#F4A88A', // Coral
  '#8ED4CE'  // Teal
]

const EMOJIS = ['🧘', '📚', '🏋️', '💧', '✍️', '🍏', '😴', '🏃', '💻', '🧠', '🥛', '🥗', '🚶', '🧹', '🎸']

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose }) => {
  const habits = useHabitStore((state) => state.habits)
  const profile = useHabitStore((state) => state.profile)
  const settings = useHabitStore((state) => state.settings)
  
  const addHabit = useHabitStore((state) => state.addHabit)
  const updateHabit = useHabitStore((state) => state.updateHabit)
  const deleteHabit = useHabitStore((state) => state.deleteHabit)
  const reorderHabits = useHabitStore((state) => state.reorderHabits)
  const updateProfile = useHabitStore((state) => state.updateProfile)
  const updateSettings = useHabitStore((state) => state.updateSettings)
  const resetData = useHabitStore((state) => state.resetData)
  const clearDatabase = useHabitStore((state) => state.clearDatabase)
  const saveProgressBackup = useHabitStore((state) => state.saveProgressBackup)
  const restoreProgressBackup = useHabitStore((state) => state.restoreProgressBackup)
  const getLatestBackupLabel = useHabitStore((state) => state.getLatestBackupLabel)

  // Auth
  const { mode, user, signOut, openAuthModal } = useAuthStore()
  const [isChangePwOpen, setIsChangePwOpen] = useState(false)

  // Profile draft states
  const [draftName, setDraftName] = useState(profile.name)
  const [draftAffirmation, setDraftAffirmation] = useState(profile.affirmationText)
  const [isPreferencesSaved, setIsPreferencesSaved] = useState(false)
  const [backupLabel, setBackupLabel] = useState<string | null>(getLatestBackupLabel())
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setBackupLabel(getLatestBackupLabel())
      setRestoreMessage(null)
    }
  }, [isOpen, getLatestBackupLabel])

  useEffect(() => {
    setDraftName(profile.name)
    setDraftAffirmation(profile.affirmationText)
  }, [profile])

  // Habit Editor Draft States
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editGoal, setEditGoal] = useState(20)
  const [editColor, setEditColor] = useState(PALETTE_COLORS[0])
  const [editEmoji, setEditEmoji] = useState(EMOJIS[0])
  const [editDueDate, setEditDueDate] = useState('')

  const handleStartEditHabit = (habit: Habit) => {
    setEditingHabitId(habit.id)
    setEditName(habit.name)
    setEditGoal(habit.goal)
    setEditColor(habit.color)
    setEditEmoji(habit.iconEmoji)
    setEditDueDate(habit.dueDate ?? '')
  }

  const handleSaveHabit = (id: string) => {
    updateHabit(id, {
      name: editName,
      goal: editGoal,
      color: editColor,
      iconEmoji: editEmoji,
      dueDate: editDueDate || null,
    })
    setEditingHabitId(null)
  }

  // New Habit Form States
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitGoal, setNewHabitGoal] = useState(20)
  const [newHabitColor, setNewHabitColor] = useState(PALETTE_COLORS[0])
  const [newHabitEmoji, setNewHabitEmoji] = useState(EMOJIS[0])
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAddHabitSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHabitName.trim()) return
    addHabit(newHabitName, newHabitEmoji, newHabitColor, newHabitGoal)
    setNewHabitName('')
    setShowAddForm(false)
  }

  const handleToggleDarkMode = () => {
    const next = !settings.darkMode
    updateSettings({ darkMode: next })
    applyTheme(next, settings.accentColor)
  }

  const handleAccentSelect = (color: string) => {
    updateSettings({ accentColor: color })
    applyTheme(settings.darkMode, color)
  }

  const handleSavePreferences = () => {
    updateProfile({ name: draftName, affirmationText: draftAffirmation })
    setIsPreferencesSaved(true)
    setTimeout(() => setIsPreferencesSaved(false), 2000)
  }

  const handleClose = () => {
    setDraftName(profile.name)
    setDraftAffirmation(profile.affirmationText)
    onClose()
  }

  const handleRestoreBackup = () => {
    const ok = restoreProgressBackup()
    if (ok) {
      setRestoreMessage('Progress restored successfully.')
      setBackupLabel(getLatestBackupLabel())
      applyTheme(
        useHabitStore.getState().settings.darkMode,
        useHabitStore.getState().settings.accentColor,
      )
    } else {
      setRestoreMessage('No backup found to restore.')
    }
    setTimeout(() => setRestoreMessage(null), 3000)
  }

  const handleManualBackup = () => {
    saveProgressBackup('manual')
    setBackupLabel(getLatestBackupLabel())
    setRestoreMessage('Progress snapshot saved.')
    setTimeout(() => setRestoreMessage(null), 2500)
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 200 }}
              className="fixed top-0 right-0 w-full max-w-md h-full bg-cream dark:bg-zinc-900 border-l border-app-border dark:border-zinc-800 z-50 shadow-2xl flex flex-col"
            >
            {/* Header */}
            <div className="p-4 border-b border-app-border dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900/60">
              <div>
                <h2 className="text-sm font-bold tracking-wider uppercase text-ink dark:text-zinc-200">
                  ⚙️ Settings Drawer
                </h2>
                <p className="text-[10px] text-ink3 dark:text-zinc-500 font-medium">
                  Configure preferences & habits
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg text-ink3 hover:text-ink hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                aria-label="Close settings"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar select-none">

              {/* Section 0: Account Status */}
              <div className="bg-white dark:bg-zinc-950 border border-app-border dark:border-zinc-800 rounded-xl p-4 card-shadow">
                <span className="text-[9px] font-bold uppercase tracking-widest text-ink3 dark:text-zinc-500 block mb-3">
                  ☁️ Account & Sync
                </span>
                {mode === 'cloud' ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-lg px-3 py-2">
                      <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Cloud Sync Active</p>
                        <p className="text-[9px] text-emerald-600/70 dark:text-emerald-500/60 truncate">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsChangePwOpen(true)}
                        className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold text-blue-dark dark:text-blue-brand border border-blue-brand/20 hover:bg-blue-light/30 dark:hover:bg-blue-brand/10 py-2 rounded-lg cursor-pointer transition-colors"
                      >
                        <Shield className="w-3 h-3" /> Change Password
                      </button>
                      <button
                        onClick={() => signOut()}
                        className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold text-ink3 dark:text-zinc-400 border border-app-border dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 py-2 rounded-lg cursor-pointer transition-colors"
                      >
                        <LogOut className="w-3 h-3" /> Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-800/20 rounded-lg px-3 py-2">
                      <CloudOff className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400">Guest Mode</p>
                        <p className="text-[9px] text-amber-600/70 dark:text-amber-500/60">Data stored locally only</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { openAuthModal('login'); onClose() }}
                      className="w-full flex items-center justify-center gap-1.5 text-[10px] font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 py-2.5 rounded-lg cursor-pointer transition-all"
                    >
                      <LogIn className="w-3 h-3" /> Sign In or Create Account
                    </button>
                  </div>
                )}
              </div>
              
              {/* Section 1: Profile Details */}
              <div className="bg-white dark:bg-zinc-950 border border-app-border dark:border-zinc-800 rounded-xl p-4 card-shadow">
                <span className="text-[9px] font-bold uppercase tracking-widest text-ink3 dark:text-zinc-500 block mb-3">
                  👤 Profile Customization
                </span>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-ink2 dark:text-zinc-400 block mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      className="w-full text-xs font-semibold text-ink dark:text-zinc-200 bg-slate-50 dark:bg-zinc-900 border border-app-border dark:border-zinc-800 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-brand"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-ink2 dark:text-zinc-400 block mb-1">
                      Daily Affirmation
                    </label>
                    <textarea
                      rows={2}
                      value={draftAffirmation}
                      onChange={(e) => setDraftAffirmation(e.target.value)}
                      className="w-full text-xs font-semibold text-ink dark:text-zinc-200 bg-slate-50 dark:bg-zinc-900 border border-app-border dark:border-zinc-800 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-brand resize-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSavePreferences}
                    className="w-full text-xs font-bold text-white bg-pink-dark dark:bg-pink-brand hover:opacity-95 py-2 px-4 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {isPreferencesSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" /> Profile Saved!
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" /> Save Profile
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Section 2: Aesthetics / Theme */}
              <div className="bg-white dark:bg-zinc-950 border border-app-border dark:border-zinc-800 rounded-xl p-4 card-shadow">
                <span className="text-[9px] font-bold uppercase tracking-widest text-ink3 dark:text-zinc-500 block mb-3">
                  🎨 Palette & Interface Theme
                </span>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-ink2 dark:text-zinc-400 block">
                        {settings.darkMode ? 'Dark Interface' : 'Light Interface'}
                      </span>
                      <span className="text-[9px] text-ink3 dark:text-zinc-500">
                        Applies instantly across the app
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleDarkMode}
                      className={`p-2 rounded-lg border cursor-pointer transition-all ${
                        settings.darkMode
                          ? 'border-yellow-brand/40 bg-yellow-light/50 dark:bg-amber-900/20 text-yellow-dark'
                          : 'border-app-border dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-ink2'
                      }`}
                      aria-label="Toggle dark mode"
                    >
                      {settings.darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Theme Accent Color */}
                  <div>
                    <label className="text-[10px] font-bold text-ink2 dark:text-zinc-400 block mb-1.5">
                      Dashboard Highlight Accent
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PALETTE_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleAccentSelect(color)}
                          style={{ backgroundColor: color }}
                          className={`w-7 h-7 rounded-full cursor-pointer transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink dark:focus:ring-offset-zinc-900 ${
                            settings.accentColor === color ? 'ring-2 ring-offset-2 ring-ink dark:ring-offset-zinc-900 scale-110' : 'hover:scale-105'
                          }`}
                          aria-label={`Select accent color ${color}`}
                          aria-pressed={settings.accentColor === color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Habit Manager */}
              <div className="bg-white dark:bg-zinc-950 border border-app-border dark:border-zinc-800 rounded-xl p-4 card-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-ink3 dark:text-zinc-500">
                    🛠️ Active Habit Manager
                  </span>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="text-[9px] font-bold uppercase tracking-wider text-pink-dark dark:text-pink-brand flex items-center gap-0.5 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> New Habit
                  </button>
                </div>

                {/* Add Habit Form */}
                <AnimatePresence>
                  {showAddForm && (
                    <motion.form
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      onSubmit={handleAddHabitSubmit}
                      className="border-b border-app-border dark:border-zinc-800 pb-4 mb-4 overflow-hidden space-y-3 text-left"
                    >
                      <div>
                        <label className="text-[9px] font-bold text-ink3 dark:text-zinc-400 block mb-1">
                          Habit Label
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 10 mins Stretch"
                          value={newHabitName}
                          onChange={(e) => setNewHabitName(e.target.value)}
                          className="w-full text-xs font-semibold text-ink dark:text-zinc-200 bg-slate-50 dark:bg-zinc-900 border border-app-border dark:border-zinc-800 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-brand"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-ink3 dark:text-zinc-400 block mb-1">
                            Monthly Target Goal
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={31}
                            value={newHabitGoal}
                            onChange={(e) => setNewHabitGoal(parseInt(e.target.value) || 20)}
                            className="w-full text-xs font-semibold text-ink dark:text-zinc-200 bg-slate-50 dark:bg-zinc-900 border border-app-border dark:border-zinc-800 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-brand font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-ink3 dark:text-zinc-400 block mb-1">
                            Emoji Label
                          </label>
                          <select
                            value={newHabitEmoji}
                            onChange={(e) => setNewHabitEmoji(e.target.value)}
                            className="w-full text-xs font-semibold text-ink dark:text-zinc-200 bg-slate-50 dark:bg-zinc-900 border border-app-border dark:border-zinc-800 px-2 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-brand cursor-pointer"
                          >
                            {EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-ink3 dark:text-zinc-400 block mb-1">
                          Habit Banner Color
                        </label>
                        <div className="flex gap-1.5">
                          {PALETTE_COLORS.map(color => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setNewHabitColor(color)}
                              style={{ backgroundColor: color }}
                              className={`w-5 h-5 rounded-full cursor-pointer focus:outline-none ${newHabitColor === color ? 'ring-2 ring-offset-1 ring-ink dark:ring-offset-zinc-900' : ''}`}
                            />
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full text-xs font-bold text-white bg-pink-dark dark:bg-pink-brand hover:opacity-95 py-2 rounded-lg cursor-pointer transition-opacity"
                      >
                        Create New Habit
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Habit Manager List */}
                <div className="flex flex-col gap-2">
                  {habits.map((habit, index) => {
                    const isEditing = editingHabitId === habit.id

                    return (
                      <div
                        key={habit.id}
                        className="border border-app-border dark:border-zinc-800 rounded-lg p-2 flex flex-col bg-slate-50/50 dark:bg-zinc-900/50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          {/* Info */}
                          <div className="flex items-center gap-2 truncate">
                            <span 
                              style={{ backgroundColor: habit.color }}
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            />
                            <span className="text-xs select-none">{habit.iconEmoji}</span>
                            <span className="text-[11.5px] font-semibold text-ink dark:text-zinc-200 truncate">
                              {habit.name}
                            </span>
                            <span className="text-[9px] font-mono text-ink3 dark:text-zinc-500">
                              (G: {habit.goal})
                            </span>
                          </div>

                          {/* Reorder & Action controls */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {/* Reorder Buttons */}
                            <button
                              disabled={index === 0}
                              onClick={() => reorderHabits(index, index - 1)}
                              className="p-1 rounded text-ink3 dark:text-zinc-500 hover:text-ink hover:bg-slate-200 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              disabled={index === habits.length - 1}
                              onClick={() => reorderHabits(index, index + 1)}
                              className="p-1 rounded text-ink3 dark:text-zinc-500 hover:text-ink hover:bg-slate-200 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>

                            {/* Edit Toggle */}
                            <button
                              onClick={() => {
                                if (isEditing) {
                                  setEditingHabitId(null)
                                } else {
                                  handleStartEditHabit(habit)
                                }
                              }}
                              className="text-[9px] font-bold text-blue-dark dark:text-blue-brand px-1 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 cursor-pointer"
                            >
                              {isEditing ? 'Close' : 'Edit'}
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete "${habit.name}"? All calendar log history will be deleted.`)) {
                                  deleteHabit(habit.id)
                                }
                              }}
                              className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                              title="Delete Habit"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Expandable Edit Fields */}
                        <AnimatePresence>
                          {isEditing && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden border-t border-app-border dark:border-zinc-800 mt-2 pt-2 space-y-2 text-left"
                            >
                              <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-2">
                                  <label className="text-[8px] font-bold text-ink3 dark:text-zinc-500 block mb-0.5">Rename</label>
                                  <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full text-[11px] font-semibold text-ink dark:text-zinc-200 bg-white dark:bg-zinc-950 border border-app-border dark:border-zinc-800 px-2 py-1 rounded-md focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-[8px] font-bold text-ink3 dark:text-zinc-500 block mb-0.5">Goal</label>
                                  <input
                                    type="number"
                                    min={1}
                                    max={31}
                                    value={editGoal}
                                    onChange={(e) => setEditGoal(parseInt(e.target.value) || 20)}
                                    className="w-full text-[11px] font-semibold text-ink dark:text-zinc-200 bg-white dark:bg-zinc-950 border border-app-border dark:border-zinc-800 px-2 py-1 rounded-md focus:outline-none font-mono"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2 items-center justify-between">
                                <div className="flex gap-1">
                                  {PALETTE_COLORS.map(color => (
                                    <button
                                      key={color}
                                      onClick={() => setEditColor(color)}
                                      style={{ backgroundColor: color }}
                                      className={`w-4 h-4 rounded-full cursor-pointer focus:outline-none ${editColor === color ? 'ring-2 ring-offset-1 ring-ink dark:ring-offset-zinc-900' : ''}`}
                                    />
                                  ))}
                                </div>
                                <div>
                                  <select
                                    value={editEmoji}
                                    onChange={(e) => setEditEmoji(e.target.value)}
                                    className="text-[10px] bg-white dark:bg-zinc-950 border border-app-border dark:border-zinc-800 px-1 py-0.5 rounded cursor-pointer"
                                  >
                                    {EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className="text-[8px] font-bold text-ink3 dark:text-zinc-500 block mb-0.5">Due Date</label>
                                <input
                                  type="date"
                                  value={editDueDate}
                                  onChange={(e) => setEditDueDate(e.target.value)}
                                  className="w-full text-[11px] font-semibold text-ink dark:text-zinc-200 bg-white dark:bg-zinc-950 border border-app-border dark:border-zinc-800 px-2 py-1 rounded-md focus:outline-none"
                                />
                              </div>
                              {/* Save Habit button */}
                              <div className="pt-2 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleSaveHabit(habit.id)}
                                  className="text-[9px] font-bold text-white bg-blue-dark dark:bg-blue-brand hover:opacity-90 py-1 px-3 rounded flex items-center gap-1 cursor-pointer transition-opacity"
                                >
                                  <Save className="w-2.5 h-2.5" /> Save Habit
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Section 4: Data management */}
              <div className="bg-white dark:bg-zinc-950 border border-app-border dark:border-zinc-800 rounded-xl p-4 card-shadow">
                <span className="text-[9px] font-bold uppercase tracking-widest text-ink3 dark:text-zinc-500 block mb-2">
                  ⚠️ Database Operations
                </span>
                <p className="text-[9px] text-ink2 dark:text-zinc-500 mb-3 leading-relaxed">
                  Progress is auto-saved every night at midnight. A snapshot is also created before any reset.
                </p>

                {backupLabel && (
                  <div className="text-[9px] text-ink2 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900 border border-app-border/60 dark:border-zinc-800 rounded-lg px-2.5 py-2 mb-3">
                    <span className="font-bold uppercase tracking-wider text-[8px] text-ink3 block mb-0.5">Latest backup</span>
                    {backupLabel}
                  </div>
                )}

                {restoreMessage && (
                  <p className="text-[10px] font-medium text-green-dark dark:text-green-brand mb-3">{restoreMessage}</p>
                )}

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleRestoreBackup}
                      className="flex-1 text-[10px] font-bold text-teal-dark dark:text-teal-brand border border-teal-brand/25 hover:bg-teal-light/40 dark:hover:bg-teal-brand/10 py-2 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Recover Backup
                    </button>
                    <button
                      type="button"
                      onClick={handleManualBackup}
                      className="flex-1 text-[10px] font-bold text-blue-dark dark:text-blue-brand border border-blue-brand/25 hover:bg-blue-light/40 dark:hover:bg-blue-brand/10 py-2 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1"
                    >
                      <HardDriveDownload className="w-3 h-3" /> Save Snapshot
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Reset to demo seed data? Your current progress will be backed up first.')) {
                          resetData()
                          applyTheme(
                            useHabitStore.getState().settings.darkMode,
                            useHabitStore.getState().settings.accentColor,
                          )
                          setBackupLabel(getLatestBackupLabel())
                        }
                      }}
                      className="flex-1 text-[10px] font-bold text-pink-dark dark:text-pink-brand border border-pink-brand/20 hover:bg-pink-light/30 dark:hover:bg-zinc-800/40 py-2 rounded-lg cursor-pointer transition-colors"
                    >
                      Reset Seed Data
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Clear all habits and history? A backup will be saved first.')) {
                          clearDatabase()
                          applyTheme(false, '#F4A0B8')
                          setBackupLabel(getLatestBackupLabel())
                        }
                      }}
                      className="flex-1 text-[10px] font-bold text-red-600 border border-red-500/25 hover:bg-red-50 dark:hover:bg-red-950/20 py-2 rounded-lg cursor-pointer transition-colors"
                    >
                      Clear Database
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Version Footer */}
            <div className="p-3 bg-white dark:bg-zinc-950 border-t border-app-border dark:border-zinc-800 text-center">
              <span className="text-[9px] font-mono text-ink3 dark:text-zinc-500 uppercase tracking-widest">
                HABIT APP VERSION {settings.appVersion}
              </span>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>

      <ChangePasswordModal isOpen={isChangePwOpen} onClose={() => setIsChangePwOpen(false)} />
    </>
  )
}
