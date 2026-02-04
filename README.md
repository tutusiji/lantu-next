# 云平台技术蓝图图谱 - Next.js 版本

这是一个使用 Next.js + TypeScript + Tailwind CSS + SQLite 构建的技术栈管理系统。

## 功能特点

- ✅ 使用 Next.js 15 App Router
- ✅ TypeScript 类型安全
- ✅ Tailwind CSS 样式
- ✅ SQLite 数据库存储
- ✅ 完整的 REST API
- ✅ 管理后台界面

## 技术栈

- **前端**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: SQLite (better-sqlite3)

## 项目结构

```
lantu-next/
├── app/
│   ├── api/              # API 路由
│   │   ├── layers/       # 层级 API
│   │   ├── categories/   # 分类 API
│   │   ├── tech-items/   # 技术项 API
│   │   └── stats/        # 统计 API
│   ├── admin/            # 管理后台页面
│   └── page.tsx          # 首页
├── components/           # React 组件
│   ├── TechCard.tsx      # 技术卡片组件
│   ├── FilterBar.tsx     # 筛选栏组件
│   └── StatsPanel.tsx    # 统计面板组件
├── lib/                  # 工具库
│   ├── db.ts             # 数据库操作
│   └── seed.ts           # 数据初始化脚本
├── types/                # TypeScript 类型定义
│   └── index.ts
└── data/                 # SQLite 数据库文件
    └── techmap.db
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 初始化数据库

```bash
npm run seed
```

这会创建数据库表并填充示例数据。

### 3. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 页面说明

### 首页 (/)

展示技术栈蓝图，包含：

- 技术层级展示
- 技术状态筛选
- 统计信息面板
- 优先级标识

### 管理后台 (/admin)

提供后台管理功能：

- 新增技术项
- 编辑技术项
- 删除技术项
- 查看技术项列表

## API 接口

### 层级 (Layers)

- `GET /api/layers` - 获取所有层级
- `POST /api/layers` - 创建新层级

### 分类 (Categories)

- `GET /api/categories` - 获取所有分类
- `POST /api/categories` - 创建新分类

### 技术项 (Tech Items)

- `GET /api/tech-items` - 获取所有技术项
- `POST /api/tech-items` - 创建新技术项
- `PUT /api/tech-items` - 更新技术项
- `DELETE /api/tech-items?id={id}` - 删除技术项

### 统计 (Stats)

- `GET /api/stats` - 获取统计数据

## 数据库结构

### layers (层级表)

- id: INTEGER PRIMARY KEY
- name: TEXT (层级名称)
- icon: TEXT (图标)
- display_order: INTEGER (排序)

### categories (分类表)

- id: INTEGER PRIMARY KEY
- name: TEXT (分类名称)
- icon: TEXT (图标)
- layer_id: INTEGER (所属层级)
- display_order: INTEGER (排序)

### tech_items (技术项表)

- id: INTEGER PRIMARY KEY
- name: TEXT (技术名称)
- category_id: INTEGER (所属分类)
- status: TEXT (状态: active/missing)
- priority: TEXT (优先级: high/medium/low)
- is_new: INTEGER (是否新增)
- description: TEXT (描述)
- tags: TEXT (标签)
- display_order: INTEGER (排序)

## 构建生产版本

```bash
npm run build
npm start
```

## 开发说明

### 添加新的技术项

1. 访问 `/admin` 管理后台
2. 填写表单信息
3. 点击"新增"按钮

### 修改数据库结构

如果需要修改数据库结构：

1. 修改 `lib/db.ts` 中的表结构
2. 删除 `data/techmap.db` 文件
3. 重新运行 `npm run seed`

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 注意：SQLite 不支持 Vercel 的 serverless 环境，需要换成 PostgreSQL 或其他云数据库

### 本地部署

```bash
npm run build
npm start
```

## License

MIT
