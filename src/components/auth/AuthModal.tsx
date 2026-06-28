import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, X, Mail, Lock, User, ArrowLeft, Loader2, CheckCircle2, Sparkles } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import type { AuthView } from '../../store/authStore'
import { useHabitStore } from '../../store/habitStore'
import { migrateGuestDataToCloud } from '../../utils/guestMigration'

// ─── Reusable field components ────────────────────────────────────────────────

interface InputFieldProps {
  id: string
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
  required?: boolean
  icon?: React.ReactNode
  rightElement?: React.ReactNode
  error?: string
}

const InputField: React.FC<InputFieldProps> = ({
  id, label, type, value, onChange, placeholder, autoComplete, required, icon, rightElement, error,
}) => (
  <div>
    <label htmlFor={id} className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none">
          {icon}
        </span>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className={`w-full ${icon ? 'pl-9' : 'pl-3'} ${rightElement ? 'pr-10' : 'pr-3'} py-2.5 text-sm font-medium
          bg-zinc-50 dark:bg-zinc-800/80 border rounded-xl
          text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600
          focus:outline-none focus:ring-2 focus:ring-pink-brand/40 focus:border-pink-brand/50
          transition-all duration-150
          ${error ? 'border-red-400 dark:border-red-500 focus:ring-red-300/40' : 'border-zinc-200 dark:border-zinc-700'}`}
      />
      {rightElement && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightElement}
        </span>
      )}
    </div>
    {error && (
      <p className="mt-1 text-[11px] text-red-500 dark:text-red-400 font-medium">{error}</p>
    )}
  </div>
)

// ─── Password input with visibility toggle ────────────────────────────────────

interface PasswordFieldProps {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  placeholder?: string
  error?: string
}

const PasswordField: React.FC<PasswordFieldProps> = ({ id, label, value, onChange, autoComplete, placeholder, error }) => {
  const [show, setShow] = useState(false)
  return (
    <InputField
      id={id}
      label={label}
      type={show ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      placeholder={placeholder ?? '••••••••'}
      icon={<Lock className="w-4 h-4" />}
      error={error}
      rightElement={
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      }
    />
  )
}

// ─── Submit button ────────────────────────────────────────────────────────────

const SubmitButton: React.FC<{ isLoading: boolean; label: string }> = ({ isLoading, label }) => (
  <button
    type="submit"
    disabled={isLoading}
    className="w-full py-2.5 rounded-xl font-semibold text-sm text-white
      bg-gradient-to-r from-pink-500 to-purple-600
      hover:from-pink-400 hover:to-purple-500
      disabled:opacity-60 disabled:cursor-not-allowed
      active:scale-[0.98] transition-all duration-150
      flex items-center justify-center gap-2 shadow-lg shadow-pink-900/20 cursor-pointer"
  >
    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : label}
  </button>
)

// ─── Error banner ─────────────────────────────────────────────────────────────

const ErrorBanner: React.FC<{ message: string }> = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
    className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl px-3 py-2.5 text-xs font-medium text-red-600 dark:text-red-400"
  >
    {message}
  </motion.div>
)

// ─── View animations ──────────────────────────────────────────────────────────

const viewVariants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

// ─── Login Form ───────────────────────────────────────────────────────────────

