<template>
  <div class="visualize-section">
    <div v-if="!filename" class="no-file">
      <div class="no-file-icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <rect x="8" y="8" width="48" height="48" rx="4" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4"/>
          <path d="M24 40L32 24L40 40" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M40 40L48 28" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <p>请先上传数据文件以开始可视化</p>
    </div>

    <div v-else class="visualize-content">
      <!-- 图表配置面板 -->
      <aside class="config-panel">
        <h3>图表配置</h3>

        <div class="config-group">
          <label>图表类型</label>
          <div class="chart-type-grid">
            <button
              v-for="type in chartTypes"
              :key="type.value"
              :class="['type-btn', { active: chartType === type.value }]"
              @click="chartType = type.value; updateChart()"
            >
              <span class="type-icon" v-html="type.icon"></span>
              <span class="type-label">{{ type.label }}</span>
            </button>
          </div>
        </div>

        <div class="config-group">
          <label>X轴 / 分类列</label>
          <select v-model="xColumn" @change="updateChart">
            <option value="">选择列</option>
            <option v-for="col in columns" :key="col" :value="col">{{ col }}</option>
          </select>
        </div>

        <div class="config-group" v-if="chartType !== 'pie'">
          <label>Y轴 / 数值列</label>
          <select v-model="yColumn" @change="updateChart">
            <option value="">选择列</option>
            <option v-for="col in numericColumns" :key="col" :value="col">{{ col }}</option>
          </select>
        </div>

        <div class="config-group" v-if="chartType === 'scatter'">
          <label>颜色分组</label>
          <select v-model="colorColumn" @change="updateChart">
            <option value="">无分组</option>
            <option v-for="col in columns" :key="col" :value="col">{{ col }}</option>
          </select>
        </div>

        <div class="config-group" v-if="chartType === 'map'">
          <label>地区列</label>
          <select v-model="mapColumn" @change="updateChart">
            <option value="">选择列</option>
            <option v-for="col in columns" :key="col" :value="col">{{ col }}</option>
          </select>
        </div>

        <div class="config-actions">
          <button class="btn btn-primary" @click="exportChart">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 10v3a1 1 0 01-1 1H3a1 1 0 01-1-1v-3M11 5L8 2M8 2L5 5M8 2v9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            导出图表
          </button>
        </div>
      </aside>

      <!-- 图表显示区域 -->
      <main class="chart-container">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <span>加载图表数据中...</span>
        </div>

        <div v-else-if="!xColumn || (!yColumn && chartType !== 'pie')" class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M8 40V20M18 40V8M28 40V16M38 40V24" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            </svg>
          </div>
          <p>请从左侧选择列以显示图表</p>
        </div>

        <div v-else class="chart-wrapper">
          <div ref="chartRef" class="chart"></div>
        </div>
      </main>
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
const mapColumn = ref('')
const chartData = ref([])

// 图表类型选项
const chartTypes = [
  {
    value: 'bar',
    label: '柱状图',
    icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="8" width="4" height="10" rx="1" fill="currentColor"/><rect x="8" y="4" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="6" width="4" height="12" rx="1" fill="currentColor"/></svg>'
  },
  {
    value: 'line',
    label: '折线图',
    icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 16L6 10L10 14L18 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="10" r="1.5" fill="currentColor"/><circle cx="10" cy="14" r="1.5" fill="currentColor"/><circle cx="18" cy="4" r="1.5" fill="currentColor"/></svg>'
  },
  {
    value: 'pie',
    label: '饼图',
    icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2v8h8a8 8 0 01-8 8" stroke="currentColor" stroke-width="2"/><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
  },
  {
    value: 'scatter',
    label: '散点图',
    icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="4" cy="14" r="2" fill="currentColor"/><circle cx="10" cy="8" r="2" fill="currentColor"/><circle cx="16" cy="12" r="2" fill="currentColor"/><circle cx="7" cy="4" r="2" fill="currentColor"/><circle cx="14" cy="6" r="2" fill="currentColor"/></svg>'
  },
  {
    value: 'heatmap',
    label: '热力图',
    icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="6" height="6" rx="1" fill="currentColor" opacity="0.3"/><rect x="10" y="2" width="6" height="6" rx="1" fill="currentColor" opacity="0.6"/><rect x="2" y="10" width="6" height="6" rx="1" fill="currentColor" opacity="0.8"/><rect x="10" y="10" width="6" height="6" rx="1" fill="currentColor"/></svg>'
  },
  {
    value: 'map',
    label: '地图',
    icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="6" cy="8" r="2" fill="currentColor"/><circle cx="14" cy="6" r="2" fill="currentColor"/><circle cx="10" cy="14" r="2" fill="currentColor"/><path d="M6 8L14 6M14 6L10 14M10 14L6 8" stroke="currentColor" stroke-width="1" stroke-dasharray="2 2"/></svg>'
  }
]

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
      mapColumn.value = columns.value[0]
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
        per_page: 1000
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
  if ((xColumn.value && yColumn.value) || chartType.value === 'pie') {
    await nextTick()
    renderChart()
  }
}

