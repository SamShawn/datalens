<template>
  <div class="dashboard">
    <!-- 控制栏 -->
    <div class="controls">
      <div class="page-header">
        <h2>仪表盘</h2>
        <p>业务数据实时概览</p>
      </div>

      <div class="time-selector">
        <button
          v-for="period in periods"
          :key="period.value"
          :class="['period-btn', { active: selectedPeriod === period.value }]"
          @click="selectedPeriod = period.value"
        >
          {{ period.label }}
        </button>
      </div>
    </div>

    <!-- KPI 卡片 -->
    <div class="kpi-grid">
      <KpiCard
        v-for="(kpi, index) in kpis"
        :key="kpi.label"
        v-bind="kpi"
        :style="{ animationDelay: `${index * 100}ms` }"
        class="animate-fade-in"
      />
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 主图表：销售趋势 -->
      <div class="chart-card main-chart">
        <div class="chart-header">
          <h3>销售趋势</h3>
          <div class="chart-legend">
            <span class="legend-item">
              <span class="legend-dot gold"></span>
              销售额
            </span>
            <span class="legend-item">
              <span class="legend-dot teal"></span>
              订单量
            </span>
          </div>
        </div>
        <div class="chart-body" ref="trendChartRef"></div>
      </div>

      <!-- 次要图表：类别分布 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>类别分布</h3>
        </div>
        <div class="chart-body" ref="pieChartRef"></div>
      </div>

      <!-- 地图可视化 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>地区分布</h3>
        </div>
        <div class="chart-body map-body" ref="mapChartRef">
          <div class="map-placeholder" v-if="!mapLoaded">
            <div class="spinner"></div>
            <span>加载地图数据...</span>
          </div>
        </div>
      </div>

      <!-- 热力图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>时段分析</h3>
        </div>
        <div class="chart-body" ref="heatmapChartRef"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import * as d3 from 'd3'
import KpiCard from './KpiCard.vue'

// 时间周期选择
const periods = [
  { label: '7天', value: '7d' },
  { label: '30天', value: '30d' },
  { label: '90天', value: '90d' },
  { label: '今年', value: 'year' }
]
const selectedPeriod = ref('30d')

// KPI 数据
const kpis = ref([
  { label: '总销售额', value: 2847593, trend: 12.5, format: 'currency' },
  { label: '活跃用户', value: 128429, trend: 8.2 },
  { label: '转化率', value: 3.24, trend: -1.1, format: 'percent' },
  { label: '客单价', value: 892, trend: 5.7, format: 'currency' }
])

// 图表引用
const trendChartRef = ref(null)
const pieChartRef = ref(null)
const mapChartRef = ref(null)
const heatmapChartRef = ref(null)
const mapLoaded = ref(false)

// 模拟数据
const generateTrendData = () => {
  const days = selectedPeriod.value === '7d' ? 7 : selectedPeriod.value === '30d' ? 30 : selectedPeriod.value === '90d' ? 90 : 12
  const data = []
  const baseDate = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() - i)

    data.push({
      date: date.toISOString().split('T')[0],
      sales: Math.floor(50000 + Math.random() * 80000 + Math.sin(i / 5) * 20000),
      orders: Math.floor(100 + Math.random() * 200 + Math.sin(i / 5) * 50)
    })
  }

  return data
}

const generateCategoryData = () => [
  { name: '电子产品', value: 35 },
  { name: '服装', value: 25 },
  { name: '食品', value: 20 },
  { name: '家居', value: 12 },
  { name: '其他', value: 8 }
]

const generateHeatmapData = () => {
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const data = []

  days.forEach((day, dayIndex) => {
    hours.forEach((hour, hourIndex) => {
      let base = 20
      if (dayIndex >= 5) base = 40 // 周末更高
      if (hourIndex >= 9 && hourIndex <= 21) base += 30 // 工作时间
      if (hourIndex >= 18 && hourIndex <= 21) base += 20 // 晚高峰

      data.push({
        day,
        hour,
        value: Math.floor(base + Math.random() * 40)
      })
    })
  })

  return { hours, days, data }
}

