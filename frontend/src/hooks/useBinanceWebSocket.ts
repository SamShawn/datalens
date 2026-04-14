import { useEffect, useRef } from 'react'
import { usePriceStore } from '../stores/priceStore'

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws'

interface UseBinanceWebSocketOptions {
  symbols: string[]
  onOpen?: () => void
  onClose?: () => void
}

export function useBinanceWebSocket({ symbols, onOpen, onClose }: UseBinanceWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<number>()
  const setPrice = usePriceStore((state) => state.setPrice)

  useEffect(() => {
    if (symbols.length === 0) return

    function connect() {
      const streams = symbols.map((s) => `${s.toLowerCase()}@ticker`).join('/')
      const ws = new WebSocket(`${BINANCE_WS_URL}/${streams}`)
      wsRef.current = ws

      ws.onopen = () => {
        onOpen?.()
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.e === '24hrTicker') {
          setPrice(data.s, {
            symbol: data.s,
            price: parseFloat(data.c),
            change24h: parseFloat(data.p),
            changePercent24h: parseFloat(data.P),
            high24h: parseFloat(data.h),
            low24h: parseFloat(data.l),
            volume24h: parseFloat(data.v)
          })
        }
      }

      ws.onclose = () => {
        onClose?.()
        reconnectTimeoutRef.current = window.setTimeout(connect, 3000)
      }

      ws.onerror = () => {
        ws.close()
      }
    }

    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      wsRef.current?.close()
    }
  }, [symbols.join(',')])
}
