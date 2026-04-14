import { usePriceStore } from '../../stores/priceStore'

interface HoldingRowProps {
  holding: {
    id: string
    symbol: string
    quantity: number
    avgCost: number
  }
  onEdit: () => void
  onDelete: () => void
}

export function HoldingRow({ holding, onEdit, onDelete }: HoldingRowProps) {
  const priceData = usePriceStore((state) => state.prices[holding.symbol])
  const currentPrice = priceData?.price || 0
  const currentValue = currentPrice * holding.quantity
  const costBasis = holding.avgCost * holding.quantity
  const pnl = currentValue - costBasis
  const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0
  const isPositive = pnl >= 0

  return (
    <div className="holding-row">
      <div className="holding-main">
        <span className="symbol">{holding.symbol}</span>
        <span className="quantity">{holding.quantity}</span>
      </div>
      <div className="holding-values">
        <div className="value-row">
          <span className="label">Value</span>
          <span className="value">${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="value-row">
          <span className="label">P&L</span>
          <span className={`value ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '+' : ''}{pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({pnlPercent.toFixed(2)}%)
          </span>
        </div>
      </div>
      <div className="holding-actions">
        <button onClick={onEdit} className="edit-btn">Edit</button>
        <button onClick={onDelete} className="delete-btn">×</button>
      </div>
    </div>
  )
}