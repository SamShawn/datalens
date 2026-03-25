<template>
  <div class="analyze-section">
    <div v-if="!filename" class="no-file">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <path d="M8 8H56C58.2091 8 60 9.79086 60 12V52C60 54.2091 58.2091 56 56 56H8C5.79086 56 4 54.2091 4 52V12C4 9.79086 5.79086 8 8 8Z" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
        <path d="M16 24H48M16 36H40M16 48H32" stroke="rgba(ser,255,255,0.3)" stroke-width="3" stroke-linecap="round"/>
      </svg>
      <p>请先上传数据文件</p>
    </div>

    <div v-else class="analyze-content">
      <div class="analyze-header">
        <h2>{{ filename }} - 数据分析</h2>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>分析数据中...</p>
      </div>

      <!-- 分析结果 -->
      <div v-else-if="analysisResult" class="analysis-results">
        <!-- 数值统计 -->
        <div v-if="analysisResult.numeric_stats" class="analysis-block">
          <h3>数值统计</h3>
          <div class="stats-grid">
            <div
              v-for="(stats, col) in analysisResult.numeric_stats"
              :key="col"
              class="stat-card"
            >
              <div class="stat-title">{{ col }}</div>
              <div class="stat-metrics">
                <div class="metric">
                  <span class="metric-label">数量</span>
                  <span class="metric-value">{{ stats.count }}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">平均值</span>
                  <span class="metric-value">{{ formatNumber(stats.mean) }}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">标准差</span>
                  <span class="metric-value">{{ formatNumber(stats.std) }}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">最小值</span>
                  <span class="metric-value">{{ formatNumber(stats.min) }}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">最大值</span>
                  <span class="metric-value">{{ formatNumber(stats.max) }}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">中位数</span>
                  <span class="metric-value">{{ formatNumber(stats.median) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分类统计 -->
        <div v-if="analysisResult.categorical_stats" class="analysis-block">
          <h3>分类统计</h3>
          <div class="categorical-grid">
            <div
              v-for="(stats, col) in analysisResult.categorical_stats"
              :key="col"
              class="categorical-card"
            >
              <div class="categorical-title">{{ col }}</div>
              <div class="unique-count">
                唯一值: {{ stats.unique }}
              </div>
              <div class="top-values">
                <div v-for="(count, value) in stats.top_values" :key="value" class="value-item">
                  <span class="value">{{ value }}</span>
                  <span class="count">{{ count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 相关性矩阵 -->
        <div v-if="analysisResult.correlation" class="analysis-block">
          <h3>相关性矩阵</h3>
          <div class="correlation-table-container">
            <table class="correlation-table">
              <thead>
                <tr>
                  <th>列名</th>
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

.analyze-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.analyze-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: white;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 0;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.analysis-results {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.analysis-block h3 {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin-bottom: 20px;
}

/* 数值统计 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: 15px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

/* 分类统计 */
.categorical-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.categorical-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.categorical-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
}

.unique-count {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 16px;
}

.top-values {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.value-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 6px;
}

.value-item .value {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
}

.value-item .count {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

/* 相关性表格 */
.correlation-table-container {
  overflow-x: auto;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 4px;
}

.correlation-table {
  border-collapse: collapse;
  font-size: 13px;
}

.correlation-table th {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  padding: 10px;
  text-align: center;
  font-weight: 600;
  white-space: nowrap;
}

.correlation-table td {
  padding: 8px 10px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
}

.row-label {
  color: white !important;
  font-weight: 600 !important;
  background: rgba(99, 102, 241, 0.1) !important;
}

.correlation-cell {
  font-family: 'Monaco', 'Menlo', monospace;
}

.correlation-cell.strong {
  color: #10b981;
  font-weight: 600;
}

.correlation-cell.moderate {
  color: #3b82f6;
}

.correlation-cell.weak {
  color: #a5b4fc;
}

.correlation-cell.none {
  color: rgba(255, 255, 255, 0.4);
}
</style>