const LoginForm: React.FC<{ onSwitch: (v: AuthView) => void }> = ({ onSwitch }) => {
  const { signIn, isLoading, error, setError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => { setError(null) }, [setError])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address'
    if (!password) errs.password = 'Password is required'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return
    try { await signIn(email, password, rememberMe) } catch { /* error in store */ }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <AnimatePresence>{error && <ErrorBanner message={error} />}</AnimatePresence>

      <InputField
        id="login-email" label="Email address" type="email" value={email}
        onChange={setEmail} placeholder="you@example.com"
        autoComplete="email" icon={<Mail className="w-4 h-4" />} error={fieldErrors.email}
      />

      <PasswordField
        id="login-password" label="Password" value={password}
        onChange={setPassword} autoComplete="current-password" error={fieldErrors.password}
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-3.5 h-3.5 rounded accent-pink-500 cursor-pointer"
          />
          <span className="text-xs text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors">
            Remember me
          </span>
        </label>
        <button
          type="button"
          onClick={() => onSwitch('forgot')}
          className="text-xs text-pink-600 dark:text-pink-400 hover:underline underline-offset-2 cursor-pointer transition-colors"
        >
          Forgot password?
        </button>
      </div>

      <SubmitButton isLoading={isLoading} label="Sign In" />

      <p className="text-center text-xs text-zinc-500 dark:text-zinc-500">
        Don&apos;t have an account?{' '}
        <button type="button" onClick={() => onSwitch('signup')}
          className="text-pink-600 dark:text-pink-400 font-semibold hover:underline underline-offset-2 cursor-pointer">
          Create one
        </button>
      </p>
    </form>
  )
}

// ─── Sign Up Form ─────────────────────────────────────────────────────────────

const SignUpForm: React.FC<{ onSwitch: (v: AuthView) => void; onSuccess: (signedIn: boolean) => void }> = ({ onSwitch, onSuccess }) => {
  const { signUp, isLoading, error, setError } = useAuthStore()
  const habitState = useHabitStore.getState()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [wantsMigration, setWantsMigration] = useState(habitState.hasCustomData)
  const hasCustomData = habitState.hasCustomData

  useEffect(() => { setError(null) }, [setError])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Your name is required'
    if (!email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address'
    if (!password) errs.password = 'Password is required'
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return
    try {
      const result = await signUp(email, password, name)
      if (wantsMigration && hasCustomData) {
        const { user } = useAuthStore.getState()
        if (user) {
          await migrateGuestDataToCloud(user.id, {
            habits: habitState.habits,
            logs: habitState.logs,
            profile: { ...habitState.profile, name },
            settings: habitState.settings,
          })
        }
      }
      onSuccess(result?.signedIn ?? false)
    } catch { /* error shown via store */ }
  }

  const hasLocalHabits = habitState.habits.length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <AnimatePresence>{error && <ErrorBanner message={error} />}</AnimatePresence>

      <InputField
        id="signup-name" label="Full name" type="text" value={name}
        onChange={setName} placeholder="Alex Johnson"
        autoComplete="name" icon={<User className="w-4 h-4" />} error={fieldErrors.name}
      />
      <InputField
        id="signup-email" label="Email address" type="email" value={email}
        onChange={setEmail} placeholder="you@example.com"
        autoComplete="email" icon={<Mail className="w-4 h-4" />} error={fieldErrors.email}
      />
      <PasswordField
        id="signup-password" label="Password" value={password}
        onChange={setPassword} autoComplete="new-password" error={fieldErrors.password}
      />
      <PasswordField
        id="signup-confirm" label="Confirm password" value={confirmPassword}
        onChange={setConfirmPassword} autoComplete="new-password" error={fieldErrors.confirmPassword}
      />

      {hasCustomData && hasLocalHabits && (
        <label className="flex items-start gap-2.5 cursor-pointer group bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/30 rounded-xl p-3">
          <input
            type="checkbox"
            checked={wantsMigration}
            onChange={(e) => setWantsMigration(e.target.checked)}
            className="mt-0.5 w-3.5 h-3.5 rounded accent-purple-500 cursor-pointer flex-shrink-0"
          />
          <div>
            <p className="text-xs font-semibold text-purple-800 dark:text-purple-300">
              Import my {habitState.habits.length} existing habit{habitState.habits.length !== 1 ? 's' : ''} to cloud
            </p>
            <p className="text-[10px] text-purple-600/70 dark:text-purple-400/60 mt-0.5 leading-relaxed">
              Your local progress and history will be synced to your new account.
            </p>
          </div>
        </label>
      )}

      <SubmitButton isLoading={isLoading} label="Create Account" />

      <p className="text-center text-[10px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
        By creating an account, you agree to use this app responsibly.
      </p>

      <p className="text-center text-xs text-zinc-500 dark:text-zinc-500">
        Already have an account?{' '}
        <button type="button" onClick={() => onSwitch('login')}
          className="text-pink-600 dark:text-pink-400 font-semibold hover:underline underline-offset-2 cursor-pointer">
          Sign in
        </button>
      </p>
    </form>
  )
}

