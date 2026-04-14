import { useLayoutStore } from '../../stores/layoutStore'

const PRESETS = [
  { id: 'focus', label: 'Focus', description: 'Chart only' },
  { id: 'balanced', label: 'Balanced', description: 'Chart + panels' },
  { id: 'data-dense', label: 'Data Dense', description: 'Maximum info' },
  { id: 'portfolio', label: 'Portfolio', description: 'Position focus' }
] as const

export function PresetSelector() {
  const { activePreset, setPreset } = useLayoutStore()

  return (
    <div className="preset-selector">
      {PRESETS.map((preset) => (
        <button
          key={preset.id}
          className={`preset-btn ${activePreset === preset.id ? 'active' : ''}`}
          onClick={() => setPreset(preset.id)}
        >
          <span className="preset-label">{preset.label}</span>
          <span className="preset-desc">{preset.description}</span>
        </button>
      ))}
    </div>
  )
}
