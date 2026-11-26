import { useCallback, useEffect, useState } from 'react'
import { usePwaInstallStore } from '@/store/pwa-install.store'

function currentStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const nav = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || Boolean(nav.standalone)
}

export function usePwaInstall() {
  const platform = usePwaInstallStore(state => state.platform)
  const deferredPrompt = usePwaInstallStore(state => state.deferredPrompt)
  const installed = usePwaInstallStore(state => state.installed)
  const storeInstall = usePwaInstallStore(state => state.install)
  const [standalone, setStandalone] = useState(currentStandalone)

  useEffect(() => {
    const query = window.matchMedia('(display-mode: standalone)')
    const update = () => setStandalone(currentStandalone())
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  const install = useCallback(async () => {
    if (platform !== 'android' || !deferredPrompt) return false
    return storeInstall()
  }, [deferredPrompt, platform, storeInstall])

  const isMobile = platform === 'ios' || platform === 'android'
  const canPrompt = platform === 'android' && Boolean(deferredPrompt)

  return {
    platform,
    isMobile,
    isStandalone: standalone,
    canPrompt,
    showCta: isMobile && !standalone && !installed,
    install,
  }
}
