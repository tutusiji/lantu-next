import {
  initDb,
  addLayer,
  addCategory,
  addTechItem,
  addUser,
  clearDb,
} from "./db";

// 初始化数据库表
initDb();
// 清空旧数据防止重复
clearDb();

// 1. 添加管理员
addUser("admin", "admin@999");

// 2. 层级定义
const layers = [
  { name: "开发技术层", icon: "💻", display_order: 1 },
  { name: "后端与大数据", icon: "⚙️", display_order: 2 },
  { name: "AI 与数据智能", icon: "🧠", display_order: 3 },
  { name: "基础设施与安全", icon: "🛡️", display_order: 4 },
  { name: "场景解决方案", icon: "💡", display_order: 5 },
];

const layerMap: Record<string, number> = {};
layers.forEach((l) => {
  const result = addLayer(l.name, l.icon, l.display_order);
  layerMap[l.name] = result.lastInsertRowid as number;
});

// 3. 分类定义
const categories = [
  // L1: 开发技术层
  {
    layer: "开发技术层",
    name: "前端基础与框架",
    icon: "languages",
    display_order: 1,
  },
  {
    layer: "开发技术层",
    name: "移动端与跨端",
    icon: "mobile",
    display_order: 2,
  },
  { layer: "开发技术层", name: "前端工程化", icon: "tool", display_order: 3 },
  { layer: "开发技术层", name: "图形与可视化", icon: "vis", display_order: 4 },
  {
    layer: "开发技术层",
    name: "Node.js 生态",
    icon: "terminal",
    display_order: 5,
  },
  { layer: "开发技术层", name: "Python 生态", icon: "code", display_order: 6 },
  { layer: "开发技术层", name: "开发常用数据库", icon: "db", display_order: 7 },

  // L2: 后端与大数据
  {
    layer: "后端与大数据",
    name: "Java生态",
    icon: "Coffee",
    display_order: 1,
  },
  {
    layer: "后端与大数据",
    name: "Go生态",
    icon: "Zap",
    display_order: 2,
  },
  {
    layer: "后端与大数据",
    name: "Rust生态",
    icon: "Shield",
    display_order: 3,
  },
  {
    layer: "后端与大数据",
    name: "微服务与 RPC",
    icon: "cloud",
    display_order: 4,
  },
  {
    layer: "后端与大数据",
    name: "消息队列与中间件",
    icon: "mq",
    display_order: 5,
  },
  { layer: "后端与大数据", name: "大数据处理", icon: "data", display_order: 6 },

  // L3: AI 与数据智能
  {
    layer: "AI 与数据智能",
    name: "机器学习与深度学习",
    icon: "brain",
    display_order: 1,
  },
  {
    layer: "AI 与数据智能",
    name: "大模型与 Agent",
    icon: "sparkles",
    display_order: 2,
  },
  {
    layer: "AI 与数据智能",
    name: "向量与专用存储",
    icon: "storage",
    display_order: 3,
  },

  // L4: 基础设施与安全
  {
    layer: "基础设施与安全",
    name: "云原生与容器",
    icon: "container",
    display_order: 1,
  },
  {
    layer: "基础设施与安全",
    name: "可观测性系统",
    icon: "eye",
    display_order: 2,
  },
  {
    layer: "基础设施与安全",
    name: "安全与质量控制",
    icon: "lock",
    display_order: 3,
  },

  // L5: 场景解决方案
  {
    layer: "场景解决方案",
    name: "Vue3+Java 企业全栈方案",
    icon: JSON.stringify({
      description: "基于 Vue3 + TS + SpringCloud Alibaba 的行业标杆级全栈架构",
      columns: [
        {
          id: "fe_ui",
          name: "前端 UI/移动端",
          icon: "Layout",
          color: "text-blue-400",
          bg: "bg-blue-500/10",
        },
        {
          id: "be_service",
          name: "后端服务治理",
          icon: "Server",
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
        },
        {
          id: "infra_mw",
          name: "中间件与基建",
          icon: "Settings",
          color: "text-purple-400",
          bg: "bg-purple-500/10",
        },
        {
          id: "obs_trace",
          name: "日志监控/全链路追踪",
          icon: "Activity",
          color: "text-pink-400",
          bg: "bg-pink-500/10",
        },
        {
          id: "data_storage",
          name: "存储与大数据",
          icon: "Database",
          color: "text-amber-400",
          bg: "bg-amber-500/10",
        },
      ],
    }),
    display_order: 1,
  },
  {
    layer: "场景解决方案",
    name: "ROS2 机器人操作系统方案",
    icon: JSON.stringify({
      description: "遵循 ROS2 标准架构的移动机器人/自动驾驶开发体系",
      columns: [
        {
          id: "ctrl_panel",
          name: "前端操作面板",
          icon: "Layout",
          color: "text-blue-400",
          bg: "bg-blue-500/10",
        },
        {
          id: "mid_layer",
          name: "数据中间层",
          icon: "Settings",
          color: "text-purple-400",
          bg: "bg-purple-500/10",
        },
        {
          id: "nav_stack",
          name: "核心算法栈",
          icon: "Box",
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
        },
        {
          id: "hw_layer",
          name: "底层硬件层",
          icon: "Cpu",
          color: "text-orange-400",
          bg: "bg-orange-500/10",
        },
        {
          id: "dds_mid",
          name: "通讯中间件",
          icon: "Share2",
          color: "text-pink-400",
          bg: "bg-pink-500/10",
        },
        {
          id: "tool_vis",
          name: "调试与仿真",
          icon: "Server",
          color: "text-slate-400",
          bg: "bg-slate-500/10",
        },
      ],
    }),
    display_order: 2,
  },
  {
    layer: "场景解决方案",
    name: "具身智能系统方案",
    icon: JSON.stringify({
      description: "垂直领域的机器人与 AI 深度融合架构",
      columns: [
        {
          id: "hw",
          name: "计算硬件",
          icon: "Box",
          color: "text-orange-400",
          bg: "bg-orange-500/10",
        },
        {
          id: "ctrl",
          name: "控制层",
          icon: "Settings",
          color: "text-blue-400",
          bg: "bg-blue-500/10",
        },
        {
          id: "vis",
          name: "感知层",
          icon: "Box",
          color: "text-purple-400",
          bg: "bg-purple-500/10",
        },
        {
          id: "cloud",
          name: "云中台",
          icon: "Server",
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
        },
      ],
    }),
    display_order: 3,
  },
];

