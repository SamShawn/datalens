import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type LayoutPreset = 'focus' | 'balanced' | 'data-dense' | 'portfolio'

interface LayoutConfig {
  chartSize: number
  showWatchlist: boolean
  showPortfolio: boolean
  watchlistSize: number
  portfolioSize: number
}

const LAYOUT_CONFIGS: Record<LayoutPreset, LayoutConfig> = {
  focus: {
    chartSize: 100,
    showWatchlist: false,
    showPortfolio: false,
    watchlistSize: 0,
    portfolioSize: 0
  },
  balanced: {
    chartSize: 60,
    showWatchlist: true,
    showPortfolio: true,
    watchlistSize: 20,
    portfolioSize: 20
  },
  'data-dense': {
    chartSize: 50,
    showWatchlist: true,
    showPortfolio: true,
    watchlistSize: 25,
    portfolioSize: 25
  },
  portfolio: {
    chartSize: 40,
    showWatchlist: true,
    showPortfolio: true,
    watchlistSize: 25,
    portfolioSize: 35
  }
}

interface LayoutStore {
  activePreset: LayoutPreset
  setPreset: (preset: LayoutPreset) => void
  getConfig: () => LayoutConfig
}

export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set, get) => ({
      activePreset: 'balanced',
      setPreset: (preset) => set({ activePreset: preset }),
      getConfig: () => LAYOUT_CONFIGS[get().activePreset]
    }),
    {
      name: 'luxterminal-layout'
    }
  )
)
