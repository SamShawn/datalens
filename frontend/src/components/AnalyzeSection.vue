<template>
  <div class="analyze-section">
    <div v-if="!filename" class="no-file">
      <div class="no-file-icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <path d="M32 8v48M16 24l16 16 16-16M8 48h48" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <p>请先上传数据文件</p>
    </div>

    <div v-else class="analyze-content">
      <div class="page-header">
        <h2>数据分析</h2>
        <p>{{ filename }} - 数据洞察报告</p>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <span>分析数据中...</span>
      </div>

      <!-- 分析结果 -->
      <div v-else-if="analysisResult" class="analysis-results">
        <!-- 数值统计 -->
        <div v-if="analysisResult.numeric_stats" class="analysis-block">
          <div class="block-header">
            <h3>数值统计</h3>
            <span class="block-count">{{ Object.keys(analysisResult.numeric_stats).length }} 个字段</span>
          </div>
          <div class="stats-grid">
            <div
              v-for="(stats, col) in analysisResult.numeric_stats"
              :key="col"
              class="stat-card card"
            >
              <div class="stat-title">{{ col }}</div>
              <div class="stat-metrics">
                <div class="metric">
                  <span class="metric-label">数量</span>
                  <span class="metric-value tabular-nums">{{ stats.count.toLocaleString() }}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">平均值</span>
                  <span class="metric-value tabular-nums">{{ formatNumber(stats.mean) }}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">标准差</span>
                  <span class="metric-value tabular-nums">{{ formatNumber(stats.std) }}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">最小值</span>
                  <span class="metric-value tabular-nums">{{ formatNumber(stats.min) }}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">最大值</span>
                  <span class="metric-value tabular-nums">{{ formatNumber(stats.max) }}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">中位数</span>
                  <span class="metric-value tabular-nums">{{ formatNumber(stats.median) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分类统计 -->
        <div v-if="analysisResult.categorical_stats" class="analysis-block">
          <div class="block-header">
            <h3>分类统计</h3>
            <span class="block-count">{{ Object.keys(analysisResult.categorical_stats).length }} 个字段</span>
          </div>
          <div class="categorical-grid">
            <div
              v-for="(stats, col) in analysisResult.categorical_stats"
              :key="col"
              class="categorical-card card"
            >
              <div class="categorical-title">{{ col }}</div>
              <div class="unique-count">
                <span class="label">唯一值</span>
                <span class="value">{{ stats.unique }}</span>
              </div>
              <div class="top-values">
                <div v-for="(count, value) in stats.top_values" :key="value" class="value-item">
                  <span class="value-name">{{ value }}</span>
                  <span class="value-count">{{ count.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 相关性矩阵 -->
        <div v-if="analysisResult.correlation" class="analysis-block">
          <div class="block-header">
            <h3>相关性矩阵</h3>
          </div>
          <div class="correlation-table-container card">
            <table class="correlation-table">
              <thead>
                <tr>
                  <th></th>
                  <th v-for="col in correlationColumns" :key="col">{{ col }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, col) in analysisResult.correlation" :key="col">
                  <td class="row-label">{{ col }}</td>
                  <td
                    v-for="(value, targetCol) in row"
                    :key="targetCol"
                    class="correlation-cell"
                    :class="getCorrelationClass(value)"
                  >
                    {{ formatNumber(value) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import axios from 'axios'

const props = defineProps({
  filename: String
})

const loading = ref(false)
const analysisResult = ref(null)

// 相关性列名
const correlationColumns = computed(() => {
  if (!analysisResult.value?.correlation) return []
  return Object.keys(analysisResult.value.correlation)
})

// 监听文件变化
watch(() => props.filename, (newFilename) => {
  if (newFilename) {
    loadAnalysis()
  }
}, { immediate: true })

// 加载分析数据
const loadAnalysis = async () => {
  if (!props.filename) return

  loading.value = true
  try {
    const response = await axios.post('/api/analyze', {
      filename: props.filename,
      type: 'summary'
    })
    analysisResult.value = response.data

    // 加载相关性
    const corrResponse = await axios.post('/api/analyze', {
      filename: props.filename,
      type: 'correlation'
    })
    if (corrResponse.data.correlation) {
      analysisResult.value.correlation = corrResponse.data.correlation
    }

  } catch (error) {
    console.error('分析失败:', error)
    alert('分析失败: ' + (error.response?.data?.error || error.message))
  } finally {
    loading.value = false
  }
}

// 格式化数字
const formatNumber = (value) => {
  if (value === null || value === undefined) return '-'
  return Number(value).toFixed(4)
}

// 获取相关性单元格样式
const getCorrelationClass = (value) => {
  const absValue = Math.abs(value)
  if (absValue >= 0.8) return 'strong'
  if (absValue >= 0.5) return 'moderate'
  if (absValue >= 0.3) return 'weak'
  return 'none'
}
</script>

<style scoped>
.analyze-section {
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

.analyze-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.page-header {
  margin-bottom: var(--space-md);
}

.page-header h2 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 4px;
}

.page-header p {
  color: var(--color-text-muted);
  font-size: 14px;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding: 60px 0;
  color: var(--color-text-muted);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent-gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 分析结果 */
.analysis-results {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.analysis-block {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.block-header {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
}

.block-header h3 {
  font-size: 18px;
  font-weight: 600;
}

.block-count {
  font-size: 13px;
  color: var(--color-text-muted);
}

/* 数值统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-md);
}

.stat-card {
  display: flex;
  flex-direction: column;
}

.stat-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--color-accent-gold);
  border-radius: var(--radius-lg) 0 0 var(--radius-lg);
}

.stat-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-border);
  padding-left: var(--space-sm);
}

.stat-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
  padding-left: var(--space-sm);
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.metric-label {
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.metric-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

/* 分类统计卡片 */
.categorical-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-md);
}

.categorical-card {
  display: flex;
  flex-direction: column;
}

.categorical-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.unique-count {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 13px;
  color: var(--color-text-muted);
  margin-bottom: var(--space-md);
}

.unique-count .label {
  color: var(--color-text-muted);
}

.unique-count .value {
  color: var(--color-accent-gold);
  font-weight: 600;
}

.top-values {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.value-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
}

.value-name {
  color: var(--color-text-primary);
  font-size: 13px;
}

.value-count {
  color: var(--color-text-muted);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

/* 相关性表格 */
.correlation-table-container {
  overflow-x: auto;
}

.correlation-table {
  border-collapse: collapse;
  font-size: 12px;
  min-width: 100%;
}

.correlation-table th {
  background: rgba(245, 166, 35, 0.1);
  color: var(--color-accent-gold);
  padding: 12px 10px;
  text-align: center;
  font-weight: 600;
  white-space: nowrap;
  border-bottom: 1px solid var(--color-border);
}

.correlation-table td {
  padding: 10px;
  text-align: center;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  font-variant-numeric: tabular-nums;
}

.row-label {
  color: var(--color-text-primary) !important;
  font-weight: 600 !important;
  background: rgba(245, 166, 35, 0.05) !important;
  text-align: left !important;
  padding-left: 12px !important;
}

.correlation-cell {
  font-family: var(--font-mono);
}

.correlation-cell.strong {
  color: var(--color-accent-teal);
  font-weight: 600;
}

.correlation-cell.moderate {
  color: var(--color-accent-blue);
}

.correlation-cell.weak {
  color: var(--color-text-secondary);
}

.correlation-cell.none {
  color: var(--color-text-muted);
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid,
  .categorical-grid {
    grid-template-columns: 1fr;
  }

  .stat-metrics {
    grid-template-columns: 1fr;
  }
}
</style>