// ─── Forgot Password Form ─────────────────────────────────────────────────────

const ForgotPasswordForm: React.FC<{ onSwitch: (v: AuthView) => void; onSuccess: () => void }> = ({ onSwitch, onSuccess }) => {
  const { resetPassword, isLoading, error, setError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [fieldError, setFieldError] = useState('')

  useEffect(() => { setError(null) }, [setError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setFieldError('Enter a valid email address')
      return
    }
    setFieldError('')
    try {
      await resetPassword(email)
      onSuccess()
    } catch { /* error in store */ }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
        Enter your email and we&apos;ll send a link to reset your password.
      </p>
      <AnimatePresence>{error && <ErrorBanner message={error} />}</AnimatePresence>
      <InputField
        id="forgot-email" label="Email address" type="email" value={email}
        onChange={setEmail} placeholder="you@example.com"
        autoComplete="email" icon={<Mail className="w-4 h-4" />} error={fieldError}
      />
      <SubmitButton isLoading={isLoading} label="Send Reset Link" />
      <button
        type="button"
        onClick={() => onSwitch('login')}
        className="w-full flex items-center justify-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
      </button>
    </form>
  )
}

// ─── Reset Password Form (deep-link handler) ──────────────────────────────────

const ResetPasswordForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { updatePassword, isLoading, error, setError } = useAuthStore()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => { setError(null) }, [setError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!password || password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (password !== confirmPassword) errs.confirm = 'Passwords do not match'
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return
    try {
      await updatePassword(password)
      onSuccess()
    } catch { /* error in store */ }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
        Choose a new password for your account.
      </p>
      <AnimatePresence>{error && <ErrorBanner message={error} />}</AnimatePresence>
      <PasswordField
        id="reset-password" label="New password" value={password}
        onChange={setPassword} autoComplete="new-password" error={fieldErrors.password}
      />
      <PasswordField
        id="reset-confirm" label="Confirm new password" value={confirmPassword}
        onChange={setConfirmPassword} autoComplete="new-password" error={fieldErrors.confirm}
      />
      <SubmitButton isLoading={isLoading} label="Set New Password" />
    </form>
  )
}

// ─── Check Email screen ───────────────────────────────────────────────────────

const CheckEmailScreen: React.FC<{ title: string; message: string; onClose: () => void }> = ({ title, message, onClose }) => (
  <div className="flex flex-col items-center text-center space-y-4 py-4">
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-900/30">
      <CheckCircle2 className="w-7 h-7 text-white" strokeWidth={2} />
    </div>
    <div>
      <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">{title}</h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">{message}</p>
    </div>
    <button
      onClick={onClose}
      className="mt-2 text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline underline-offset-2 cursor-pointer"
    >
      Got it, close
    </button>
  </div>
)

// ─── Titles per view ──────────────────────────────────────────────────────────

const VIEW_META: Record<AuthView, { title: string; subtitle: string }> = {
  login: { title: 'Welcome back', subtitle: 'Sign in to access your habits' },
  signup: { title: 'Create an account', subtitle: 'Start tracking your habits in the cloud' },
  forgot: { title: 'Forgot password', subtitle: 'Reset your account password' },
  'check-email': { title: 'Check your inbox', subtitle: '' },
  'reset-password': { title: 'Set new password', subtitle: 'Choose a strong password' },
}

