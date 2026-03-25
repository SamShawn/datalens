<template>
  <div class="filter-panel">
    <div class="panel-header">
      <h3>数据过滤</h3>
      <button class="add-filter-button" @click="addFilter">
        + 添加过滤条件
      </button>
    </div>

    <div v-if="filters.length === 0" class="empty-filters">
      <p>点击上方按钮添加过滤条件</p>
    </div>

    <div v-else class="filters-list">
      <div v-for="(filter, index) in filters" :key="index" class="filter-item">
        <select v-model="filter.column" class="filter-select">
          <option value="">选择列</option>
          <option v-for="col in columns" :key="col" :value="col">{{ col }}</option>
        </select>

        <select v-model="filter.operator" class="filter-select">
          <option value="eq">等于</option>
          <option value="gt">大于</option>
          <option value="lt">小于</option>
          <option value="contains">包含</option>
        </select>

        <input
          v-model="filter.value"
          type="text"
          :placeholder="columnTypes[filter.column] === 'number' ? '输入数值' : '输入值'"
          class="filter-input"
        />

        <button class="remove-filter-button" @click="removeFilter(index)">
          删除
        </button>
      </div>
    </div>

    <div v-if="filters.length > 0" class="panel-footer">
      <button class="apply-button" @click="applyFilters">
        应用过滤
      </button>
      <button class="clear-button" @click="clearFilters">
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
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.panel-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.add-filter-button {
  padding: 8px 16px;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 6px;
  color: #a5b4fc;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-filter-button:hover {
  background: rgba(99, 102, 241, 0.3);
}

.empty-filters {
  padding: 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
}

.filters-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.filter-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.filter-select {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 13px;
  cursor: pointer;
  flex-shrink: 0;
}

.filter-select option {
  background: #1a1a2e;
}

.filter-input {
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 13px;
}

.filter-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.remove-filter-button {
  padding: 8px 16px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: #fca5a5;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-filter-button:hover {
  background: rgba(239, 68, 68, 0.3);
}

.panel-footer {
  display: flex;
  gap: 12px;
}

.apply-button {
  flex: 1;
  padding: 10px 20px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.apply-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.clear-button {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-button:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
