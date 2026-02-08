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

打开浏览器访问 [http://localhost:4701](http://localhost:4701)

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

## 内网服务器部署指南

在内网服务器（如 Ubuntu/CentOS）上部署该项目，建议遵循以下步骤：

### 1. 环境准备

- **Node.js**: 推荐 v18.17.0 或更高版本。
- **pnpm/npm**: 建议使用 pnpm 以获得更快的安装速度。
- **PM2**: 用于进程守护，防止应用意外退出。

### 2. 代码部署与安装

```bash
# 进入项目目录
cd /path/to/lantu-next

# 安装依赖
pnpm install

# 初始化数据 (如果是首次部署)
pnpm run seed
```

### 3. 构建与启动

```bash
# 执行构建
pnpm run build

# 启动服务 (默认端口 4701)
pnpm run start
```

### 4. 使用 PM2 进行进程管理

建议使用 PM2 启动应用，并配置端口：

```bash
# 使用 PM2 启动项目，指定名称和端口
pm2 start npm --name "lantu-next" -- start -- -p 4701

# 设置开机自启
pm2 save
pm2 startup
```

### 5. Nginx 反向代理配置 (可选但推荐)

如果需要通过域名或 80 端口访问，建议配置 Nginx：

```nginx
server {
    listen 80;
    server_name your.internal.ip;

    location / {
        proxy_pass http://127.0.0.1:4701;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. 注意事项

- **数据库权限**: 请确保运行应用的用户对 `data/` 目录及 `data/techmap.db` 文件具有读写权限。
- **端口冲突**: 项目默认使用 `4701` 端口，如需更改，请在 `package.json` 或 PM2 启动参数中修改。
- **静态资源**: `public/` 目录下的资源在构建后会自动处理，无需额外配置。

## License

MIT


# 1. 本地重新构建镜像（包含刚才的错误日志修复）
.\deploy.ps1

# 2. 上传新镜像到服务器后，在服务器执行：
docker load -i lantu-next-latest.tar

# 3. 停止旧容器
docker-compose down

# 4. 启动新容器并查看详细日志
docker-compose up -d
docker-compose logs -f



docker run -d -p 4701:4701 \
  -v ./data:/app/data \
  --name lantu-next-app \
  --restart unless-stopped \
  lantu-next:latest



本地打包：
.\deploy.ps1

服务器首次部署：
# 1. 上传文件
scp lantu-next-latest.tar docker-compose.yml root@server:/var/www/lantu/

# 2. 加载镜像
docker load -i lantu-next-latest.tar

# 3. 复制数据并设置权限
docker run --rm --user root -v ./data:/backup lantu-next:latest sh -c 'cp -r /app/data/* /backup/ && chown -R 1001:1001 /backup'

# 4. 启动
docker-compose up -d



后续更新：
# 1. 停止
docker-compose down

# 2. 加载新镜像
docker load -i lantu-next-new.tar

# 3. 启动（数据保留）
docker-compose up -d


# 5. 查看日志确认
docker-compose logs -f


关键点：
chown -R 1001:1001 - 设置为nextjs用户(uid=1001, gid=1001)
这样容器内的nextjs用户就有权限读写数据库了