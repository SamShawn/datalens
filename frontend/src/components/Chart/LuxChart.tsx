import { useEffect, useRef, useState } from 'react'
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts'

interface LuxChartProps {
  symbol: string
  interval?: string
}

const INTERVAL_MAP: Record<string, string> = {
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '1h': '1h',
  '4h': '4h',
  '1d': '1d'
}

export function LuxChart({ symbol, interval = '1h' }: LuxChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#6B7280'
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)' }
      },
      crosshair: {
        mode: 1,
        vertLine: { color: '#D4AF37', width: 1, style: 2 },
        horzLine: { color: '#D4AF37', width: 1, style: 2 }
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)'
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        timeVisible: true
      }
    })

    chartRef.current = chart

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#50C878',
      downColor: '#E57373',
      borderUpColor: '#50C878',
      borderDownColor: '#E57373',
      wickUpColor: '#50C878',
      wickDownColor: '#E57373'
    })
    candleSeriesRef.current = candleSeries

    const volumeSeries = chart.addHistogramSeries({
      color: '#D4AF37',
      priceFormat: { type: 'volume' },
      priceScaleId: ''
    })
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 }
    })
    volumeSeriesRef.current = volumeSeries

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight
        })
      }
    }
    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [])

  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current) return

    setLoading(true)
    const binanceInterval = INTERVAL_MAP[interval] || '1h'

    fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${binanceInterval}&limit=500`
    )
      .then((res) => res.json())
      .then((data) => {
        const candleData: CandlestickData<Time>[] = data.map((k: any[]) => ({
          time: (k[0] / 1000) as Time,
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4])
        }))

        const volumeData = data.map((k: any[]) => ({
          time: (k[0] / 1000) as Time,
          value: parseFloat(k[5]),
          color: parseFloat(k[4]) >= parseFloat(k[1]) ? '#50C878' : '#E57373'
        }))

        candleSeriesRef.current?.setData(candleData)
        volumeSeriesRef.current?.setData(volumeData)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load chart data:', err)
        setLoading(false)
      })
  }, [symbol, interval])

  return (
    <div className="lux-chart">
      {loading && <div className="chart-loading">Loading...</div>}
      <div ref={chartContainerRef} className="chart-container" />
    </div>
  )
}
