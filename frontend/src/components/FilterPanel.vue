<template>
  <div class="filter-panel card">
    <div class="panel-header">
      <h3>数据过滤</h3>
      <button class="btn btn-ghost add-filter-button" @click="addFilter">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        添加条件
      </button>
    </div>

    <div v-if="filters.length === 0" class="empty-filters">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <span>点击上方按钮添加过滤条件</span>
    </div>

    <div v-else class="filters-list">
      <div v-for="(filter, index) in filters" :key="index" class="filter-item">
        <select v-model="filter.column" class="filter-select">
          <option value="">选择列</option>
          <option v-for="col in columns" :key="col" :value="col">{{ col }}</option>
        </select>

        <select v-model="filter.operator" class="filter-select operator">
          <option value="eq">等于</option>
          <option value="gt">大于</option>
          <option value="lt">小于</option>
          <option value="gte">大于等于</option>
          <option value="lte">小于等于</option>
          <option value="contains">包含</option>
          <option value="ne">不等于</option>
        </select>

        <input
          v-model="filter.value"
          type="text"
          :placeholder="columnTypes[filter.column] === 'number' ? '输入数值' : '输入值'"
          class="filter-input"
        />

        <button class="btn btn-ghost remove-filter-button" @click="removeFilter(index)">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>

    <div v-if="filters.length > 0" class="panel-footer">
      <button class="btn btn-primary" @click="applyFilters">
        应用过滤
      </button>
      <button class="btn btn-ghost" @click="clearFilters">
        清除所有
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    default: () => []
  },
  columnTypes: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['filter-change'])

const filters = ref([])

// 添加过滤条件
const addFilter = () => {
  filters.value.push({
    column: '',
    operator: 'eq',
    value: ''
  })
}

// 删除过滤条件
const removeFilter = (index) => {
  filters.value.splice(index, 1)
}

// 应用过滤
const applyFilters = () => {
  const validFilters = filters.value.filter(f => f.column && f.value !== '')
  const operations = validFilters.map(f => ({
    type: 'filter',
    column: f.column,
    operator: f.operator,
    value: f.value
  }))
  emit('filter-change', operations)
}

// 清除所有过滤
const clearFilters = () => {
  filters.value = []
  emit('filter-change', [])
}
</script>

<style scoped>
.filter-panel {
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.panel-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.add-filter-button {
  font-size: 13px;
  gap: 4px;
}

.empty-filters {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-lg);
  color: var(--color-text-muted);
  font-size: 14px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-md);
}

.filters-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.filter-item {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
}

.filter-select {
  padding: 8px 32px 8px 12px;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: 13px;
  cursor: pointer;
  flex-shrink: 0;
  min-width: 100px;
}

.filter-select.operator {
  min-width: 120px;
}

.filter-select option {
  background: var(--color-bg-secondary);
}

.filter-input {
  flex: 1;
  padding: 8px 12px;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: 13px;
}

.filter-input:focus {
  border-color: var(--color-accent-gold);
  outline: none;
}

.filter-input::placeholder {
  color: var(--color-text-muted);
}

.remove-filter-button {
  color: var(--color-accent-red);
  padding: 8px;
}

.remove-filter-button:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-primary {
  background: var(--gradient-gold);
  color: var(--color-bg-primary);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-glow-gold);
}

.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-primary);
}

.panel-footer {
  display: flex;
  gap: var(--space-sm);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

/* Responsive */
@media (max-width: 768px) {
  .filter-item {
    flex-wrap: wrap;
  }

  .filter-select,
  .filter-input {
    min-width: calc(50% - 20px);
  }
}
</style>