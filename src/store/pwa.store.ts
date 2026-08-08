import { create } from 'zustand'
import { registerSW } from 'virtual:pwa-register'

interface PwaState {
  needRefresh: boolean
  offlineReady: boolean
}

export const usePwaStore = create<PwaState>(() => ({
  needRefresh: false,
  offlineReady: false,
}))

export const updateSW = registerSW({
  onNeedRefresh() {
    usePwaStore.setState({ needRefresh: true })
  },
  onOfflineReady() {
    usePwaStore.setState({ offlineReady: true })
  },
})