// 渲染图表
const renderChart = () => {
  if (!chartRef.value || !chartData.value.length) return

  d3.select(chartRef.value).selectAll('*').remove()

  const data = chartData.value
  const width = chartRef.value.clientWidth || 800
  const height = chartRef.value.clientHeight || 500
  const margin = { top: 40, right: 30, bottom: 60, left: 70 }

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
    case 'map':
      renderMapChart(data, width, height, margin)
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

  // 渐变定义
  const gradient = svg.append('defs')
    .append('linearGradient')
    .attr('id', 'barGradientNew')
    .attr('x1', '0%').attr('y1', '0%')
    .attr('x2', '0%').attr('y2', '100%')

  gradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', '#F5A623')

  gradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', '#D4890F')

  // Y轴
  g.append('g')
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${(d/1000).toFixed(0)}k`))
    .selectAll('text')
    .style('fill', 'var(--color-text-muted)')
    .style('font-size', '11px')

  // X轴
  g.append('g')
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .style('fill', 'var(--color-text-muted)')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end')
    .attr('dx', '-8')
    .attr('dy', '8')

  g.selectAll('.domain, .tick line').style('stroke', 'var(--color-border)')

  // 绘制柱子 (从底部生长动画)
  g.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d[xColumn.value]))
    .attr('y', innerHeight)
    .attr('width', x.bandwidth())
    .attr('height', 0)
    .attr('fill', 'url(#barGradientNew)')
    .attr('rx', 3)
    .transition()
    .duration(600)
    .delay((d, i) => i * 30)
    .ease(d3.easeCubicOut)
    .attr('y', d => y(Number(d[yColumn.value]) || 0))
    .attr('height', d => innerHeight - y(Number(d[yColumn.value]) || 0))

  // 悬停效果
  g.selectAll('.bar')
    .on('mouseover', function() {
      d3.select(this)
        .transition()
        .duration(150)
        .attr('fill', '#FFBE4D')
    })
    .on('mouseout', function() {
      d3.select(this)
        .transition()
        .duration(150)
        .attr('fill', 'url(#barGradientNew)')
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

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  // 网格
  g.append('g')
    .call(d3.axisLeft(y).tickSize(-innerWidth).tickFormat(''))
    .selectAll('line')
    .style('stroke', 'rgba(255,255,255,0.05)')

  g.selectAll('.domain').remove()

  // 渐变区域
  const gradient = svg.append('defs')
    .append('linearGradient')
    .attr('id', 'lineAreaGradient')
    .attr('x1', '0%').attr('y1', '0%')
    .attr('x2', '0%').attr('y2', '100%')

  gradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', 'rgba(245, 166, 35, 0.25)')

  gradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', 'rgba(245, 166, 35, 0)')

  // 区域
  const area = d3.area()
    .x(d => x(d[xColumn.value]))
    .y0(innerHeight)
    .y1(d => y(Number(d[yColumn.value]) || 0))
    .curve(d3.curveMonotoneX)

  g.append('path')
    .datum(data)
    .attr('fill', 'url(#lineAreaGradient)')
    .attr('d', area)

  // 线
  const line = d3.line()
    .x(d => x(d[xColumn.value]))
    .y(d => y(Number(d[yColumn.value]) || 0))
    .curve(d3.curveMonotoneX)

  const path = g.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', '#F5A623')
    .attr('stroke-width', 2.5)
    .attr('d', line)

  // 线条绘制动画
  const pathLength = path.node().getTotalLength()
  path
    .attr('stroke-dasharray', pathLength)
    .attr('stroke-dashoffset', pathLength)
    .transition()
    .duration(1200)
    .ease(d3.easeCubicOut)
    .attr('stroke-dashoffset', 0)

  // 点
  g.selectAll('.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', d => x(d[xColumn.value]))
    .attr('cy', d => y(Number(d[yColumn.value]) || 0))
    .attr('r', 0)
    .attr('fill', '#D4890F')
    .attr('stroke', '#F5A623')
    .attr('stroke-width', 2)
    .transition()
    .duration(400)
    .delay((d, i) => 800 + i * 20)
    .attr('r', 5)

  // 轴
  g.append('g')
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .style('fill', 'var(--color-text-muted)')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end')

  g.append('g')
    .call(d3.axisLeft(y).ticks(5))
    .selectAll('text')
    .style('fill', 'var(--color-text-muted)')

  g.selectAll('.domain, .tick line').style('stroke', 'var(--color-border)')
}

// 渲染饼图
const renderPieChart = (data, width, height, margin) => {
  const svg = d3.select(chartRef.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const radius = Math.min(width, height) / 2 - 60
  const innerRadius = radius * 0.5

  const g = svg.append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`)

  // 聚合数据
  const pieData = d3.rollup(
    data,
    v => d3.sum(v, d => Number(d[yColumn.value]) || 0),
    d => d[xColumn.value]
  )

  const pie = d3.pie().value(d => d[1]).sort(null)
  const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius)

  const color = d3.scaleOrdinal()
    .domain(Array.from(pieData.keys()))
    .range(['#F5A623', '#2DD4BF', '#3B82F6', '#8B5CF6', '#EF4444', '#6B7280'])

  const arcs = g.selectAll('.arc')
    .data(pie(Array.from(pieData.entries())))
    .enter()
    .append('g')
    .attr('class', 'arc')

  arcs.append('path')
    .attr('d', arc)
    .attr('fill', d => color(d.data[0]))
    .attr('stroke', 'var(--color-bg-secondary)')
    .attr('stroke-width', 2)
    .style('opacity', 0)
    .transition()
    .duration(600)
    .delay((d, i) => i * 80)
    .style('opacity', 1)
    .attrTween('d', function(d) {
      const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d)
      return t => arc(interpolate(t))
    })

  // 中心文字
  const total = Array.from(pieData.values()).reduce((a, b) => a + b, 0)

  g.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '-0.2em')
    .style('fill', 'var(--color-text-primary)')
    .style('font-size', '28px')
    .style('font-weight', '300')
    .style('font-variant-numeric', 'tabular-nums')
    .text(`$${(total / 1000000).toFixed(1)}M`)

  g.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '1.5em')
    .style('fill', 'var(--color-text-muted)')
    .style('font-size', '12px')
    .text('总计')
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
    .nice()
    .range([0, innerWidth])

  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => Number(d[yColumn.value]) || 0))
    .nice()
    .range([innerHeight, 0])

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  // 网格
  g.append('g')
    .call(d3.axisLeft(y).tickSize(-innerWidth).tickFormat(''))
    .selectAll('line')
    .style('stroke', 'rgba(255,255,255,0.05)')

  g.selectAll('.domain').remove()

  // 颜色
  const color = d3.scaleOrdinal(d3.schemeCategory10)

  // 点
  g.selectAll('.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', d => x(Number(d[xColumn.value]) || 0))
    .attr('cy', d => y(Number(d[yColumn.value]) || 0))
    .attr('r', 0)
    .attr('fill', d => colorColumn.value ? color(d[colorColumn.value]) : '#F5A623')
    .attr('opacity', 0.7)
    .attr('stroke', 'var(--color-bg-secondary)')
    .attr('stroke-width', 1)
    .transition()
    .duration(500)
    .delay((d, i) => i * 5)
    .attr('r', 6)

  // 轴
  g.append('g')
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .style('fill', 'var(--color-text-muted)')

  g.append('g')
    .call(d3.axisLeft(y))
    .selectAll('text')
    .style('fill', 'var(--color-text-muted)')

  g.selectAll('.domain, .tick line').style('stroke', 'var(--color-border)')
}