// ─── Main AuthModal component ─────────────────────────────────────────────────

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { authView, setAuthView } = useAuthStore()
  const [checkEmailTitle, setCheckEmailTitle] = useState('Check your inbox')
  const [checkEmailMessage, setCheckEmailMessage] = useState('')

  const meta = VIEW_META[authView]

  const handleSignUpSuccess = (signedIn: boolean) => {
    if (signedIn) {
      onClose()
      return
    }

    setCheckEmailTitle('Verify your email')
    setCheckEmailMessage(
      'We sent a verification link to your inbox. Click it to activate your account, then sign in. If you want immediate login on signup, disable email confirmation in Supabase Auth settings.'
    )
    setAuthView('check-email')
  }

  const handleForgotSuccess = () => {
    setCheckEmailTitle('Reset link sent')
    setCheckEmailMessage(
      'We sent a password reset link to your email. Click the link and you\'ll be redirected back here to set a new password.'
    )
    setAuthView('check-email')
  }

  const handleResetSuccess = () => {
    setCheckEmailTitle('Password updated!')
    setCheckEmailMessage('Your password has been changed successfully. You are now signed in.')
    setAuthView('check-email')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal card */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="relative px-6 pt-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-5 right-5 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* App icon */}
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center shadow-md shadow-purple-900/20 mb-3">
                  <Sparkles className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>

                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                  {meta.title}
                </h2>
                {meta.subtitle && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{meta.subtitle}</p>
                )}
              </div>

              {/* Modal body with animated view switching */}
              <div className="px-6 py-5 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={authView}
                    variants={viewVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.18, ease: 'easeInOut' }}
                  >
                    {authView === 'login' && <LoginForm onSwitch={setAuthView} />}
                    {authView === 'signup' && <SignUpForm onSwitch={setAuthView} onSuccess={handleSignUpSuccess} />}
                    {authView === 'forgot' && <ForgotPasswordForm onSwitch={setAuthView} onSuccess={handleForgotSuccess} />}
                    {authView === 'check-email' && (
                      <CheckEmailScreen
                        title={checkEmailTitle}
                        message={checkEmailMessage}
                        onClose={onClose}
                      />
                    )}
                    {authView === 'reset-password' && <ResetPasswordForm onSuccess={handleResetSuccess} />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Change Password Modal (used inside SettingsDrawer) ───────────────────────

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { updatePassword, isLoading, error, setError } = useAuthStore()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [success, setSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isOpen) { setSuccess(false); setCurrent(''); setNext(''); setConfirm(''); setFieldErrors({}) }
    setError(null)
  }, [isOpen, setError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!next || next.length < 8) errs.next = 'Password must be at least 8 characters'
    if (next !== confirm) errs.confirm = 'Passwords do not match'
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return
    try {
      await updatePassword(next)
      setSuccess(true)
    } catch { /* error in store */ }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="cp-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            key="cp-modal"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative px-5 pt-5 pb-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Change Password</h3>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Update your account password</p>
                </div>
                <button onClick={onClose}
                  className="ml-auto p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-5 py-4 space-y-3">
                {success ? (
                  <div className="flex flex-col items-center text-center py-4 gap-3">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Password updated!</p>
                    <button onClick={onClose}
                      className="text-xs text-pink-600 dark:text-pink-400 hover:underline cursor-pointer">Close</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                    <AnimatePresence>{error && <ErrorBanner message={error} />}</AnimatePresence>
                    <PasswordField id="cp-current" label="Current password (not validated by client)" value={current} onChange={setCurrent} autoComplete="current-password" />
                    <PasswordField id="cp-new" label="New password" value={next} onChange={setNext} autoComplete="new-password" error={fieldErrors.next} />
                    <PasswordField id="cp-confirm" label="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password" error={fieldErrors.confirm} />
                    <SubmitButton isLoading={isLoading} label="Update Password" />
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
