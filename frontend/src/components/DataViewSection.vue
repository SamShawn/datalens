<template>
  <div class="data-view-section">
    <div v-if="!filename" class="no-file">
      <div class="no-file-icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <rect x="8" y="8" width="48" height="48" rx="4" stroke="currentColor" stroke-width="2"/>
          <path d="M20 24h24M20 32h24M20 40h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <p>请先上传数据文件</p>
    </div>

    <div v-else class="data-view">
      <!-- 文件信息头部 -->
      <div class="data-header card">
        <div class="file-info">
          <div class="file-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 4h10l4 4v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" stroke-width="1.5"/>
              <path d="M14 4v4h4" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </div>
          <div>
            <h2>{{ filename }}</h2>
            <span class="meta">{{ totalRows.toLocaleString() }} 行 × {{ columns.length }} 列</span>
          </div>
        </div>
        <div class="actions">
          <select v-model="perPage" class="per-page-select">
            <option value="25">25 行/页</option>
            <option value="50">50 行/页</option>
            <option value="100">100 行/页</option>
          </select>
          <button class="btn btn-primary" @click="exportData">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 10v3a1 1 0 01-1 1H3a1 1 0 01-1-1v-3M11 5L8 2M8 2L5 5M8 2v9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            导出数据
          </button>
        </div>
      </div>

      <!-- 过滤面板 -->
      <FilterPanel
        v-if="columns.length > 0"
        :columns="columns"
        :column-types="columnTypes"
        @filter-change="handleFilterChange"
      />

      <!-- 数据表格 -->
      <div class="table-container card">
        <table class="data-table">
          <thead>
            <tr>
              <th v-for="col in columns" :key="col">{{ col }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td :colspan="columns.length" class="loading-cell">
                <div class="spinner"></div>
                <span>加载数据中...</span>
              </td>
            </tr>
            <tr v-else-if="data.length === 0">
              <td :colspan="columns.length" class="empty-cell">
                没有数据
              </td>
            </tr>
            <tr v-else v-for="(row, index) in data" :key="index">
              <td v-for="col in columns" :key="col" :class="{ 'numeric': columnTypes[col] === 'number' }">
                {{ formatCellValue(row[col]) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="btn btn-secondary page-button"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          上一页
        </button>
        <span class="page-info">
          <span class="page-current">{{ currentPage }}</span>
          <span class="page-separator">/</span>
          <span class="page-total">{{ totalPages }}</span>
        </span>
        <button
          class="btn btn-secondary page-button"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          下一页
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 12l4-4-4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import axios from 'axios'
import FilterPanel from './FilterPanel.vue'

const props = defineProps({
  filename: String
})

// 数据状态
const loading = ref(false)
const data = ref([])
const columns = ref([])
const columnTypes = ref({})
const totalRows = ref(0)
const currentPage = ref(1)
const perPage = ref(50)
const filters = ref([])

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(totalRows.value / perPage.value)
})

// 监听文件变化
watch(() => props.filename, (newFilename) => {
  if (newFilename) {
    loadData()
  }
}, { immediate: true })

// 监听分页变化
watch([currentPage, perPage], () => {
  loadData()
})

// 加载数据
const loadData = async () => {
  if (!props.filename) return

  loading.value = true
  try {
    const response = await axios.get(`/api/data/${props.filename}`, {
      params: {
        page: currentPage.value,
        per_page: perPage.value
      }
    })

    data.value = response.data.data
    columns.value = response.data.columns || []
    totalRows.value = response.data.total
    currentPage.value = response.data.page

    // 获取列类型信息
    if (columns.value.length > 0 && Object.keys(columnTypes.value).length === 0) {
      const analyzeResponse = await axios.post('/api/analyze', {
        filename: props.filename,
        type: 'summary'
      })
      // 从数值列推断类型
      const numericCols = new Set(Object.keys(analyzeResponse.data.numeric_stats || {}))
      columns.value.forEach(col => {
        columnTypes.value[col] = numericCols.has(col) ? 'number' : 'string'
      })
    }

  } catch (error) {
    console.error('加载数据失败:', error)
    alert('加载数据失败: ' + (error.response?.data?.error || error.message))
  } finally {
    loading.value = false
  }
}

// 处理过滤变化
const handleFilterChange = (newFilters) => {
  filters.value = newFilters
  currentPage.value = 1
  loadData()
}

// 切换页面
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// 格式化单元格值
const formatCellValue = (value) => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'number') {
    return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(2)
  }
  return String(value)
}

// 导出数据
const exportData = async () => {
  try {
    const response = await axios.post('/api/export', {
      filename: props.filename,
      operations: filters.value,
      format: 'csv'
    }, {
      responseType: 'blob'
    })

    const blob = new Blob([response.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `exported_${props.filename}`
    a.click()
    window.URL.revokeObjectURL(url)

  } catch (error) {
    console.error('导出失败:', error)
    alert('导出失败: ' + (error.response?.data?.error || error.message))
  }
}
</script>

<style scoped>
.data-view-section {
  min-height: calc(100vh - 120px);
}

.no-file {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  padding: 100px 0;
  color: var(--color-text-muted);
}

.no-file-icon {
  opacity: 0.3;
}

.data-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

/* 数据头部 */
.data-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.file-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.file-icon {
  color: var(--color-accent-gold);
}

.file-info h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 2px;
}

.file-info .meta {
  color: var(--color-text-muted);
  font-size: 13px;
}

.actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

/* 按钮 */
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

.btn-secondary {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-bg-elevated);
}

.per-page-select {
  padding: 8px 32px 8px 12px;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: 13px;
  cursor: pointer;
}

.per-page-select option {
  background: var(--color-bg-secondary);
}

/* 表格容器 */
.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table th {
  background: rgba(245, 166, 35, 0.1);
  color: var(--color-accent-gold);
  padding: 14px 16px;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
}

.data-table td {
  padding: 12px 16px;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
}

.data-table td.numeric {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}

.loading-cell,
.empty-cell {
  padding: 60px 20px;
  text-align: center;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
}

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
}

.page-button {
  gap: var(--space-xs);
}

.page-info {
  display: flex;
  align-items: baseline;
  gap: 4px;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.page-current {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.page-separator {
  color: var(--color-text-muted);
}

.page-total {
  color: var(--color-text-muted);
}

/* Responsive */
@media (max-width: 768px) {
  .data-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }

  .actions {
    width: 100%;
  }

  .per-page-select {
    flex: 1;
  }

  .btn-primary {
    flex: 1;
  }
}
</style>