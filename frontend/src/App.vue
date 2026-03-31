<template>
  <div class="app">
    <!-- 头部导航 -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <div class="logo-mark">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="4" fill="url(#logoGradientNew)"/>
              <path d="M7 21L12 7L17 21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M17 21L21 11" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <defs>
                <linearGradient id="logoGradientNew" x1="0" y1="0" x2="28" y2="28">
                  <stop offset="0%" stop-color="#F5A623"/>
                  <stop offset="100%" stop-color="#D4890F"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 class="logo-text">DataLens</h1>
        </div>

        <nav class="nav">
          <button
            v-for="(tab, index) in tabs"
            :key="tab.id"
            :class="['nav-button', { active: currentTab === tab.id }]"
            :style="{ animationDelay: `${index * 50}ms` }"
            @click="currentTab = tab.id"
          >
            <span class="nav-icon" v-html="tab.icon"></span>
            <span class="nav-label">{{ tab.name }}</span>
          </button>
        </nav>

        <div class="header-actions">
          <button class="icon-button" title="通知">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 6.667a5 5 0 00-10 0c0 5.833-2.5 7.5-2.5 7.5h15s-2.5-1.667-2.5-7.5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M11.442 17.5a1.667 1.667 0 01-1.884 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="user-avatar">
            <span>JD</span>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main">
      <!-- 首页/仪表盘 -->
      <section v-if="currentTab === 'dashboard'" class="section">
        <DashboardSection />
      </section>

      <!-- 数据上传 -->
      <section v-if="currentTab === 'upload'" class="section">
        <UploadSection @file-loaded="handleFileLoaded" />
      </section>

      <!-- 数据查看 -->
      <section v-if="currentTab === 'data'" class="section">
        <DataViewSection :filename="currentFile" />
      </section>

      <!-- 数据分析 -->
      <section v-if="currentTab === 'analyze'" class="section">
        <AnalyzeSection :filename="currentFile" />
      </section>

      <!-- 可视化 -->
      <section v-if="currentTab === 'visualize'" class="section">
        <VisualizeSection :filename="currentFile" />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DashboardSection from './components/DashboardSection.vue'
import UploadSection from './components/UploadSection.vue'
import DataViewSection from './components/DataViewSection.vue'
import AnalyzeSection from './components/AnalyzeSection.vue'
import VisualizeSection from './components/VisualizeSection.vue'

// 当前激活的标签页
const currentTab = ref('dashboard')
const currentFile = ref('')

// 导航标签
const tabs = [
  {
    id: 'dashboard',
    name: '仪表盘',
    icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="11" y="1" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="1" y="11" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/></svg>'
  },
  {
    id: 'upload',
    name: '数据上传',
    icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M15 11v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M12 6V2M9 3l-3-3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  },
  {
    id: 'data',
    name: '数据查看',
    icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 3h12v12H3z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 7h12M7 3v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
  },
  {
    id: 'analyze',
    name: '数据分析',
    icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M16 16H2V8l7-5 7 5v8z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 13v3M6 10v6M12 9v7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  },
  {
    id: 'visualize',
    name: '可视化',
    icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 15V9M8 15V3M13 15V7M18 15V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  }
]

// 处理文件加载完成
const handleFileLoaded = (filename) => {
  currentFile.value = filename
  currentTab.value = 'data'
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  background: rgba(13, 13, 13, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
  padding: 12px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-mark {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
}

.nav {
  display: flex;
  gap: 4px;
  background: var(--color-bg-secondary);
  padding: 4px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
  animation: fadeIn 0.3s ease forwards;
  opacity: 0;
}

.nav-button:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-primary);
}

.nav-button.active {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-sm);
}

.nav-icon {
  display: flex;
  opacity: 0.7;
}

.nav-button.active .nav-icon,
.nav-button:hover .nav-icon {
  opacity: 1;
}

.nav-label {
  display: block;
}

@media (max-width: 900px) {
  .nav-label {
    display: none;
  }

  .nav-button {
    padding: 10px 14px;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.icon-button:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--gradient-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-bg-primary);
  cursor: pointer;
  transition: box-shadow var(--transition-base);
}

.user-avatar:hover {
  box-shadow: var(--shadow-glow-gold);
}

/* Main */
.main {
  flex: 1;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  padding: 32px;
}

.section {
  animation: fadeIn 0.4s ease;
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

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }

  .main {
    padding: 16px;
  }

  .logo-text {
    display: none;
  }
}
</style>