# 多阶段构建 - 基础镜像
# Next.js 16 要求 Node.js >= 20.9.0
FROM node:20-alpine AS base

# 安装依赖阶段
FROM base AS deps
# 使用国内镜像源加速apk安装
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && \
    apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# 复制依赖清单
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# 配置npm镜像源加速
RUN npm config set registry https://registry.npmmirror.com

# 根据存在的锁文件安装依赖
RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && \
    pnpm config set registry https://registry.npmmirror.com && \
    pnpm install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
    npm ci; \
  else \
    echo "未找到锁文件，请在本地生成后再构建" && exit 1; \
  fi

# 构建阶段
FROM base AS builder
WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置环境变量
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# 构建Next.js应用
RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm run build; \
  else \
    npm run build; \
  fi

# 生产运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制必要的文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 复制SQLite数据库
COPY --from=builder /app/data ./data

# 设置数据库文件权限
RUN chown -R nextjs:nodejs ./data

# 切换到非root用户
USER nextjs

# 暴露端口
EXPOSE 4701

ENV PORT=4701
ENV HOSTNAME="0.0.0.0"

# 启动应用
CMD ["node", "server.js"]
