import { useState } from 'react'
import { useLayoutStore } from '../../stores/layoutStore'
import { LuxChart } from '../Chart/LuxChart'
import { TimeframeSelector } from '../Chart/TimeframeSelector'
import { WatchlistPanel } from '../Watchlist/WatchlistPanel'
import { PortfolioPanel } from '../Portfolio/PortfolioPanel'
import { PresetSelector } from './PresetSelector'

export function Dashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [timeframe, setTimeframe] = useState('1h')
  const { getConfig } = useLayoutStore()
  const config = getConfig()

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="logo">LuxTerminal</h1>
          <div className="symbol-badge">{selectedSymbol}</div>
        </div>
        <div className="header-center">
          <TimeframeSelector value={timeframe} onChange={setTimeframe} />
        </div>
        <div className="header-right">
          <PresetSelector />
        </div>
      </header>

      <main className="dashboard-main">
        <div
          className="chart-section"
          style={{ flexBasis: `${config.chartSize}%` }}
        >
          <LuxChart symbol={selectedSymbol} interval={timeframe} />
        </div>

        {config.showWatchlist && (
          <aside
            className="watchlist-section glass-panel"
            style={{ flexBasis: `${config.watchlistSize}%` }}
          >
            <WatchlistPanel
              selectedSymbol={selectedSymbol}
              onSelectSymbol={setSelectedSymbol}
            />
          </aside>
        )}

        {config.showPortfolio && (
          <aside
            className="portfolio-section glass-panel"
            style={{ flexBasis: `${config.portfolioSize}%` }}
          >
            <PortfolioPanel />
          </aside>
        )}
      </main>
    </div>
  )
}
