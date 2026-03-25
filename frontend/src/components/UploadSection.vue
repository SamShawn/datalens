<template>
  <div class="upload-section">
    <div class="container">
      <h2 class="title">上传数据文件</h2>
      <p class="subtitle">支持 CSV 和 Excel 格式，最大 16MB</p>

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
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <path d="M32 8V56M32 8L18 22M32 8L46 22" stroke="#6366f1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="8" y="40" width="48" height="20" rx="4" stroke="#6366f1" stroke-width="3"/>
          </svg>
          <p class="upload-text">拖拽文件到此处或点击上传</p>
          <button class="upload-button" @click="$refs.fileInput.click()">
            选择文件
          </button>
        </div>

        <div v-else class="uploading-content">
          <div class="spinner"></div>
          <p>正在上传文件...</p>
        </div>
      </div>

      <!-- 文件信息 -->
      <div v-if="fileInfo" class="file-info">
        <h3>文件信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>文件名</label>
            <span>{{ fileInfo.filename }}</span>
          </div>
          <div class="info-item">
            <label>数据行数</label>
            <span>{{ fileInfo.rows }} 行</span>
          </div>
          <div class="info-item">
            <label>列数</label>
            <span>{{ fileInfo.columns }} 列</span>
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
          <button class="primary-button" @click="proceedToData">
            查看完整数据
          </button>
        </div>
      </div>

      <!-- 已上传文件列表 -->
      <div class="file-list">
        <h3>已上传文件</h3>
        <div v-if="uploadedFiles.length > 0" class="files">
          <div v-for="file in uploadedFiles" :key="file.filename" class="file-item">
            <div class="file-item-info">
              <span class="file-name">{{ file.filename }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
            </div>
            <button class="delete-button" @click="deleteFile(file.filename)">
              删除
            </button>
          </div>
        </div>
        <p v-else class="empty-message">暂无已上传文件</p>
      </div>
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
  padding: 40px 0;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 32px;
}

/* 上传区域 */
.upload-zone {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.3s ease;
  margin-bottom: 32px;
}

.upload-zone.dragover {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}

.upload-zone.uploading {
  pointer-events: none;
}

.upload-content svg {
  margin-bottom: 20px;
  opacity: 0.8;
}

.upload-text {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 24px;
}

.upload-button {
  padding: 12px 32px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.upload-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.uploading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
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

/* 文件信息 */
.file-info {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
}

.file-info h3 {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item span {
  font-size: 16px;
  font-weight: 500;
  color: white;
}

.columns-list {
  margin-bottom: 24px;
}

.columns-list h4 {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 12px;
}

.columns-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.column-tag {
  padding: 6px 12px;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 6px;
  color: #a5b4fc;
  font-size: 13px;
  font-weight: 500;
}

.data-preview {
  margin-bottom: 24px;
}

.data-preview h4 {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 12px;
}

.table-container {
  overflow-x: auto;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.preview-table th {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  padding: 10px;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
}

.preview-table td {
  padding: 10px;
  color: rgba(255, 255, 255, 0.8);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.preview-table tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}

.actions {
  display: flex;
  gap: 12px;
}

.primary-button {
  padding: 12px 32px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

/* 文件列表 */
.file-list {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
}

.file-list h3 {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin-bottom: 16px;
}

.files {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: background 0.2s ease;
}

.file-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.file-item-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.file-name {
  color: white;
  font-weight: 500;
}

.file-size {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
}

.delete-button {
  padding: 6px 16px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: #fca5a5;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-button:hover {
  background: rgba(239, 68, 68, 0.3);
}

.empty-message {
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  padding: 20px;
}
</style>
