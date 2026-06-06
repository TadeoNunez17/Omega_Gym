import { create } from 'zustand'

type Theme = 'dark' | 'light'

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('omega-gym-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return 'dark'
}

interface ThemeState {
  theme: Theme
  toggle: () => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  toggle: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('omega-gym-theme', next)
    document.documentElement.dataset.theme = next
    set({ theme: next })
  },
}))
