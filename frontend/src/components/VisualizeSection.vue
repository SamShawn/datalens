<template>
  <div class="visualize-section">
    <div v-if="!filename" class="no-file">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <path d="M8 8H56C58.2091 8 60 9.79086 60 12V52C60 54.2091 58.2091 56 56 56H8C5.79086 56 4 54.2091 4 52V12C4 9.79086 5.79086 8 8 8Z" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
        <path d="M16 24H48M16 36H40M16 48H32" stroke="rgba(255,255,255,0.3)" stroke-width="3" stroke-linecap="round"/>
      </svg>
      <p>请先上传数据文件</p>
    </div>

    <div v-else class="visualize-content">
      <!-- 图表配置面板 -->
      <div class="config-panel">
        <h3>图表配置</h3>

        <div class="config-row">
          <label>图表类型</label>
          <select v-model="chartType" @change="updateChart">
            <option value="bar">柱状图</option>
            <option value="line">折线图</option>
            <option value="pie">饼图</option>
            <option value="scatter">散点图</option>
            <option value="heatmap">热力图</option>
          </select>
        </div>

        <div class="config-row">
          <label>X轴 / 分类列</label>
          <select v-model="xColumn" @change="updateChart">
            <option value="">选择列</option>
            <option v-for="col in columns" :key="col" :value="col">{{ col }}</option>
          </select>
        </div>

        <div class="config-row">
          <label>Y轴 / 数值列</label>
          <select v-model="yColumn" @change="updateChart">
            <option value="">选择列</option>
            <option v-for="col in numericColumns" :key="col" :value="col">{{ col }}</option>
          </select>
        </div>

        <div class="config-row" v-if="chartType === 'scatter'">
          <label>颜色分组</label>
          <select v-model="colorColumn" @change="updateChart">
            <option value="">无分组</option>
            <option v-for="col in columns" :key="col" :value="col">{{ col }}</option>
          </select>
        </div>

        <button class="export-chart-button" @click="exportChart">
          导出图表
        </button>
      </div>

      <!-- 图表显示区域 -->
      <div class="chart-container">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>加载图表数据中...</p>
        </div>
        <div v-else-if="!xColumn || !yColumn" class="empty-state">
          <p>请选择列以显示图表</p>
        </div>
        <div v-else class="chart-wrapper">
          <div ref="chartRef" class="chart"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import axios from 'axios'
import * as d3 from 'd3'

const props = defineProps({
  filename: String
})

const loading = ref(false)
const chartRef = ref(null)
const columns = ref([])
const numericColumns = ref([])
const chartType = ref('bar')
const xColumn = ref('')
const yColumn = ref('')
const colorColumn = ref('')
const chartData = ref([])

// 监听文件变化
watch(() => props.filename, (newFilename) => {
  if (newFilename) {
    loadColumnInfo()
  }
}, { immediate: true })

// 加载列信息
const loadColumnInfo = async () => {
  if (!props.filename) return

  loading.value = true
  try {
    const response = await axios.post('/api/analyze', {
      filename: props.filename,
      type: 'summary'
    })

    const numericCols = Object.keys(response.data.numeric_stats || {})
    const allCols = Object.keys(response.data.numeric_stats || {}).concat(
      Object.keys(response.data.categorical_stats || {})
    )

    numericColumns.value = numericCols
    columns.value = [...new Set(allCols)]

    // 自动选择列
    if (numericColumns.value.length >= 1) {
      yColumn.value = numericColumns.value[0]
    }
    if (columns.value.length >= 1) {
      xColumn.value = columns.value[0]
    }

    // 加载图表数据
    await loadChartData()

  } catch (error) {
    console.error('加载列信息失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载图表数据
const loadChartData = async () => {
  if (!props.filename) return

  try {
    const response = await axios.get(`/api/data/${props.filename}`, {
      params: {
        page: 1,
        per_page: 1000  // 获取更多数据用于绘图
      }
    })

    chartData.value = response.data.data
    await nextTick()
    renderChart()

  } catch (error) {
    console.error('加载图表数据失败:', error)
  }
}

// 更新图表
const updateChart = async () => {
  if (xColumn.value && yColumn.value) {
    await nextTick()
    renderChart()
  }
}

// 渲染图表
const renderChart = () => {
  if (!chartRef.value || !chartData.value.length) return

  // 清除现有图表
  d3.select(chartRef.value).selectAll('*').remove()

  const data = chartData.value
  const width = chartRef.value.clientWidth || 800
  const height = chartRef.value.clientHeight || 500
  const margin = { top: 40, right: 30, bottom: 60, left: 70 }

  // 根据图表类型渲染
  switch (chartType.value) {
    case 'bar':
      renderBarChart(data, width, height, margin)
      break
    case 'line':
      renderLineChart(data, width, height, margin)
      break
    case 'pie':
      renderPieChart(data, width, height, margin)
      break
    case 'scatter':
      renderScatterChart(data, width, height, margin)
      break
    case 'heatmap':
      renderHeatmap(data, width, height, margin)
      break
  }
}

// 渲染柱状图
const renderBarChart = (data, width, height, margin) => {
  const svg = d3.select(chartRef.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const x = d3.scaleBand()
    .domain(data.map(d => d[xColumn.value]))
    .range([0, innerWidth])
    .padding(0.3)

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => Number(d[yColumn.value]) || 0)])
    .range([innerHeight, 0])

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  // 绘制Y轴
  g.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(y))
    .selectAll('text')
    .style('fill', 'rgba(255,255,255,0.7)')

  // 绘制X轴
  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .style('fill', 'rgba(255,255,255,0.7)')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end')
    .attr('dx', '-8')
    .attr('dy', '8')

  // 绘制柱子
  const gradient = svg.append('defs')
    .append('linearGradient')
    .attr('id', 'barGradient')
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '0%')
    .attr('y2', '100%')

  gradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', '#6366f1')

  gradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', '#8b5cf6')

  g.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d[xColumn.value]))
    .attr('y', d => y(Number(d[yColumn.value]) || 0))
    .attr('width', x.bandwidth())
    .attr('height', d => innerHeight - y(Number(d[yColumn.value]) || 0))
    .attr('fill', 'url(#barGradient)')
    .attr('rx', 4)
    .attr('ry', 4)
    .on('mouseover', function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('fill', '#a5b4fc')
    })
    .on('mouseout', function() {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('fill', 'url(#barGradient)')
    })
}

