<template>
  <div class="kpi-card" :class="{ 'is-positive': trend > 0, 'is-negative': trend < 0 }">
    <div class="kpi-indicator"></div>
    <div class="kpi-content">
      <span class="kpi-label">{{ label }}</span>
      <div class="kpi-value-row">
        <span class="kpi-value tabular-nums">{{ formattedValue }}</span>
        <span class="kpi-trend" v-if="trend !== undefined">
          <svg v-if="trend > 0" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 10V2M6 2L2 6M6 2L10 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="trend < 0" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2V10M6 10L2 6M6 10L10 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ Math.abs(trend) }}%</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: String,
  value: [Number, String],
  trend: Number,
  prefix: {
    type: String,
    default: ''
  },
  suffix: {
    type: String,
    default: ''
  },
  format: {
    type: String,
    default: 'number' // number, currency, percent
  }
})

const formattedValue = computed(() => {
  let val = props.value

  if (typeof val === 'string') {
    return props.prefix + val + props.suffix
  }

  if (props.format === 'currency') {
    val = val.toLocaleString('en-US', { maximumFractionDigits: 0 })
    return '$' + val
  }

  if (props.format === 'percent') {
    return val.toFixed(2) + '%'
  }

  // Default number format
  if (typeof val === 'number') {
    val = val.toLocaleString('en-US')
  }

  return props.prefix + val + props.suffix
})
</script>

<style scoped>
.kpi-card {
  position: relative;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  overflow: hidden;
  transition: all var(--transition-base);
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-border-hover);
}

.kpi-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--color-text-muted);
  transition: background var(--transition-base);
}

.kpi-card.is-positive .kpi-indicator {
  background: var(--color-accent-teal);
}

.kpi-card.is-negative .kpi-indicator {
  background: var(--color-accent-red);
}

.kpi-card:hover .kpi-indicator {
  background: var(--color-accent-gold);
}

.kpi-content {
  padding-left: var(--space-sm);
}

.kpi-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  margin-bottom: var(--space-xs);
}

.kpi-value-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
}

.kpi-value {
  font-size: 32px;
  font-weight: 300;
  letter-spacing: -0.03em;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

.kpi-trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 13px;
  font-weight: 500;
}

.kpi-card.is-positive .kpi-trend {
  color: var(--color-accent-teal);
}

.kpi-card.is-negative .kpi-trend {
  color: var(--color-accent-red);
}

.kpi-card:not(.is-positive):not(.is-negative) .kpi-trend {
  color: var(--color-text-muted);
}
</style>