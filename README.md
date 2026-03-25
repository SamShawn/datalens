# Vizora - 数据分析可视化工具

一个功能完整的数据分析可视化工具，支持多种图表类型、数据过滤和导出功能。

## 技术栈

- **后端**: Python + Flask + Pandas
- **前端**: Vue.js 3 + D3.js + Vite
- **数据格式**: CSV、Excel (xlsx, xls)

## 核心功能

1. **数据上传**: 支持拖拽上传 CSV/Excel 文件
2. **数据查看**: 分页浏览数据、支持数据过滤
3. **数据分析**: 统计信息、相关性分析、分布统计
4. **数据可视化**: 柱状图、折线图、饼图、散点图、热力图
5. **数据导出**: 导出处理后的数据、导出图表图片

## 项目结构

```
vizora/
├── backend/                 # 后端服务
│   ├── app.py              # Flask 应用主文件
│   └── requirements.txt    # Python 依赖
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── main.js         # 应用入口
│   │   ├── App.vue         # 主组件
│   │   └── components/     # 子组件
│   │       ├── UploadSection.vue      # 上传组件
│   │       ├── DataViewSection.vue   # 数据查看组件
│   │       ├── FilterPanel.vue       # 过滤面板
│   │       ├── AnalyzeSection.vue    # 分析组件
│   │       └── VisualizeSection.vue  # 可视化组件
│   ├── index.html         # HTML 入口
│   ├── vite.config.js      # Vite 配置
│   └── package.json        # npm 依赖
├── data/                   # 数据存储目录
└── README.md              # 项目说明文档
```

## 安装与运行

### 1. 克隆项目

```bash
cd vizora
```

### 2. 安装后端依赖

```bash
# 进入后端目录
cd backend

# 创建虚拟环境（推荐）
python3 -m venv venv

# 激活虚拟环境
# macOS/Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

### 3. 启动后端服务

```bash
# 在 backend 目录下
python app.py
```

后端服务将在 http://localhost:5002 启动

### 4. 安装前端依赖

```bash
# 进入前端目录
cd ../frontend

# 安装依赖
npm install
```

### 5. 启动前端服务

```bash
# 在 frontend 目录下
npm run dev
```

前端服务将在 http://localhost:3000 启动

## 使用说明

### 1. 上传数据

- 访问 http://localhost:3000
- 点击"数据上传"标签页
- 拖拽文件到上传区域或点击"选择文件"按钮
- 支持的格式: CSV、Excel (.xlsx, .xls)

### 2. 查看数据

- 上传完成后会自动跳转到"数据查看"页面
- 使用分页控件浏览数据
- 使用"数据过滤"面板添加过滤条件
- 点击"导出数据"下载数据

### 3. 分析数据

- 点击"数据分析"标签页
- 查看数值统计信息
- 查看分类统计信息
- 查看相关性矩阵

### 4. 可视化数据

- 点击"数据可视化"标签页
- 选择图表类型（柱状图、折线图、饼图、散点图、热力图）
- 选择 X 轴列和 Y 轴列
- 图表会自动渲染
- 点击"导出图表"下载 SVG 图片

## API 接口文档

### 上传文件

```
POST /api/upload
Content-Type: multipart/form-data

Body: file (file)

Response: {
  "filename": string,
  "rows": number,
  "columns": number,
  "column_names": string[],
  "column_types": object,
  "preview": object[],
  "missing_values": object
}
```

### 获取数据

```
GET /api/data/:filename?page=1&per_page=50

Response: {
  "total": number,
  "page": number,
  "per_page": number,
  "total_pages": number,
  "data": object[]
}
```

### 数据处理

```
POST /api/process

Body: {
  "filename": string,
  "operations": Array<{
    "type": "filter" | "fill_na" | "drop_na" | "sort" | "select_columns",
    ...
  }>
}

Response: {
  "total": number,
  "columns": string[],
  "data": object[]
}
```

### 数据分析

```
POST /api/analyze

Body: {
  "filename": string,
  "type": "summary" | "correlation" | "distributions"
}

Response: {
  "numeric_stats": object,
  "categorical_stats": object,
  "correlation": object
}
```

### 导出数据

```
POST /api/export

Body: {
  "filename": string,
  "operations": object[],
  "format": "csv" | "xlsx"
}

Response: file (download)
```

## 开发说明

### 后端开发

- 使用 Flask 框架
- Pandas 处理数据
- 支持的操作: 过滤、缺失值处理、排序、列选择

### 前端开发

- 使用 Vue 3 Composition API
- D3.js 用于数据可视化
- 响应式设计，支持移动端

### 添加新功能

1. 后端: 在 `backend/app.py` 中添加新的路由
2. 前端: 在 `frontend/src/components/` 中创建新组件
3. 在 `App.vue` 中添加导航标签

## 常见问题

### Q: 上传文件失败
A: 检查文件格式是否正确，确保文件大小不超过 16MB

### Q: 图表不显示
A: 确保选择了正确的 X 轴和 Y 轴列

### Q: 导出失败
A: 检查浏览器下载权限设置

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request
