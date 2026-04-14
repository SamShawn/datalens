interface TimeframeSelectorProps {
  value: string
  onChange: (tf: string) => void
}

const TIMEFRAMES = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1H', value: '1h' },
  { label: '4H', value: '4h' },
  { label: '1D', value: '1d' }
]

export function TimeframeSelector({ value, onChange }: TimeframeSelectorProps) {
  return (
    <div className="timeframe-selector">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf.value}
          className={`tf-btn ${value === tf.value ? 'active' : ''}`}
          onClick={() => onChange(tf.value)}
        >
          {tf.label}
        </button>
      ))}
    </div>
  )
}
