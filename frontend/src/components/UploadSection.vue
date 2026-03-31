<template>
  <div class="upload-section">
    <div class="page-header">
      <h2>数据上传</h2>
      <p>支持 CSV 和 Excel 格式，最大 16MB</p>
    </div>

    <!-- 拖拽上传区域 -->
    <div
      class="upload-zone"
      :class="{ 'dragover': isDragging, 'uploading': uploading }"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".csv,.xlsx,.xls"
        @change="handleFileSelect"
        style="display: none"
      />

      <div v-if="!uploading" class="upload-content">
        <div class="upload-icon">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <path d="M28 6v36M28 6l-12 12M28 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="6" y="38" width="44" height="14" rx="2" stroke="currentColor" stroke-width="2.5"/>
          </svg>
        </div>
        <p class="upload-text">拖拽文件到此处或点击上传</p>
        <button class="btn btn-primary" @click="$refs.fileInput.click()">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          选择文件
        </button>
      </div>

      <div v-else class="uploading-content">
        <div class="spinner"></div>
        <p>正在上传文件...</p>
      </div>
    </div>

    <!-- 文件信息 -->
    <div v-if="fileInfo" class="file-info card">
      <h3>文件信息</h3>
      <div class="info-grid">
        <div class="info-item">
          <label class="label">文件名</label>
          <span class="info-value">{{ fileInfo.filename }}</span>
        </div>
        <div class="info-item">
          <label class="label">数据行数</label>
          <span class="info-value tabular-nums">{{ fileInfo.rows.toLocaleString() }} 行</span>
        </div>
        <div class="info-item">
          <label class="label">列数</label>
          <span class="info-value tabular-nums">{{ fileInfo.columns }} 列</span>
        </div>
      </div>

      <div class="columns-list">
        <h4>列名</h4>
        <div class="columns-tags">
          <span v-for="(col, index) in fileInfo.column_names" :key="index" class="column-tag">
            {{ col }}
          </span>
        </div>
      </div>

      <div class="data-preview">
        <h4>数据预览（前10行）</h4>
        <div class="table-container">
          <table class="preview-table">
            <thead>
              <tr>
                <th v-for="col in fileInfo.column_names" :key="col">{{ col }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in fileInfo.preview" :key="rowIndex">
                <td v-for="col in fileInfo.column_names" :key="col">
                  {{ formatCellValue(row[col]) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-primary" @click="proceedToData">
          查看完整数据
        </button>
      </div>
    </div>

    <!-- 已上传文件列表 -->
    <div class="file-list card">
      <h3>已上传文件</h3>
      <div v-if="uploadedFiles.length > 0" class="files">
        <div v-for="file in uploadedFiles" :key="file.filename" class="file-item">
          <div class="file-item-info">
            <div class="file-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 4h8l4 4v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M12 4v4h4" stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </div>
            <div class="file-details">
              <span class="file-name">{{ file.filename }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
            </div>
          </div>
          <button class="btn btn-ghost delete-button" @click="deleteFile(file.filename)">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M12 4v9a1 1 0 01-1 1H5a1 1 0 01-1-1V4" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            删除
          </button>
        </div>
      </div>
      <p v-else class="empty-message">暂无已上传文件</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const emit = defineEmits(['file-loaded'])

const isDragging = ref(false)
const uploading = ref(false)
const fileInfo = ref(null)
const uploadedFiles = ref([])

// API 基础路径
const API_BASE = '/api'

// 组件挂载时加载文件列表
onMounted(() => {
  loadUploadedFiles()
})

// 加载已上传文件列表
const loadUploadedFiles = async () => {
  try {
    const response = await axios.get(`${API_BASE}/files`)
    uploadedFiles.value = response.data
  } catch (error) {
    console.error('加载文件列表失败:', error)
  }
}

// 处理拖拽进入
const handleDragOver = () => {
  isDragging.value = true
}

// 处理拖拽离开
const handleDragLeave = () => {
  isDragging.value = false
}

// 处理文件拖拽
const handleDrop = (e) => {
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) {
    uploadFile(files[0])
  }
}

// 处理文件选择
const handleFileSelect = (e) => {
  const files = e.target.files
  if (files.length > 0) {
    uploadFile(files[0])
  }
}

// 上传文件
const uploadFile = async (file) => {
  uploading.value = true
  fileInfo.value = null

  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await axios.post(`${API_BASE}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    fileInfo.value = response.data
    await loadUploadedFiles()

  } catch (error) {
    console.error('上传失败:', error)
    alert('上传失败: ' + (error.response?.data?.error || error.message))
  } finally {
    uploading.value = false
  }
}

// 删除文件
const deleteFile = async (filename) => {
  if (!confirm(`确定要删除文件 ${filename} 吗？`)) {
    return
  }

  try {
    await axios.delete(`${API_BASE}/files/${filename}`)
    await loadUploadedFiles()
    if (fileInfo.value?.filename === filename) {
      fileInfo.value = null
    }
  } catch (error) {
    console.error('删除失败:', error)
    alert('删除失败: ' + (error.response?.data?.error || error.message))
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

// 格式化单元格值
const formatCellValue = (value) => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'number') {
    return Number.isInteger(value) ? value : value.toFixed(2)
  }
  return String(value).substring(0, 50)
}

// 继续到数据查看页面
const proceedToData = () => {
  if (fileInfo.value) {
    emit('file-loaded', fileInfo.value.filename)
  }
}
</script>

<style scoped>
.upload-section {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--space-xl);
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

/* 上传区域 */
.upload-zone {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-xl);
  padding: 60px 40px;
  text-align: center;
  background: var(--color-bg-secondary);
  transition: all var(--transition-base);
  margin-bottom: var(--space-xl);
}

.upload-zone.dragover {
  border-color: var(--color-accent-gold);
  background: rgba(245, 166, 35, 0.05);
}

.upload-zone.uploading {
  pointer-events: none;
  opacity: 0.7;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}

.upload-icon {
  color: var(--color-text-muted);
  transition: color var(--transition-base);
}

.upload-zone:hover .upload-icon,
.upload-zone.dragover .upload-icon {
  color: var(--color-accent-gold);
}

.upload-text {
  font-size: 16px;
  color: var(--color-text-secondary);
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: 10px 20px;
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

.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-primary);
}

/* 上传中状态 */
.uploading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
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

/* 文件信息卡片 */
.file-info {
  margin-bottom: var(--space-xl);
}

.file-info h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: var(--space-lg);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.info-value {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
}

/* 列名标签 */
.columns-list {
  margin-bottom: var(--space-lg);
}

.columns-list h4,
.data-preview h4 {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.columns-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.column-tag {
  padding: 6px 12px;
  background: rgba(245, 166, 35, 0.1);
  border: 1px solid rgba(245, 166, 35, 0.2);
  border-radius: var(--radius-sm);
  color: var(--color-accent-gold-light);
  font-size: 12px;
  font-weight: 500;
}

/* 数据预览表格 */
.table-container {
  overflow-x: auto;
  border-radius: var(--radius-md);
  background: var(--color-bg-tertiary);
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.preview-table th {
  background: rgba(245, 166, 35, 0.1);
  color: var(--color-accent-gold);
  padding: 12px;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
  border-bottom: 1px solid var(--color-border);
}

.preview-table td {
  padding: 12px;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  font-variant-numeric: tabular-nums;
}

.preview-table tr:last-child td {
  border-bottom: none;
}

.preview-table tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}

.actions {
  margin-top: var(--space-lg);
}

/* 文件列表 */
.file-list h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--space-md);
}

.files {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.file-item:hover {
  background: var(--color-bg-elevated);
}

.file-item-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.file-icon {
  color: var(--color-text-muted);
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-name {
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 500;
}

.file-size {
  color: var(--color-text-muted);
  font-size: 12px;
}

.delete-button {
  color: var(--color-accent-red);
  font-size: 13px;
}

.delete-button:hover {
  background: rgba(239, 68, 68, 0.1);
}

.empty-message {
  color: var(--color-text-muted);
  text-align: center;
  padding: var(--space-xl);
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .upload-zone {
    padding: 40px 20px;
  }
}
</style>