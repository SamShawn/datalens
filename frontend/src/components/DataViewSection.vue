<template>
  <div class="data-view-section">
    <div v-if="!filename" class="no-file">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <path d="M8 8H56C58.2091 8 60 9.79086 60 12V52C60 54.2091 58.2091 56 56 56H8C5.79086 56 4 54.2091 4 52V12C4 9.79086 5.79086 8 8 8Z" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
        <path d="M16 24H48M16 36H40M16 48H32" stroke="rgba(255,255,255,0.3)" stroke-width="3" stroke-linecap="round"/>
      </svg>
      <p>请先上传数据文件</p>
    </div>

    <div v-else class="data-view">
      <!-- 文件信息头部 -->
      <div class="data-header">
        <div class="file-info">
          <h2>{{ filename }}</h2>
          <span class="meta">{{ totalRows }} 行 × {{ columns.length }} 列</span>
        </div>
        <div class="actions">
          <select v-model="perPage" class="per-page-select">
            <option value="25">25 行/页</option>
            <option value="50">50 行/页</option>
            <option value="100">100 行/页</option>
          </select>
          <button class="export-button" @click="exportData">
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
      <div class="table-container">
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
              <td v-for="col in columns" :key="col">{{ formatCellValue(row[col]) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="page-button"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          上一页
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button
          class="page-button"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          下一页
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
    return Number.isInteger(value) ? value : value.toFixed(2)
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
  padding: 40px 0;
}

.no-file {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 100px 0;
  color: rgba(255, 255, 255, 0.5);
}

.data-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 数据头部 */
.data-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-info h2 {
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.file-info .meta {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.per-page-select {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.per-page-select option {
  background: #1a1a2e;
}

.export-button {
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

.export-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

/* 表格容器 */
.table-container {
  overflow-x: auto;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 4px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
  position: sticky;
  top: 0;
}

.data-table td {
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.8);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.data-table tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}

.loading-cell {
  padding: 60px 20px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.5);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-cell {
  padding: 60px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
}

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
}

.page-button {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
}
</style>
