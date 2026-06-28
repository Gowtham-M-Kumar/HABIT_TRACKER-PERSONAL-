import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { isSupabaseConfigured } from '../../lib/supabase'
import { Sparkles, CloudUpload, MonitorSmartphone, ShieldCheck } from 'lucide-react'

const FEATURES = [
  { icon: CloudUpload, label: 'Cloud Backup', desc: 'Your data, always safe' },
  { icon: MonitorSmartphone, label: 'Any Device', desc: 'Pick up where you left off' },
  { icon: ShieldCheck, label: 'Private & Secure', desc: 'Your habits, only yours' },
]

const FLOAT_CARDS = [
  { emoji: '🧘', label: 'Meditation', pct: 82, top: '14%', left: '4%', delay: 0 },
  { emoji: '📚', label: 'Reading', pct: 72, top: '52%', left: '2%', delay: 0.4 },
  { emoji: '💧', label: 'Hydration', pct: 95, top: '78%', left: '6%', delay: 0.8 },
  { emoji: '🏋️', label: 'Workout', pct: 65, top: '10%', right: '3%', delay: 0.2 },
  { emoji: '✍️', label: 'Journaling', pct: 58, top: '48%', right: '1%', delay: 0.6 },
  { emoji: '😴', label: 'Sleep', pct: 88, top: '76%', right: '5%', delay: 1.0 },
]

interface FloatCardProps {
  emoji: string
  label: string
  pct: number
  top: string
  left?: string
  right?: string
  delay: number
}

const FloatCard: React.FC<FloatCardProps> = ({ emoji, label, pct, top, left, right, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: 'easeOut' }}
    style={{ top, left, right, position: 'absolute' }}
    className="hidden lg:flex flex-col gap-1 bg-white/8 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2.5 w-36 shadow-xl"
  >
    <div className="flex items-center gap-2">
      <span className="text-lg">{emoji}</span>
      <span className="text-xs font-semibold text-white/80 truncate">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: delay + 0.4, duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[10px] font-bold text-white/60">{pct}%</span>
    </div>
  </motion.div>
)

interface LandingPageProps {
  onOpenAuth: (view: 'login' | 'signup') => void
  onContinueAsGuest: () => void
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onContinueAsGuest }) => {
  const { isLoading } = useAuthStore()
  const containerRef = useRef<HTMLDivElement>(null)

  // Subtle parallax on mouse move
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handle = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      const dx = (clientX - cx) / cx
      const dy = (clientY - cy) / cy
      el.style.setProperty('--parallax-x', `${dx * 20}px`)
      el.style.setProperty('--parallax-y', `${dy * 12}px`)
    }
    window.addEventListener('mousemove', handle, { passive: true })
    return () => window.removeEventListener('mousemove', handle)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden select-none"
      style={{
        background: 'radial-gradient(ellipse 120% 80% at 50% -10%, #2a1055 0%, #0d0d1f 55%, #050510 100%)',
      }}
    >
      {/* Ambient glow blobs */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          transform: 'translate(var(--parallax-x, 0), var(--parallax-y, 0))',
          transition: 'transform 0.15s ease-out',
        }}
      >
        <div className="absolute top-[-10%] left-[30%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #c084fc 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-5%] right-[20%] w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #f472b6 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] left-[-5%] w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)' }} />
      </div>

      {/* Floating habit cards */}
      {FLOAT_CARDS.map((card) => (
        <FloatCard key={card.label} {...card} />
      ))}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg w-full">

        {/* App Icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="mb-6"
        >
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-600 shadow-2xl shadow-purple-900/60" />
            <div className="absolute inset-0.5 rounded-[13px] bg-gradient-to-br from-pink-300 to-violet-500 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white drop-shadow-lg" strokeWidth={1.5} />
            </div>
          </div>
        </motion.div>

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-3"
            style={{ fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '-0.02em' }}>
            Habit<span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">Tracker</span>
          </h1>
          <p className="text-base text-white/50 leading-relaxed mb-8">
            Build daily habits. Track your streaks.<br />
            <span className="text-white/30">Visualise your growth.</span>
          </p>
        </motion.div>

        {/* Feature Badges */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex gap-3 flex-wrap justify-center mb-8"
        >
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-white/6 border border-white/10 rounded-xl px-3 py-2 backdrop-blur-sm"
            >
              <Icon className="w-3.5 h-3.5 text-purple-300 flex-shrink-0" />
              <div className="text-left">
                <div className="text-[10px] font-bold text-white/80 leading-none">{label}</div>
                <div className="text-[9px] text-white/40 mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="w-full space-y-3"
        >
          {/* Guest CTA — primary */}
          <button
            onClick={onContinueAsGuest}
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-semibold text-sm text-white/90 bg-white/10 border border-white/15 hover:bg-white/15 hover:border-white/25 active:scale-[0.98] transition-all duration-150 backdrop-blur-sm cursor-pointer"
          >
            Continue as Guest
          </button>

          {/* Create Account CTA — secondary highlight */}
          {isSupabaseConfigured ? (
            <button
              onClick={() => onOpenAuth('signup')}
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-purple-900/40 cursor-pointer"
            >
              Create Free Account
            </button>
          ) : (
            <div className="text-[11px] text-white/25 text-center">
              Cloud sync unavailable — Supabase not configured
            </div>
          )}
        </motion.div>

        {/* Sign in link */}
        {isSupabaseConfigured && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-5 text-xs text-white/35"
          >
            Already have an account?{' '}
            <button
              onClick={() => onOpenAuth('login')}
              className="text-white/60 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
            >
              Sign in
            </button>
          </motion.p>
        )}

        {/* Footnote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.5 }}
          className="mt-8 text-[10px] text-white/20 max-w-xs"
        >
          Guest mode is fully featured. Create an account anytime to enable cloud sync across devices.
        </motion.p>
      </div>

      {/* Bottom grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  )
}
