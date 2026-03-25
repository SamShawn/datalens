<template>
  <div class="app">
    <!-- 头部导航 -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="6" fill="url(#logoGradient)"/>
            <path d="M8 24L14 8L20 24" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20 24L26 12" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <defs>
              <linearGradient id="logoGradient" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stop-color="#6366f1"/>
                <stop offset="100%" stop-color="#8b5cf6"/>
              </linearGradient>
            </defs>
          </svg>
          <h1>Vizora</h1>
        </div>
        <nav class="nav">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['nav-button', { active: currentTab === tab.id }]"
            @click="currentTab = tab.id"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main">
      <!-- 首页/数据上传 -->
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
import UploadSection from './components/UploadSection.vue'
import DataViewSection from './components/DataViewSection.vue'
import AnalyzeSection from './components/AnalyzeSection.vue'
import VisualizeSection from './components/VisualizeSection.vue'

// 当前激活的标签页
const currentTab = ref('upload')
const currentFile = ref('')

// 导航标签
const tabs = [
  { id: 'upload', name: '数据上传' },
  { id: 'data', name: '数据查看' },
  { id: 'analyze', name: '数据分析' },
  { id: 'visualize', name: '数据可视化' }
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

.header {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo h1 {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav {
  display: flex;
  gap: 8px;
}

.nav-button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.nav-button.active {
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.main {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
}

.section {
  animation: fadeIn 0.5s ease;
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