// 渲染销售趋势图
const renderTrendChart = () => {
  if (!trendChartRef.value) return

  const container = trendChartRef.value
  d3.select(container).selectAll('*').remove()

  const data = generateTrendData()
  const width = container.clientWidth || 600
  const height = 300
  const margin = { top: 20, right: 30, bottom: 40, left: 60 }

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  // X 轴
  const x = d3.scaleTime()
    .domain(d3.extent(data, d => new Date(d.date)))
    .range([0, innerWidth])

  // Y 轴 (销售额)
  const ySales = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.sales) * 1.1])
    .range([innerHeight, 0])

  // Y 轴 (订单量)
  const yOrders = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.orders) * 1.1])
    .range([innerHeight, 0])

  // 网格线
  g.append('g')
    .attr('class', 'grid')
    .call(d3.axisLeft(ySales).tickSize(-innerWidth).tickFormat(''))
    .selectAll('line')
    .style('stroke', 'rgba(255,255,255,0.05)')

  g.selectAll('.grid .domain').remove()

  // 销售额区域填充
  const areaSales = d3.area()
    .x(d => x(new Date(d.date)))
    .y0(innerHeight)
    .y1(d => ySales(d.sales))
    .curve(d3.curveMonotoneX)

  // 创建渐变
  const gradient = svg.append('defs')
    .append('linearGradient')
    .attr('id', 'salesGradient')
    .attr('x1', '0%').attr('y1', '0%')
    .attr('x2', '0%').attr('y2', '100%')

  gradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', 'rgba(245, 166, 35, 0.3)')

  gradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', 'rgba(245, 166, 35, 0)')

  g.append('path')
    .datum(data)
    .attr('fill', 'url(#salesGradient)')
    .attr('d', areaSales)

  // 销售额线
  const lineSales = d3.line()
    .x(d => x(new Date(d.date)))
    .y(d => ySales(d.sales))
    .curve(d3.curveMonotoneX)

  const pathSales = g.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', '#F5A623')
    .attr('stroke-width', 2.5)
    .attr('d', lineSales)

  // 线条动画
  const pathLength = pathSales.node().getTotalLength()
  pathSales
    .attr('stroke-dasharray', pathLength)
    .attr('stroke-dashoffset', pathLength)
    .transition()
    .duration(1500)
    .ease(d3.easeCubicOut)
    .attr('stroke-dashoffset', 0)

  // 订单量线
  const lineOrders = d3.line()
    .x(d => x(new Date(d.date)))
    .y(d => yOrders(d.orders))
    .curve(d3.curveMonotoneX)

  g.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', '#2DD4BF')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '4,4')
    .attr('d', lineOrders)

  // X 轴
  g.append('g')
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat('%m/%d')))
    .selectAll('text')
    .style('fill', 'var(--color-text-muted)')
    .style('font-size', '11px')

  g.selectAll('.domain, .tick line').style('stroke', 'var(--color-border)')

  // Y 轴
  g.append('g')
    .call(d3.axisLeft(ySales).ticks(5).tickFormat(d => `$${d/1000}k`))
    .selectAll('text')
    .style('fill', 'var(--color-text-muted)')
    .style('font-size', '11px')
}

