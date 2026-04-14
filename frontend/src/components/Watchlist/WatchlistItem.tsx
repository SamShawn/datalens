import { usePriceStore } from '../../stores/priceStore'

interface WatchlistItemProps {
  symbol: string
  onClick: () => void
  onRemove: () => void
  isActive?: boolean
}

export function WatchlistItem({ symbol, onClick, onRemove, isActive }: WatchlistItemProps) {
  const priceData = usePriceStore((state) => state.prices[symbol])

  if (!priceData) {
    return (
      <div className="watchlist-item" onClick={onClick}>
        <span className="symbol">{symbol}</span>
        <button className="remove-btn" onClick={(e) => { e.stopPropagation(); onRemove(); }}>×</button>
      </div>
    )
  }

  const isPositive = priceData.changePercent24h >= 0

  return (
    <div className={`watchlist-item ${isActive ? 'active' : ''}`} onClick={onClick}>
      <span className="symbol">{symbol}</span>
      <div className="price-info">
        <span className="price">${priceData.price.toLocaleString()}</span>
        <span className={`change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '+' : ''}{priceData.changePercent24h.toFixed(2)}%
        </span>
      </div>
      <button className="remove-btn" onClick={(e) => { e.stopPropagation(); onRemove(); }}>×</button>
    </div>
  )
}