const catMap: Record<string, number> = {};
categories.forEach((c) => {
  const result = addCategory(
    c.name,
    c.icon,
    layerMap[c.layer],
    c.display_order,
  );
  catMap[c.name] = result.lastInsertRowid as number;
});

// 4. 技术项定义 (真正的全量合并，逻辑上覆盖所有历史更新)
const techItems = [
  // --- 层级 1: 开发技术层 ---
  {
    cat: "前端基础与框架",
    name: "TypeScript",
    status: "active",
    tags: "lang",
    is_new: 1,
  },
  {
    cat: "前端基础与框架",
    name: "React 18",
    status: "active",
    tags: "framework",
    is_new: 0,
  },
  {
    cat: "前端基础与框架",
    name: "Vue 3.4",
    status: "active",
    tags: "framework",
    is_new: 1,
  },
  {
    cat: "前端基础与框架",
    name: "Next.js 14",
    status: "active",
    tags: "framework",
    is_new: 1,
  },
  {
    cat: "前端基础与框架",
    name: "WebAssembly",
    status: "active",
    tags: "lang",
    is_new: 0,
  },

  {
    cat: "移动端与跨端",
    name: "Flutter",
    status: "active",
    tags: "cross",
    is_new: 0,
  },
  {
    cat: "移动端与跨端",
    name: "React Native",
    status: "active",
    tags: "cross",
    is_new: 0,
  },
  {
    cat: "移动端与跨端",
    name: "HarmonyOS Next",
    status: "missing",
    tags: "os",
    is_new: 1,
  },
  {
    cat: "移动端与跨端",
    name: "Uni-app",
    status: "active",
    tags: "cross",
    is_new: 0,
  },

  {
    cat: "前端工程化",
    name: "Vite",
    status: "active",
    tags: "build",
    is_new: 1,
  },
  {
    cat: "前端工程化",
    name: "Turborepo",
    status: "active",
    tags: "mono",
    is_new: 1,
  },
  { cat: "前端工程化", name: "pnpm", status: "active", tags: "pkg", is_new: 0 },
  {
    cat: "前端工程化",
    name: "Webpack 5",
    status: "active",
    tags: "build",
    is_new: 0,
  },

  {
    cat: "图形与可视化",
    name: "WebGL",
    status: "active",
    tags: "graphics",
    is_new: 0,
  },
  {
    cat: "图形与可视化",
    name: "WebGPU",
    status: "active",
    tags: "graphics",
    is_new: 1,
  },
  {
    cat: "图形与可视化",
    name: "Three.js",
    status: "active",
    tags: "3D",
    is_new: 0,
  },
  {
    cat: "图形与可视化",
    name: "Babylon.js",
    status: "active",
    tags: "3D",
    is_new: 0,
  },
  {
    cat: "图形与可视化",
    name: "Cesium",
    status: "active",
    tags: "GIS",
    is_new: 0,
  },
  {
    cat: "图形与可视化",
    name: "ECharts",
    status: "active",
    tags: "Chart",
    is_new: 0,
  },
  {
    cat: "图形与可视化",
    name: "AntV L7",
    status: "active",
    tags: "GIS",
    is_new: 1,
  },

  {
    cat: "Node.js 生态",
    name: "NestJS",
    status: "active",
    tags: "Node",
    is_new: 1,
  },
  {
    cat: "Node.js 生态",
    name: "Express",
    status: "active",
    tags: "Web",
    is_new: 0,
  },
  {
    cat: "Node.js 生态",
    name: "Fastify",
    status: "active",
    tags: "Performance",
    is_new: 0,
  },
  {
    cat: "Node.js 生态",
    name: "Socket.io",
    status: "active",
    tags: "Realtime",
    is_new: 0,
  },

  {
    cat: "Python 生态",
    name: "FastAPI",
    status: "active",
    tags: "Python",
    is_new: 1,
  },
  {
    cat: "Python 生态",
    name: "Django",
    status: "active",
    tags: "Python",
    is_new: 0,
  },
  {
    cat: "Python 生态",
    name: "Flask",
    status: "active",
    tags: "Python",
    is_new: 0,
  },

  {
    cat: "开发常用数据库",
    name: "PostgreSQL",
    status: "active",
    tags: "SQL",
    is_new: 1,
  },
  {
    cat: "开发常用数据库",
    name: "MongoDB",
    status: "active",
    tags: "NoSQL",
    is_new: 0,
  },
  {
    cat: "开发常用数据库",
    name: "Redis",
    status: "active",
    tags: "Cache",
    is_new: 0,
  },
  {
    cat: "开发常用数据库",
    name: "SQLite",
    status: "active",
    tags: "SQL",
    is_new: 0,
  },
  {
    cat: "开发常用数据库",
    name: "MySQL 8.0",
    status: "active",
    tags: "SQL",
    is_new: 0,
  },

  // --- 层级 2: 后端与大数据 ---
  // Java生态
  { cat: "Java生态", name: "Java 21", status: "active", tags: "lang", is_new: 1 },
  { cat: "Java生态", name: "Spring Boot 3.x", status: "active", tags: "framework", is_new: 0 },
  { cat: "Java生态", name: "Spring Cloud", status: "active", tags: "framework", is_new: 0 },
  { cat: "Java生态", name: "MyBatis / Plus", status: "active", tags: "orm", is_new: 0 },
  { cat: "Java生态", name: "Arthas", status: "active", tags: "tool", is_new: 1 },
  { cat: "Java生态", name: "Dubbo", status: "active", tags: "rpc", is_new: 0 },
  { cat: "Java生态", name: "Quarkus", status: "missing", tags: "cloud-native", is_new: 1 },
  { cat: "Java生态", name: "Micronaut", status: "missing", tags: "framework", is_new: 0 },

  // Go生态
  { cat: "Go生态", name: "Go 1.22", status: "active", tags: "lang", is_new: 1 },
  { cat: "Go生态", name: "Gin", status: "active", tags: "framework", is_new: 0 },
  { cat: "Go生态", name: "GORM", status: "active", tags: "orm", is_new: 0 },
  { cat: "Go生态", name: "Go-Zero", status: "active", tags: "framework", is_new: 1 },
  { cat: "Go生态", name: "Kratos", status: "active", tags: "framework", is_new: 0 },
  { cat: "Go生态", name: "Ent", status: "active", tags: "orm", is_new: 1 },
  { cat: "Go生态", name: "Zap", status: "active", tags: "log", is_new: 0 },
  { cat: "Go生态", name: "Fiber", status: "missing", tags: "framework", is_new: 1 },

  // Rust生态
  { cat: "Rust生态", name: "Rust", status: "active", tags: "lang", is_new: 1 },
  { cat: "Rust生态", name: "Tokio", status: "active", tags: "async", is_new: 0 },
  { cat: "Rust生态", name: "Actix Web", status: "active", tags: "framework", is_new: 0 },
  { cat: "Rust生态", name: "Axum", status: "active", tags: "framework", is_new: 1 },
  { cat: "Rust生态", name: "Tauri", status: "active", tags: "desktop", is_new: 1 },
  { cat: "Rust生态", name: "SQLx", status: "active", tags: "db", is_new: 0 },
  { cat: "Rust生态", name: "SeaORM", status: "active", tags: "orm", is_new: 1 },
  { cat: "Rust生态", name: "Diesel", status: "missing", tags: "orm", is_new: 0 },

  // 微服务与 RPC
  { cat: "微服务与 RPC", name: "gRPC", status: "active", tags: "rpc", is_new: 1 },
  { cat: "微服务与 RPC", name: "Istio / Service Mesh", status: "active", tags: "mesh", is_new: 0 },
  { cat: "微服务与 RPC", name: "Nacos", status: "active", tags: "discovery", is_new: 0 },
  { cat: "微服务与 RPC", name: "Sentinel", status: "active", tags: "governance", is_new: 0 },
  { cat: "微服务与 RPC", name: "Dubbo 3.0", status: "active", tags: "rpc", is_new: 1 },
  { cat: "微服务与 RPC", name: "Consul", status: "active", tags: "discovery", is_new: 0 },
  { cat: "微服务与 RPC", name: "Dapr", status: "missing", tags: "runtime", is_new: 1 },

  // 消息队列与中间件
  { cat: "消息队列与中间件", name: "Kafka", status: "active", tags: "mq", is_new: 0 },
  { cat: "消息队列与中间件", name: "RocketMQ", status: "active", tags: "mq", is_new: 0 },
  { cat: "消息队列与中间件", name: "RabbitMQ", status: "active", tags: "mq", is_new: 0 },
  { cat: "消息队列与中间件", name: "Pulsar", status: "missing", tags: "mq", is_new: 1 },
  { cat: "消息队列与中间件", name: "Redis 7.x", status: "active", tags: "cache", is_new: 1 },
  { cat: "消息队列与中间件", name: "Etcd", status: "active", tags: "config", is_new: 0 },
  { cat: "消息队列与中间件", name: "NSQ", status: "active", tags: "mq", is_new: 0 },

  // 大数据处理
  { cat: "大数据处理", name: "Apache Flink", status: "active", tags: "stream", is_new: 0 },
  { cat: "大数据处理", name: "Apache Doris", status: "active", tags: "olap", is_new: 1 },
  { cat: "大数据处理", name: "StarRocks", status: "active", tags: "olap", is_new: 1 },
  { cat: "大数据处理", name: "Spark / Hadoop", status: "active", tags: "batch", is_new: 0 },
  { cat: "大数据处理", name: "ClickHouse", status: "active", tags: "olap", is_new: 0 },
  { cat: "大数据处理", name: "Presto / Trino", status: "active", tags: "query", is_new: 1 },
  { cat: "大数据处理", name: "Iceberg", status: "missing", tags: "lakehouse", is_new: 1 },
  { cat: "大数据处理", name: "Hudi", status: "missing", tags: "lakehouse", is_new: 0 },

  // --- 层级 3: AI 与数据智能 ---
  {
    cat: "机器学习与深度学习",
    name: "PyTorch",
    status: "active",
    tags: "dl",
    is_new: 0,
  },
  {
    cat: "机器学习与深度学习",
    name: "TensorFlow",
    status: "active",
    tags: "dl",
    is_new: 0,
  },

  {
    cat: "大模型与 Agent",
    name: "LangChain",
    status: "active",
    tags: "llm",
    is_new: 1,
  },
  {
    cat: "大模型与 Agent",
    name: "LlamaIndex",
    status: "active",
    tags: "llm",
    is_new: 1,
  },
  {
    cat: "大模型与 Agent",
    name: "Dify",
    status: "active",
    tags: "agent",
    is_new: 1,
  },

  {
    cat: "向量与专用存储",
    name: "Milvus",
    status: "active",
    tags: "vector",
    is_new: 1,
  },
  {
    cat: "向量与专用存储",
    name: "TiDB",
    status: "active",
    tags: "newsql",
    is_new: 0,
  },

  // --- 层级 4: 基础设施与安全 ---
  {
    cat: "云原生与容器",
    name: "Kubernetes",
    status: "active",
    tags: "infra",
    is_new: 0,
  },
  {
    cat: "云原生与容器",
    name: "Terraform",
    status: "active",
    tags: "iac",
    is_new: 1,
  },
  {
    cat: "可观测性系统",
    name: "Prometheus",
    status: "active",
    tags: "metrics",
    is_new: 0,
  },
  {
    cat: "可观测性系统",
    name: "SkyWalking",
    status: "active",
    tags: "tracing",
    is_new: 0,
  },
  {
    cat: "安全与质量控制",
    name: "Zero Trust",
    status: "missing",
    tags: "security",
    is_new: 1,
  },
  {
    cat: "安全与质量控制",
    name: "SonarQube",
    status: "active",
    tags: "quality",
    is_new: 0,
  },

  // --- 层级 5: 场景解决方案 - Vue3+Java 企业全栈方案 ---
  {
    cat: "Vue3+Java 企业全栈方案",
    name: "Vue 3.4 (Composition API)",
    status: "active",
    tags: "fe_ui",
    is_new: 1,
  },
  {
    cat: "Vue3+Java 企业全栈方案",
    name: "Element Plus / Ant Design Vue",
    status: "active",
    tags: "fe_ui",
    is_new: 0,
  },
  {
    cat: "Vue3+Java 企业全栈方案",
    name: "Pinia / Vue Router 4",
    status: "active",
    tags: "fe_ui",
    is_new: 0,
  },
  {
    cat: "Vue3+Java 企业全栈方案",
    name: "Spring Boot 3.2 (Java 21)",
    status: "active",
    tags: "be_service",
    is_new: 1,
  },
  {
    cat: "Vue3+Java 企业全栈方案",
    name: "Spring Cloud Alibaba (Nacos/Sentinel)",
    status: "active",
    tags: "be_service",
    is_new: 0,
  },
  {
    cat: "Vue3+Java 企业全栈方案",
    name: "MyBatis Plus / Sa-Token",
    status: "active",
    tags: "be_service",
    is_new: 1,
  },
  {
    cat: "Vue3+Java 企业全栈方案",
    name: "Redis 7.x Cluster",
    status: "active",
    tags: "infra_mw",
    is_new: 0,
  },
  {
    cat: "Vue3+Java 企业全栈方案",
    name: "Docker + K8s Deployment",
    status: "active",
    tags: "infra_mw",
    is_new: 0,
  },
  // 重点扩充维度: 日志监控与追踪
  {
    cat: "Vue3+Java 企业全栈方案",
    name: "SkyWalking (Tracing)",
    status: "active",
    tags: "obs_trace",
    is_new: 1,
  },
  {
    cat: "Vue3+Java 企业全栈方案",
    name: "ELK Stack (Elastic/Logstash/Kibana)",
    status: "active",
    tags: "obs_trace",
    is_new: 0,
  },
  {
    cat: "Vue3+Java 企业全栈方案",
    name: "Prometheus + Grafana (Metrics)",
    status: "active",
    tags: "obs_trace",
    is_new: 0,
  },
  {
    cat: "Vue3+Java 企业全栈方案",
    name: "Sentry (Frontend Monitor)",
    status: "active",
    tags: "obs_trace",
    is_new: 1,
  },
  {
    cat: "Vue3+Java 企业全栈方案",
    name: "MySQL 8.0 / MinIO",
    status: "active",
    tags: "data_storage",
    is_new: 0,
  },
  {
    cat: "Vue3+Java 企业全栈方案",
    name: "Elasticsearch (Search Engine)",
    status: "active",
    tags: "data_storage",
    is_new: 0,
  },

  // --- 层级 5: ROS2 (丰富维度版本) ---
  // 前端操作面板 (ctrl_panel)
  { cat: "ROS2 机器人操作系统方案", name: "Web Control Dashboard", status: "active", tags: "ctrl_panel", is_new: 1 },
  { cat: "ROS2 机器人操作系统方案", name: "React / Next.js UI", status: "active", tags: "ctrl_panel", is_new: 0 },
  { cat: "ROS2 机器人操作系统方案", name: "React Native Mobile App", status: "active", tags: "ctrl_panel", is_new: 1 },
  { cat: "ROS2 机器人操作系统方案", name: "Three.js 3D View", status: "active", tags: "ctrl_panel", is_new: 0 },

  // 数据中间层 (mid_layer)
  { cat: "ROS2 机器人操作系统方案", name: "Node.js (Koa.js) BFF", status: "active", tags: "mid_layer", is_new: 1 },
  { cat: "ROS2 机器人操作系统方案", name: "Java Data Bridge", status: "active", tags: "mid_layer", is_new: 0 },
  { cat: "ROS2 机器人操作系统方案", name: "WebSocket (Real-time)", status: "active", tags: "mid_layer", is_new: 0 },
  { cat: "ROS2 机器人操作系统方案", name: "gRPC / HTTP2 Stream", status: "active", tags: "mid_layer", is_new: 1 },

  // 核心算法栈 (nav_stack)
  { cat: "ROS2 机器人操作系统方案", name: "Nav2 (Navigation 2)", status: "active", tags: "nav_stack", is_new: 1 },
  { cat: "ROS2 机器人操作系统方案", name: "Cartographer SLAM", status: "active", tags: "nav_stack", is_new: 0 },
  { cat: "ROS2 机器人操作系统方案", name: "BehaviorTree.CPP", status: "active", tags: "nav_stack", is_new: 0 },

  // 底层硬件层 (hw_layer)
  { cat: "ROS2 机器人操作系统方案", name: "C++ 20 (Real-time)", status: "active", tags: "hw_layer", is_new: 1 },
  { cat: "ROS2 机器人操作系统方案", name: "NVIDIA Orin / Jetson", status: "active", tags: "hw_layer", is_new: 0 },
  { cat: "ROS2 机器人操作系统方案", name: "STM32 / ESP32 Firmware", status: "active", tags: "hw_layer", is_new: 0 },
  { cat: "ROS2 机器人操作系统方案", name: "Lidar / IMU Drivers", status: "active", tags: "hw_layer", is_new: 0 },

  // 通讯中间件 (dds_mid)
  { cat: "ROS2 机器人操作系统方案", name: "FastDDS (eProsima)", status: "active", tags: "dds_mid", is_new: 0 },
  { cat: "ROS2 机器人操作系统方案", name: "CycloneDDS", status: "active", tags: "dds_mid", is_new: 0 },
  { cat: "ROS2 机器人操作系统方案", name: "Zenoh Bridge", status: "missing", tags: "dds_mid", is_new: 1 },

  // 调试与仿真 (tool_vis)
  { cat: "ROS2 机器人操作系统方案", name: "Foxglove Studio", status: "active", tags: "tool_vis", is_new: 1 },
  { cat: "ROS2 机器人操作系统方案", name: "Gazebo / Ignition", status: "active", tags: "tool_vis", is_new: 0 },
  { cat: "ROS2 机器人操作系统方案", name: "Rviz2", status: "active", tags: "tool_vis", is_new: 0 },

  // --- 层级 5: 具身智能 (保留) ---
  {
    cat: "具身智能系统方案",
    name: "RK3588",
    status: "active",
    tags: "hw",
    is_new: 1,
  },
  {
    cat: "具身智能系统方案",
    name: "ROS 2 Humble",
    status: "active",
    tags: "ctrl",
    is_new: 1,
  },
  {
    cat: "具身智能系统方案",
    name: "BEV Perception",
    status: "active",
    tags: "vis",
    is_new: 1,
  },
];

techItems.forEach((item, index) => {
  if (!catMap[item.cat]) {
    console.warn(`Category ${item.cat} not found for item ${item.name}`);
    return;
  }
  addTechItem({
    category_id: catMap[item.cat],
    name: item.name,
    status: item.status as "active" | "missing",
    is_new: item.is_new,
    tags: item.tags,
    display_order: index + 1,
  });
});

console.log("【最终决战全量版】数据合并成功！内容覆盖 L1-L5 全部细节。");
