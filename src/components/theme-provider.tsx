'use client'

import * as React from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
  systemTheme: 'light' | 'dark'
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

const VALID_THEMES = new Set<string>(['light', 'dark', 'system'])

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(resolved: string) {
  // Guard: only accept known-safe string values
  if (resolved !== 'light' && resolved !== 'dark') return
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(resolved)
}

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)
  const [systemTheme, setSystemTheme] = React.useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = React.useState(false)

  // On mount: read stored theme and detect system preference
  React.useEffect(() => {
    const raw = localStorage.getItem(storageKey)
    // Only accept valid theme values — previous buggy next-themes runs may have
    // written "[object Object]" (containing a space) which crashes classList.add
    const stored = raw && VALID_THEMES.has(raw) ? (raw as Theme) : null
    if (raw && !stored) {
      // Clear the corrupt entry so it doesn't persist
      localStorage.removeItem(storageKey)
    }
    const sys = getSystemTheme()
    setSystemTheme(sys)
    setThemeState(stored ?? defaultTheme)
    setMounted(true)
  }, [defaultTheme, storageKey])

  // Keep systemTheme in sync with OS preference
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      const sys = e.matches ? 'dark' : 'light'
      setSystemTheme(sys)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const resolvedTheme: 'light' | 'dark' = theme === 'system' ? systemTheme : theme

  // Apply class to <html> whenever resolved theme changes
  React.useEffect(() => {
    if (mounted) applyTheme(resolvedTheme)
  }, [resolvedTheme, mounted])

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next)
    try {
      localStorage.setItem(storageKey, next)
    } catch { }
  }, [storageKey])

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, resolvedTheme, systemTheme }),
    [theme, setTheme, resolvedTheme, systemTheme]
  )

  // Prevent flash: inject an inline script before paint to apply the right class immediately
  const initScript = `
    (function(){
      try {
        var stored = localStorage.getItem(${JSON.stringify(storageKey)});
        var theme = stored || ${JSON.stringify(defaultTheme)};
        var resolved = theme === 'system'
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : theme;
        document.documentElement.classList.remove('light','dark');
        document.documentElement.classList.add(resolved);
      } catch(e){}
    })();
  `.trim()

  return (
    <ThemeContext.Provider value={value}>
      <script
        dangerouslySetInnerHTML={{ __html: initScript }}
        suppressHydrationWarning
      />
      {children}
    </ThemeContext.Provider>
  )
}

// Drop-in replacement for next-themes' useTheme
export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
