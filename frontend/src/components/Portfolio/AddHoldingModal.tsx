import { useState } from 'react'

interface AddHoldingModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: { symbol: string; quantity: number; avgCost: number }) => void
  initialData?: { symbol: string; quantity: number; avgCost: number }
}

export function AddHoldingModal({ isOpen, onClose, onAdd, initialData }: AddHoldingModalProps) {
  const [symbol, setSymbol] = useState(initialData?.symbol || '')
  const [quantity, setQuantity] = useState(initialData?.quantity?.toString() || '')
  const [avgCost, setAvgCost] = useState(initialData?.avgCost?.toString() || '')

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onAdd({
      symbol: symbol.toUpperCase(),
      quantity: parseFloat(quantity),
      avgCost: parseFloat(avgCost)
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{initialData ? 'Edit Holding' : 'Add Holding'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="BTCUSDT"
              required
            />
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.5"
              required
            />
          </div>
          <div className="form-group">
            <label>Average Cost (USD)</label>
            <input
              type="number"
              step="any"
              value={avgCost}
              onChange={(e) => setAvgCost(e.target.value)}
              placeholder="42000"
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {initialData ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}