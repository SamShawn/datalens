import { useState, useEffect } from 'react'
import { HoldingRow } from './HoldingRow'
import { AddHoldingModal } from './AddHoldingModal'
import { useBinanceWebSocket } from '../../hooks/useBinanceWebSocket'
import axios from 'axios'

interface Holding {
  id: string
  symbol: string
  quantity: number
  avgCost: number
}

export function PortfolioPanel() {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHolding, setEditingHolding] = useState<Holding | undefined>()

  const symbols = holdings.map((h) => h.symbol)
  useBinanceWebSocket({ symbols })

  useEffect(() => {
    fetchHoldings()
  }, [])

  async function fetchHoldings() {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('http://localhost:5002/api/portfolio', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setHoldings(res.data.holdings)
    } catch (err) {
      console.error('Failed to fetch portfolio:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(data: { symbol: string; quantity: number; avgCost: number }) {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(
        'http://localhost:5002/api/portfolio',
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setHoldings([...holdings, res.data.holding])
      setIsModalOpen(false)
    } catch (err) {
      console.error('Failed to add holding:', err)
    }
  }

  async function handleEdit(data: { symbol: string; quantity: number; avgCost: number }) {
    if (!editingHolding) return
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `http://localhost:5002/api/portfolio/${editingHolding.id}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setHoldings(
        holdings.map((h) =>
          h.id === editingHolding.id ? { ...h, ...data } : h
        )
      )
      setEditingHolding(undefined)
    } catch (err) {
      console.error('Failed to update holding:', err)
    }
  }

  async function handleDelete(id: string) {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:5002/api/portfolio/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setHoldings(holdings.filter((h) => h.id !== id))
    } catch (err) {
      console.error('Failed to delete holding:', err)
    }
  }

  return (
    <div className="portfolio-panel">
      <div className="panel-header">
        <h3>Portfolio</h3>
        <button className="add-btn" onClick={() => setIsModalOpen(true)}>
          + Add
        </button>
      </div>

      <div className="holdings-list">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : holdings.length === 0 ? (
          <div className="empty">No holdings yet</div>
        ) : (
          holdings.map((holding) => (
            <HoldingRow
              key={holding.id}
              holding={holding}
              onEdit={() => setEditingHolding(holding)}
              onDelete={() => handleDelete(holding.id)}
            />
          ))
        )}
      </div>

      <AddHoldingModal
        isOpen={isModalOpen || !!editingHolding}
        onClose={() => { setIsModalOpen(false); setEditingHolding(undefined) }}
        onAdd={editingHolding ? handleEdit : handleAdd}
        initialData={editingHolding}
      />
    </div>
  )
}