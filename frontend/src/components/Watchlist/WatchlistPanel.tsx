import { useState, useEffect } from 'react'
import { WatchlistItem } from './WatchlistItem'
import { useBinanceWebSocket } from '../../hooks/useBinanceWebSocket'
import axios from 'axios'

interface WatchlistPanelProps {
  selectedSymbol: string
  onSelectSymbol: (symbol: string) => void
}

export function WatchlistPanel({ selectedSymbol, onSelectSymbol }: WatchlistPanelProps) {
  const [symbols, setSymbols] = useState<string[]>([])
  const [newSymbol, setNewSymbol] = useState('')
  const [loading, setLoading] = useState(true)

  useBinanceWebSocket({ symbols })

  useEffect(() => {
    fetchWatchlist()
  }, [])

  async function fetchWatchlist() {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('http://localhost:5002/api/watchlist', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSymbols(res.data.watchlist)
    } catch (err) {
      console.error('Failed to fetch watchlist:', err)
    } finally {
      setLoading(false)
    }
  }

  async function addSymbol() {
    if (!newSymbol.trim()) return
    const symbol = newSymbol.trim().toUpperCase()
    if (symbols.includes(symbol)) return

    try {
      const token = localStorage.getItem('token')
      await axios.post(
        'http://localhost:5002/api/watchlist',
        { symbol },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSymbols([...symbols, symbol])
      setNewSymbol('')
    } catch (err) {
      console.error('Failed to add symbol:', err)
    }
  }

  async function removeSymbol(symbol: string) {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:5002/api/watchlist/${symbol}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSymbols(symbols.filter((s) => s !== symbol))
    } catch (err) {
      console.error('Failed to remove symbol:', err)
    }
  }

  return (
    <div className="watchlist-panel">
      <div className="panel-header">
        <h3>Watchlist</h3>
      </div>

      <div className="watchlist-add">
        <input
          type="text"
          placeholder="Add symbol..."
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addSymbol()}
        />
        <button onClick={addSymbol}>+</button>
      </div>

      <div className="watchlist-items">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : symbols.length === 0 ? (
          <div className="empty">No symbols in watchlist</div>
        ) : (
          symbols.map((symbol) => (
            <WatchlistItem
              key={symbol}
              symbol={symbol}
              onClick={() => onSelectSymbol(symbol)}
              isActive={symbol === selectedSymbol}
            />
          ))
        )}
      </div>
    </div>
  )
}