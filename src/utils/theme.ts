/** Apply dark/light class on <html> for Tailwind class-based dark mode */
export function applyDarkMode(enabled: boolean): void {
  const root = document.documentElement
  root.classList.toggle('dark', enabled)
  root.classList.toggle('light', !enabled)
  document.body.classList.toggle('dark', enabled)

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', enabled ? '#12121e' : '#FDFCF8')
  }
}

function clamp(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)))
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) return null
  const n = parseInt(normalized, 16)
  if (Number.isNaN(n)) return null
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((c) => clamp(c).toString(16).padStart(2, '0')).join('')}`
}

function mix(hex: string, amount: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  const t = amount >= 0 ? 255 : 0
  const p = Math.abs(amount)
  return rgbToHex(
    rgb.r + (t - rgb.r) * p,
    rgb.g + (t - rgb.g) * p,
    rgb.b + (t - rgb.b) * p,
  )
}

/** Map dashboard accent to pink theme tokens used across the UI */
export function applyAccentColor(hex: string): void {
  const root = document.documentElement
  root.style.setProperty('--color-pink-brand', hex)
  root.style.setProperty('--color-pink-dark', mix(hex, -0.35))
  root.style.setProperty('--color-pink-light', mix(hex, 0.88))
  root.style.setProperty('--accent-color', hex)
}

export function applyTheme(darkMode: boolean, accentColor: string): void {
  applyDarkMode(darkMode)
  applyAccentColor(accentColor)
}