// 渲染饼图
const renderPieChart = () => {
  if (!pieChartRef.value) return

  const container = pieChartRef.value
  d3.select(container).selectAll('*').remove()

  const data = generateCategoryData()
  const width = container.clientWidth || 300
  const height = 250
  const radius = Math.min(width, height) / 2 - 20

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const g = svg.append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`)

  const color = d3.scaleOrdinal()
    .domain(data.map(d => d.name))
    .range(['#F5A623', '#2DD4BF', '#3B82F6', '#8B5CF6', '#6B7280'])

  const pie = d3.pie().value(d => d.value).sort(null)
  const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius)

  const arcs = g.selectAll('.arc')
    .data(pie(data))
    .enter()
    .append('g')
    .attr('class', 'arc')

  arcs.append('path')
    .attr('d', arc)
    .attr('fill', d => color(d.data.name))
    .attr('stroke', 'var(--color-bg-secondary)')
    .attr('stroke-width', 2)
    .style('opacity', 0)
    .transition()
    .duration(800)
    .delay((d, i) => i * 100)
    .style('opacity', 1)

  // 中心文字
  g.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '-0.2em')
    .style('fill', 'var(--color-text-primary)')
    .style('font-size', '24px')
    .style('font-weight', '300')
    .text('$2.8M')

  g.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '1.2em')
    .style('fill', 'var(--color-text-muted)')
    .style('font-size', '12px')
    .text('总销售额')
}

// 渲染热力图
const renderHeatmapChart = () => {
  if (!heatmapChartRef.value) return

  const container = heatmapChartRef.value
  d3.select(container).selectAll('*').remove()

  const { hours, days, data } = generateHeatmapData()
  const width = container.clientWidth || 400
  const height = 200
  const margin = { top: 20, right: 20, bottom: 30, left: 40 }

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  const x = d3.scaleBand()
    .domain(hours.filter((_, i) => i % 3 === 0))
    .range([0, innerWidth])
    .padding(0.05)

  const y = d3.scaleBand()
    .domain(days)
    .range([0, innerHeight])
    .padding(0.05)

  const color = d3.scaleSequential()
    .domain([0, 100])
    .interpolator(d3.interpolateRgbBasis(['#1a1a1a', '#F5A623', '#FFBE4D']))

  // 绘制格子
  g.selectAll('.cell')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', d => x(d.hour))
    .attr('y', d => y(d.day))
    .attr('width', x.bandwidth())
    .attr('height', y.bandwidth())
    .attr('fill', d => color(d.value))
    .attr('rx', 2)
    .style('opacity', 0)
    .transition()
    .duration(500)
    .delay((d, i) => i * 2)
    .style('opacity', 1)

  // X 轴
  g.append('g')
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x).tickSize(0))
    .selectAll('text')
    .style('fill', 'var(--color-text-muted)')
    .style('font-size', '10px')

  g.selectAll('.domain').remove()

  // Y 轴
  g.append('g')
    .call(d3.axisLeft(y).tickSize(0))
    .selectAll('text')
    .style('fill', 'var(--color-text-muted)')
    .style('font-size', '10px')
}

// 渲染地图 (简化版)
const renderMapChart = async () => {
  if (!mapChartRef.value) return

  mapLoaded.value = false
  const container = mapChartRef.value
  d3.select(container).selectAll('*').remove()

  const width = container.clientWidth || 400
  const height = 200

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  // 模拟地图数据 - 中国主要城市
  const cityData = [
    { name: '北京', x: 0.75, y: 0.35, value: 850 },
    { name: '上海', x: 0.82, y: 0.55, value: 1200 },
    { name: '广州', x: 0.65, y: 0.75, value: 920 },
    { name: '深圳', x: 0.68, y: 0.78, value: 780 },
    { name: '成都', x: 0.45, y: 0.45, value: 540 },
    { name: '杭州', x: 0.78, y: 0.52, value: 620 },
    { name: '武汉', x: 0.65, y: 0.48, value: 430 },
    { name: '西安', x: 0.52, y: 0.38, value: 380 }
  ]

  const colorScale = d3.scaleSequential()
    .domain([0, 1500])
    .interpolator(d3.interpolateRgbBasis(['#1a1a1a', '#F5A623', '#FFBE4D']))

  // 绘制背景
  svg.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'var(--color-bg-tertiary)')
    .attr('rx', 4)

  // 绘制城市点
  const g = svg.append('g')

  g.selectAll('circle')
    .data(cityData)
    .enter()
    .append('circle')
    .attr('cx', d => d.x * width)
    .attr('cy', d => d.y * height)
    .attr('r', 0)
    .attr('fill', d => colorScale(d.value))
    .attr('opacity', 0.8)
    .transition()
    .duration(600)
    .delay((d, i) => i * 80)
    .attr('r', d => 8 + (d.value / 1500) * 16)

  // 城市标签
  g.selectAll('text')
    .data(cityData)
    .enter()
    .append('text')
    .attr('x', d => d.x * width)
    .attr('y', d => d.y * height + 25)
    .attr('text-anchor', 'middle')
    .style('fill', 'var(--color-text-secondary)')
    .style('font-size', '10px')
    .style('opacity', 0)
    .text(d => d.name)
    .transition()
    .duration(400)
    .delay((d, i) => i * 80 + 300)
    .style('opacity', 1)

  mapLoaded.value = true
}

// 监听时间周期变化
watch(selectedPeriod, () => {
  nextTick(() => {
    renderTrendChart()
  })
})

onMounted(() => {
  nextTick(() => {
    renderTrendChart()
    renderPieChart()
    renderHeatmapChart()
    renderMapChart()
  })

  // 响应式重绘
  window.addEventListener('resize', () => {
    renderTrendChart()
    renderPieChart()
    renderHeatmapChart()
    renderMapChart()
  })
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

/* 控制栏 */
.controls {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: var(--space-md);
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

.time-selector {
  display: flex;
  gap: 4px;
  background: var(--color-bg-secondary);
  padding: 4px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.period-btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.period-btn:hover {
  color: var(--color-text-primary);
}

.period-btn.active {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

/* KPI 网格 */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
}

@media (max-width: 1200px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}

/* 图表网格 */
.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto auto;
  gap: var(--space-md);
}

.main-chart {
  grid-column: 1 / -1;
}

@media (max-width: 1000px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

/* 图表卡片 */
.chart-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  min-height: 280px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.chart-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.chart-legend {
  display: flex;
  gap: var(--space-md);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-dot.gold { background: #F5A623; }
.legend-dot.teal { background: #2DD4BF; }

.chart-body {
  width: 100%;
  min-height: 240px;
}

.map-body {
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  color: var(--color-text-muted);
  font-size: 13px;
}

/* 动画 */
.animate-fade-in {
  opacity: 0;
  animation: fadeIn 0.4s ease forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>