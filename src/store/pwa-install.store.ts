import { create } from 'zustand'
import type { BeforeInstallPromptEvent } from '@/types/pwa'

export type PwaPlatform = 'ios' | 'android' | 'other'

interface PwaInstallState {
  deferredPrompt: BeforeInstallPromptEvent | null
  installed: boolean
  platform: PwaPlatform
  install: () => Promise<boolean>
}

function detectPlatform(): PwaPlatform {
  if (typeof navigator === 'undefined') return 'other'
  const userAgent = navigator.userAgent
  const ios =
    /iPad|iPhone|iPod/.test(userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  if (ios) return 'ios'
  if (/Android/i.test(userAgent)) return 'android'
  return 'other'
}

export const usePwaInstallStore = create<PwaInstallState>((set, get) => ({
  deferredPrompt: null,
  installed: false,
  platform: detectPlatform(),
  install: async (): Promise<boolean> => {
    const prompt = get().deferredPrompt
    if (!prompt) return false
    set({ deferredPrompt: null })
    try {
      await prompt.prompt()
      const choice = await prompt.userChoice
      if (choice.outcome === 'accepted') {
        set({ installed: true })
      }
      return choice.outcome === 'accepted'
    } catch {
      return false
    }
  },
}))

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault()
    usePwaInstallStore.setState({
      deferredPrompt: event as BeforeInstallPromptEvent,
      installed: false,
    })
  })
  window.addEventListener('appinstalled', () => {
    usePwaInstallStore.setState({ deferredPrompt: null, installed: true })
  })
}
