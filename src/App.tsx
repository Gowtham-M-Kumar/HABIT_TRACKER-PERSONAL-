import { useState, useEffect } from 'react'
import { useHabitStore } from './store/habitStore'
import { TopBar } from './components/TopBar'
import { MonthHero } from './components/MonthHero'
import { ProgressRings } from './components/ProgressRings'
import { AreaChart } from './components/AreaChart'
import { WeeklySection } from './components/WeeklySection'
import { LeaderboardPanel } from './components/LeaderboardPanel'
import { HabitTrackingSection } from './components/HabitTrackingSection'
import { MobileHabitTracking } from './components/MobileHabitTracking'
import { HabitGrid } from './components/HabitGrid'
import { ProgressTable } from './components/ProgressTable'
import { SettingsDrawer } from './components/SettingsDrawer'
import { useMidnightBackup } from './hooks/useMidnightBackup'
import { applyTheme } from './utils/theme'
import { LayoutDashboard, BarChart3, Trophy, Heart } from 'lucide-react'

type MobileTab = 'dashboard' | 'charts' | 'progress'

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<MobileTab>('dashboard')
  const darkMode = useHabitStore((state) => state.settings.darkMode)
  const accentColor = useHabitStore((state) => state.settings.accentColor)

  useMidnightBackup()

  useEffect(() => {
    applyTheme(darkMode, accentColor)
  }, [darkMode, accentColor])

  return (
    <div className="min-h-screen bg-cream dark:bg-zinc-950 transition-colors duration-200 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">

      <TopBar onOpenSettings={() => setIsSettingsOpen(true)} />

      <main className="max-w-[1500px] mx-auto px-4 py-4 md:p-6 space-y-5 md:space-y-6">

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
              Offline-first habit tracking
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
        <div className="block md:hidden space-y-5">
          {activeTab === 'dashboard' && (
            <>
              <MonthHero />
              <MobileHabitTracking />
              <ProgressRings />
              <WeeklySection />
            </>
          )}
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

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 mobile-nav-bar">
        <div className="flex justify-around items-stretch h-[3.5rem] px-2 pt-1 pb-[calc(0.25rem+env(safe-area-inset-bottom,0px))]">
          {([
            ['dashboard', LayoutDashboard, 'Home'],
            ['charts', BarChart3, 'Charts'],
            ['progress', Trophy, 'Stats'],
          ] as const).map(([id, Icon, label]) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative flex flex-col items-center justify-center flex-1 gap-0.5 rounded-xl mx-0.5 transition-all duration-200 cursor-pointer touch-manipulation ${
                  isActive
                    ? 'text-pink-dark dark:text-pink-brand'
                    : 'text-ink3 dark:text-zinc-500 active:scale-95'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <span className="absolute inset-x-2 top-0.5 bottom-[calc(0.25rem+env(safe-area-inset-bottom,0px)/2)] bg-pink-light/70 dark:bg-pink-brand/10 rounded-xl -z-10" />
                )}
                <Icon className={`w-[18px] h-[18px] ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
                <span className={`text-[10px] tracking-wide ${isActive ? 'font-bold' : 'font-semibold'}`}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
}

export default App