// 渲染热力图
const renderHeatmap = (data, width, height, margin) => {
  const svg = d3.select(chartRef.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const xValues = [...new Set(data.map(d => d[xColumn.value]))].slice(0, 20)
  const yValues = [...new Set(data.map(d => d[yColumn.value]))].slice(0, 15)

  const x = d3.scaleBand()
    .domain(xValues)
    .range([0, innerWidth])
    .padding(0.1)

  const y = d3.scaleBand()
    .domain(yValues)
    .range([0, innerHeight])
    .padding(0.1)

  const color = d3.scaleSequential()
    .domain([0, d3.max(data, d => Number(d[yColumn.value]) || 0)])
    .interpolator(d3.interpolateRgbBasis(['#1a1a1a', '#F5A623', '#FFBE4D']))

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  g.selectAll('.cell')
    .data(data.slice(0, 300))
    .enter()
    .append('rect')
    .attr('x', d => x(d[xColumn.value]) || 0)
    .attr('y', d => y(d[yColumn.value]) || 0)
    .attr('width', x.bandwidth())
    .attr('height', y.bandwidth())
    .attr('fill', d => color(Number(d[yColumn.value]) || 0))
    .attr('rx', 3)
    .style('opacity', 0)
    .transition()
    .duration(300)
    .delay((d, i) => i * 3)
    .style('opacity', 1)

  // 轴
  g.append('g')
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .style('fill', 'var(--color-text-muted)')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end')

  g.append('g')
    .call(d3.axisLeft(y))
    .selectAll('text')
    .style('fill', 'var(--color-text-muted)')

  g.selectAll('.domain').remove()
}

// 渲染地图 (模拟)
const renderMapChart = (data, width, height, margin) => {
  const svg = d3.select(chartRef.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  // 模拟中国地图数据
  const cityData = [
    { name: '北京', x: 0.75, y: 0.30, value: 850 + Math.random() * 500 },
    { name: '上海', x: 0.82, y: 0.55, value: 1200 + Math.random() * 500 },
    { name: '广州', x: 0.60, y: 0.75, value: 920 + Math.random() * 500 },
    { name: '深圳', x: 0.63, y: 0.78, value: 780 + Math.random() * 500 },
    { name: '成都', x: 0.40, y: 0.45, value: 540 + Math.random() * 300 },
    { name: '杭州', x: 0.78, y: 0.52, value: 620 + Math.random() * 300 },
    { name: '武汉', x: 0.65, y: 0.48, value: 430 + Math.random() * 300 },
    { name: '西安', x: 0.52, y: 0.38, value: 380 + Math.random() * 200 },
    { name: '南京', x: 0.76, y: 0.50, value: 350 + Math.random() * 200 },
    { name: '重庆', x: 0.45, y: 0.55, value: 420 + Math.random() * 200 }
  ]

  const colorScale = d3.scaleSequential()
    .domain([0, 2000])
    .interpolator(d3.interpolateRgbBasis(['#1a1a1a', '#F5A623', '#FFBE4D']))

  // 背景
  g.append('rect')
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .attr('fill', 'var(--color-bg-tertiary)')
    .attr('rx', 4)

  // 城市点
  g.selectAll('circle')
    .data(cityData)
    .enter()
    .append('circle')
    .attr('cx', d => d.x * innerWidth)
    .attr('cy', d => d.y * innerHeight)
    .attr('r', 0)
    .attr('fill', d => colorScale(d.value))
    .attr('opacity', 0.8)
    .transition()
    .duration(500)
    .delay((d, i) => i * 60)
    .attr('r', d => 10 + (d.value / 2000) * 20)

  // 城市标签
  g.selectAll('.city-label')
    .data(cityData)
    .enter()
    .append('text')
    .attr('x', d => d.x * innerWidth)
    .attr('y', d => d.y * innerHeight + 25)
    .attr('text-anchor', 'middle')
    .style('fill', 'var(--color-text-secondary)')
    .style('font-size', '11px')
    .style('opacity', 0)
    .text(d => `${d.name} $${Math.floor(d.value/10)}k`)
    .transition()
    .duration(300)
    .delay((d, i) => i * 60 + 200)
    .style('opacity', 1)
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
  a.download = `datalens_${chartType.value}_${Date.now()}.svg`
  a.click()

  URL.revokeObjectURL(url)
}

onMounted(() => {
  window.addEventListener('resize', () => {
    if (chartData.value.length) renderChart()
  })
})
</script>

<style scoped>
.visualize-section {
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
  color: var(--color-text-secondary);
}

.visualize-content {
  display: flex;
  gap: var(--space-lg);
}

/* 配置面板 */
.config-panel {
  width: 280px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  flex-shrink: 0;
  height: fit-content;
  position: sticky;
  top: 80px;
}

.config-panel h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--space-lg);
  color: var(--color-text-primary);
}

