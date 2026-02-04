# 项目改造完成说明

## 改造内容

已成功将原有的静态 HTML 页面改造为 Next.js 全栈项目，主要改造内容如下：

### 1. 技术栈升级
- **前端框架**: 从静态 HTML 升级为 Next.js 15 + React 19
- **类型安全**: 引入 TypeScript 提供完整的类型支持
- **样式方案**: 保留 Tailwind CSS，优化样式实现
- **状态管理**: 使用 React Hooks 管理组件状态

### 2. 后端实现
- **API 路由**: 实现完整的 RESTful API
  - `/api/layers` - 层级管理
  - `/api/categories` - 分类管理
  - `/api/tech-items` - 技术项管理
  - `/api/stats` - 统计数据
- **数据库**: 使用 SQLite 存储数据，支持持久化

### 3. 管理后台
- 新增 `/admin` 管理页面
- 支持技术项的增删改查
- 实时统计数据展示

### 4. 功能保留
- ✅ 原有的技术层级展示
- ✅ 技术状态筛选功能
- ✅ 统计面板
- ✅ 优先级标识
- ✅ 悬浮提示
- ✅ 动画效果

## 项目结构

```
lantu-next/
├── app/                  # Next.js App Router
│   ├── api/             # API 路由
│   ├── admin/           # 管理后台
│   └── page.tsx         # 首页
├── components/          # React 组件
├── lib/                 # 工具库和数据库操作
├── types/               # TypeScript 类型
└── data/                # SQLite 数据库
```

## 使用说明

### 启动项目

1. **安装依赖**:
   ```bash
   npm install
   ```

2. **初始化数据库**:
   ```bash
   npm run seed
   ```

3. **启动开发服务器**:
   ```bash
   npm run dev
   ```

4. 访问:
   - 首页: http://localhost:3001
   - 管理后台: http://localhost:3001/admin

### 管理技术项

#### 方式一：通过管理后台（推荐）
1. 访问 `/admin` 页面
2. 填写表单信息
3. 点击"新增"或"编辑"按钮保存

#### 方式二：通过 API
使用 Postman 或 curl 调用 API 接口：

```bash
# 新增技术项
curl -X POST http://localhost:3001/api/tech-items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "新技术",
    "category_id": 1,
    "status": "active",
    "priority": "high",
    "is_new": 1,
    "description": "描述信息",
    "tags": "frontend",
    "display_order": 1
  }'

# 更新技术项
curl -X PUT http://localhost:3001/api/tech-items \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "name": "更新后的名称",
    "status": "missing"
  }'

# 删除技术项
curl -X DELETE "http://localhost:3001/api/tech-items?id=1"
```

### 数据库操作

#### 查看数据库
```bash
sqlite3 data/techmap.db
```

#### 重置数据库
```bash
rm data/techmap.db
npm run seed
```

## 数据表结构

### layers (层级表)
```sql
CREATE TABLE layers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  icon TEXT,
  display_order INTEGER DEFAULT 0
);
```

### categories (分类表)
```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  icon TEXT,
  layer_id INTEGER NOT NULL,
  display_order INTEGER DEFAULT 0,
  FOREIGN KEY (layer_id) REFERENCES layers(id)
);
```

### tech_items (技术项表)
```sql
CREATE TABLE tech_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('active', 'missing')),
  priority TEXT CHECK(priority IN ('high', 'medium', 'low', '')),
  is_new INTEGER DEFAULT 0,
  description TEXT,
  tags TEXT,
  display_order INTEGER DEFAULT 0,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

## 部署建议

### 本地部署
```bash
npm run build
npm start
```

### 云端部署
- **Vercel**: 需要将 SQLite 替换为 PostgreSQL 或其他云数据库
- **VPS**: 可以直接部署，支持 SQLite
- **Docker**: 可以容器化部署

### 替换为 PostgreSQL
如果需要部署到 Vercel，建议：
1. 安装 `pg` 包
2. 修改 `lib/db.ts` 使用 PostgreSQL 连接
3. 更新环境变量配置

## 功能扩展建议

1. **用户认证**: 为管理后台添加登录功能
2. **批量导入**: 支持 Excel/CSV 批量导入技术项
3. **数据导出**: 导出技术栈报告
4. **历史版本**: 记录技术栈变更历史
5. **评论功能**: 为每个技术项添加评论
6. **图表统计**: 添加更多数据可视化图表

## 注意事项

1. **数据库位置**: 数据库文件位于 `data/techmap.db`，需要定期备份
2. **端口占用**: 如果 3000 端口被占用，会自动使用 3001 端口
3. **SQLite 限制**: SQLite 不支持并发写入，高并发场景建议使用 PostgreSQL

## 文件说明

- `index.html.bak`: 原始 HTML 文件的备份
- `data/techmap.db`: SQLite 数据库文件
- `.next/`: Next.js 构建缓存（可删除）

## 联系方式

如有问题，请查看项目 README.md 或提交 Issue。
