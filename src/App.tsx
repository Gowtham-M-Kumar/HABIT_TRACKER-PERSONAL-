import { useState, useEffect } from 'react'
import { useHabitStore } from './store/habitStore'
import { TopBar } from './components/TopBar'
import { MonthHero } from './components/MonthHero'
import { ProgressRings } from './components/ProgressRings'
import { AreaChart } from './components/AreaChart'
import { WeeklySection } from './components/WeeklySection'
import { LeaderboardPanel } from './components/LeaderboardPanel'
import { HabitTrackingSection } from './components/HabitTrackingSection'
import { HabitGrid } from './components/HabitGrid'
import { ProgressTable } from './components/ProgressTable'
import { SettingsDrawer } from './components/SettingsDrawer'
import { useMidnightBackup } from './hooks/useMidnightBackup'
import { useGoogleSync } from './hooks/useGoogleSync'
import { ConflictResolutionModal } from './components/ConflictResolutionModal'
import { GoogleTaskIntroModal } from './components/GoogleTaskIntroModal'
import { GoogleTaskReviewModal } from './components/GoogleTaskReviewModal'
import { SyncDecisionModal } from './components/SyncDecisionModal'
import { SyncNotificationCenter } from './components/SyncNotificationCenter'
import { applyTheme } from './utils/theme'
import { LayoutDashboard, Calendar, BarChart3, Trophy, Heart } from 'lucide-react'

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'grid' | 'charts' | 'progress'>('dashboard')
  const darkMode = useHabitStore((state) => state.settings.darkMode)
  const accentColor = useHabitStore((state) => state.settings.accentColor)

  useMidnightBackup()
  useGoogleSync()

  useEffect(() => {
    applyTheme(darkMode, accentColor)
  }, [darkMode, accentColor])

  return (
    <div className="min-h-screen bg-cream dark:bg-zinc-950 transition-colors duration-200 pb-16 md:pb-0">

      <TopBar onOpenSettings={() => setIsSettingsOpen(true)} />

      <main className="max-w-[1500px] mx-auto p-4 md:p-6 space-y-5 md:space-y-6">

        {/* DESKTOP xl+ */}
        <div className="hidden xl:flex flex-col gap-6">

          {/* Row 1: Month · Trend chart · Progress rings */}
          <div className="grid grid-cols-[minmax(200px,220px)_1fr_minmax(240px,280px)] gap-5 items-stretch">
            <MonthHero />
            <AreaChart />
            <ProgressRings />
          </div>

          {/* Row 2: Habit grid (hero section — moved up) */}
          <HabitTrackingSection />

          {/* Row 3: Weekly breakdown · Leaderboard */}
          <div className="grid grid-cols-[1fr_minmax(260px,300px)] gap-5 items-start">
            <WeeklySection />
            <LeaderboardPanel />
          </div>

          <footer className="bg-white/60 dark:bg-zinc-900/60 border border-app-border dark:border-zinc-800 rounded-xl py-3 px-4 card-shadow flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-center">
            <span className="text-[10px] font-bold text-pink-dark dark:text-pink-brand uppercase tracking-widest flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-current" /> Designed for consistency
            </span>
            <span className="hidden sm:inline text-ink3 dark:text-zinc-600">·</span>
            <p className="text-[9.5px] text-ink2 dark:text-zinc-500 font-medium">
              Offline-first · Optional Google Tasks sync
            </p>
          </footer>
        </div>

        {/* TABLET md–xl */}
        <div className="hidden md:flex xl:hidden flex-col gap-5">
          <div className="grid grid-cols-2 gap-5">
            <MonthHero />
            <ProgressRings />
          </div>
          <AreaChart />
          <HabitTrackingSection />
          <WeeklySection />
          <LeaderboardPanel />
        </div>

        {/* MOBILE */}
        <div className="block md:hidden space-y-4">
          {activeTab === 'dashboard' && (
            <>
              <MonthHero />
              <ProgressRings />
            </>
          )}
          {activeTab === 'grid' && <HabitTrackingSection />}
          {activeTab === 'charts' && (
            <>
              <AreaChart />
              <WeeklySection />
            </>
          )}
          {activeTab === 'progress' && (
            <>
              <LeaderboardPanel />
              <ProgressTable />
              <HabitGrid />
            </>
          )}
        </div>

      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-t border-app-border dark:border-zinc-800 flex justify-around items-center h-[3.25rem] z-40 px-1 safe-area-pb">
        {([
          ['dashboard', LayoutDashboard, 'Home'],
          ['grid', Calendar, 'Grid'],
          ['charts', BarChart3, 'Charts'],
          ['progress', Trophy, 'Stats'],
        ] as const).map(([id, Icon, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer rounded-lg mx-0.5 ${
              activeTab === id
                ? 'text-pink-dark dark:text-pink-brand bg-pink-light/50 dark:bg-pink-brand/10'
                : 'text-ink3 dark:text-zinc-500'
            }`}
          >
            <Icon className="w-4 h-4 mb-0.5" />
            {label}
          </button>
        ))}
      </nav>

      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ConflictResolutionModal />
      <GoogleTaskIntroModal />
      <GoogleTaskReviewModal />
      <SyncDecisionModal />
      <SyncNotificationCenter />
    </div>
  )
}

export default App
