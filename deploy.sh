#!/bin/bash

# Docker镜像打包和部署脚本
# 用法: ./deploy.sh [版本号]
# 优化说明：
# 1. 使用BuildKit加速构建
# 2. 使用国内镜像源加速依赖下载
# 3. 多阶段构建缓存优化
# 4. 并行构建优化

VERSION=${1:-latest}
IMAGE_NAME="lantu-next"
TAR_FILE="lantu-next-${VERSION}.tar"

# 启用BuildKit加速构建
export DOCKER_BUILDKIT=1

echo "========================================="
echo "Docker镜像打包脚本"
echo "镜像名称: ${IMAGE_NAME}"
echo "版本标签: ${VERSION}"
echo "========================================="

# 1. 构建镜像
echo ""
echo "[1/3] 构建Docker镜像（使用BuildKit加速）..."
echo "优化项：国内镜像源 + 多阶段缓存 + 并行构建"
docker build --progress=plain -t ${IMAGE_NAME}:${VERSION} .

if [ $? -ne 0 ]; then
    echo "❌ 镜像构建失败"
    exit 1
fi

echo "✅ 镜像构建成功"

# 2. 导出镜像为tar文件
echo ""
echo "[2/3] 导出镜像为tar文件..."
docker save -o ${TAR_FILE} ${IMAGE_NAME}:${VERSION}

if [ $? -ne 0 ]; then
    echo "❌ 镜像导出失败"
    exit 1
fi

echo "✅ 镜像已导出到: ${TAR_FILE}"
echo "文件大小: $(du -h ${TAR_FILE} | cut -f1)"

# 显示构建优化建议
echo ""
echo "💡 优化提示："
echo "- 首次构建会较慢，后续构建会利用缓存加速"
echo "- 如需清理缓存重新构建：docker builder prune"
echo "- 镜像已包含国内镜像源配置，服务器部署更快"

# 3. 显示后续步骤
echo ""
echo "========================================="
echo "✅ 打包完成！"
echo "========================================="
echo ""
echo "后续部署步骤："
echo "1. 将 ${TAR_FILE} 上传到服务器"
echo "   scp ${TAR_FILE} user@server:/path/to/upload/"
echo ""
echo "2. 在服务器上加载镜像"
echo "   docker load -i ${TAR_FILE}"
echo ""
echo "3. 运行容器"
echo "   docker run -d -p 4701:3000 \\"
echo "     -v ./data:/app/data \\"
echo "     --name lantu-next-app \\"
echo "     --restart unless-stopped \\"
echo "     ${IMAGE_NAME}:${VERSION}"
echo ""
echo "或使用docker-compose（推荐）："
echo "   修改docker-compose.yml的image字段为: ${IMAGE_NAME}:${VERSION}"
echo "   然后执行: docker-compose up -d"
echo ""
