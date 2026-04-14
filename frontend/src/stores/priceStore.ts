import { create } from 'zustand'

interface PriceData {
  symbol: string
  price: number
  change24h: number
  changePercent24h: number
  high24h: number
  low24h: number
  volume24h: number
}

interface PriceStore {
  prices: Record<string, PriceData>
  setPrice: (symbol: string, data: PriceData) => void
  getPrice: (symbol: string) => PriceData | undefined
}

export const usePriceStore = create<PriceStore>((set, get) => ({
  prices: {},
  setPrice: (symbol, data) =>
    set((state) => ({
      prices: { ...state.prices, [symbol]: data }
    })),
  getPrice: (symbol) => get().prices[symbol]
}))