// 渲染折线图
const renderLineChart = (data, width, height, margin) => {
  const svg = d3.select(chartRef.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const x = d3.scalePoint()
    .domain(data.map(d => d[xColumn.value]))
    .range([0, innerWidth])

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => Number(d[yColumn.value]) || 0)])
    .range([innerHeight, 0])

  const line = d3.line()
    .x(d => x(d[xColumn.value]))
    .y(d => y(Number(d[yColumn.value]) || 0))

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  // 绘制轴
  g.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(y))
    .selectAll('text')
    .style('fill', 'rgba(255,255,255,0.7)')

  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .style('fill', 'rgba(255,255,255,0.7)')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end')
    .attr('dx', '-8')
    .attr('dy', '8')

  // 绘制线
  g.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', '#6366f1')
    .attr('stroke-width', 3)
    .attr('d', line)

  // 绘制点
  g.selectAll('.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('cx', d => x(d[xColumn.value]))
    .attr('cy', d => y(Number(d[yColumn.value]) || 0))
    .attr('r', 6)
    .attr('fill', '#8b5cf6')
    .attr('stroke', '#6366f1')
    .attr('stroke-width', 2)
}

// 渲染饼图
const renderPieChart = (data, width, height, margin) => {
  const svg = d3.select(chartRef.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const radius = Math.min(width, height) / 2 - margin.top

  const g = svg.append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`)

  // 聚合数据
  const pieData = d3.rollup(
    data,
    v => d3.sum(v, d => Number(d[yColumn.value]) || 0),
    d => d[xColumn.value]
  )

  const pie = d3.pie().value(d => d[1])
  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius)

  const color = d3.scaleOrdinal(d3.schemeCategory10)

  g.selectAll('.arc')
    .data(pie(Array.from(pieData.entries())))
    .enter()
    .append('g')
    .attr('class', 'arc')
    .append('path')
    .attr('d', arc)
    .attr('fill', (d, i) => color(i))
    .attr('stroke', 'white')
    .attr('stroke-width', 2)
    .on('mouseover', function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('transform', 'scale(1.05)')
    })
    .on('mouseout', function() {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('transform', 'scale(1)')
    })
}

// 渲染散点图
const renderScatterChart = (data, width, height, margin) => {
  const svg = d3.select(chartRef.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => Number(d[xColumn.value]) || 0))
    .range([0, innerWidth])

  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => Number(d[yColumn.value]) || 0))
    .range([innerHeight, 0])

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  // 绘制轴
  g.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(y))
    .selectAll('text')
    .style('fill', 'rgba(255,255,255,0.7)')

  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .style('fill', 'rgba(255,255,255,0.7)')

  // 绘制点
  g.selectAll('.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('cx', d => x(Number(d[xColumn.value]) || 0))
    .attr('cy', d => y(Number(d[yColumn.value]) || 0))
    .attr('r', 6)
    .attr('fill', '#6366f1')
    .attr('opacity', 0.7)
}

// 渲染热力图
const renderHeatmap = (data, width, height, margin) => {
  const svg = d3.select(chartRef.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // 获取唯一的X和Y值
  const xValues = [...new Set(data.map(d => d[xColumn.value]))]
  const yValues = [...new Set(data.map(d => d[yColumn.value]))]

  const x = d3.scaleBand()
    .domain(xValues)
    .range([0, innerWidth])
    .padding(0.1)

  const y = d3.scaleBand()
    .domain(yValues)
    .range([0, innerHeight])
    .padding(0.1)

  const color = d3.scaleSequential(d3.interpolateInferno)
    .domain([0, d3.max(data, d => Number(d[yColumn.value]) || 0)])

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  g.selectAllRect('.cell')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'cell')
    .attr('x', d => x(d[xColumn.value]))
    .attr('y', d => y(d[yColumn.value]))
    .attr('width', x.bandwidth())
    .attr('height', y.bandwidth())
    .attr('fill', d => color(Number(d[yColumn.value]) || 0))
    .attr('stroke', 'white')
    .attr('stroke-width', 1)
}

// 导出图表
const exportChart = () => {
  const svg = d3.select(chartRef.value).select('svg')
  if (!svg.node()) {
    alert('没有可导出的图表')
    return
  }

  const svgData = new XMLSerializer().serializeToString(svg.node())
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `chart_${chartType.value}.svg`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.visualize-section {
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

.visualize-content {
  display: flex;
  gap: 24px;
}

.config-panel {
  width: 300px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
  flex-shrink: 0;
}

.config-panel h3 {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin-bottom: 20px;
}

.config-row {
  margin-bottom: 20px;
}

.config-row label {
  display: block;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.config-row select {
  width: 100%;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.config-row select option {
  background: #1a1a2e;
}

.export-chart-button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.export-chart-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.chart-container {
  flex: 1;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 20px;
  min-height: 600px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  height: 100%;
  color: rgba(255, 255, 255, 0.5);
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

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.5);
}

.chart-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart {
  width: 100%;
  height: 100%;
}
</style>