.config-group {
  margin-bottom: var(--space-lg);
}

.config-group label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  margin-bottom: var(--space-sm);
}

.config-group select {
  width: 100%;
  padding: 10px 36px 10px 12px;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.config-group select:hover {
  border-color: var(--color-border-hover);
}

.config-group select:focus {
  border-color: var(--color-accent-gold);
  outline: none;
  box-shadow: 0 0 0 3px rgba(245, 166, 35, 0.1);
}

.config-group select option {
  background: var(--color-bg-secondary);
}

/* 图表类型选择器 */
.chart-type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-xs);
}

.type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 4px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.type-btn:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.type-btn.active {
  background: var(--color-bg-tertiary);
  border-color: var(--color-accent-gold);
  color: var(--color-accent-gold);
}

.type-icon {
  display: flex;
}

.type-label {
  font-size: 10px;
  white-space: nowrap;
}

.config-actions {
  margin-top: var(--space-xl);
}

.btn {
  width: 100%;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
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

/* 图表容器 */
.chart-container {
  flex: 1;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  min-height: 600px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  height: 100%;
  min-height: 500px;
  color: var(--color-text-muted);
}

.empty-icon {
  opacity: 0.3;
}

.chart-wrapper {
  height: 100%;
  min-height: 500px;
}

.chart {
  width: 100%;
  height: 100%;
}

/* Responsive */
@media (max-width: 900px) {
  .visualize-content {
    flex-direction: column;
  }

  .config-panel {
    width: 100%;
    position: static;
  }

  .chart-type-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>