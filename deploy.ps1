# Docker镜像打包和部署脚本 (Windows PowerShell版本)
# 用法: .\deploy.ps1 [版本号]
# 优化说明：
# 1. 使用BuildKit加速构建
# 2. 使用国内镜像源加速依赖下载
# 3. 多阶段构建缓存优化
# 4. 并行构建优化

param(
    [string]$Version = "latest"
)

$ImageName = "lantu-next"
$TarFile = "lantu-next-$Version.tar"

# 启用BuildKit加速构建
$env:DOCKER_BUILDKIT = 1

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Docker镜像打包脚本" -ForegroundColor Cyan
Write-Host "镜像名称: $ImageName" -ForegroundColor Cyan
Write-Host "版本标签: $Version" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 0. 检查并拉取基础镜像（使用国内镜像源）
Write-Host ""
Write-Host "[0/4] 检查基础镜像..." -ForegroundColor Yellow

$BaseImage = "node:20-alpine"
$ImageExists = docker images -q $BaseImage

if (-not $ImageExists) {
    Write-Host "基础镜像不存在，从阿里云镜像源拉取..." -ForegroundColor Yellow
    Write-Host "提示：如果拉取失败，请配置Docker镜像源或手动下载" -ForegroundColor Gray
    
    # 尝试从阿里云拉取
    docker pull registry.cn-hangzhou.aliyuncs.com/library/node:20-alpine
    
    if ($LASTEXITCODE -eq 0) {
        # 重新打标签
        docker tag registry.cn-hangzhou.aliyuncs.com/library/node:20-alpine $BaseImage
        Write-Host "✅ 基础镜像准备完成" -ForegroundColor Green
    } else {
        Write-Host "⚠️  从阿里云拉取失败，尝试官方源..." -ForegroundColor Yellow
        docker pull $BaseImage
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ 基础镜像拉取失败" -ForegroundColor Red
            Write-Host "" 
            Write-Host "解决方案：" -ForegroundColor Yellow
            Write-Host "1. 配置Docker国内镜像源（推荐）" -ForegroundColor White
            Write-Host "   打开Docker Desktop -> Settings -> Docker Engine" -ForegroundColor Gray
            Write-Host "   添加以下配置：" -ForegroundColor Gray
            Write-Host '   "registry-mirrors": ["https://docker.mirrors.ustc.edu.cn"]' -ForegroundColor Gray
            Write-Host ""
            Write-Host "2. 或手动下载镜像后重试" -ForegroundColor White
            exit 1
        }
    }
} else {
    Write-Host "✅ 基础镜像已存在" -ForegroundColor Green
}

# 1. 构建镜像（使用BuildKit优化）
Write-Host ""
Write-Host "[1/4] 构建Docker镜像（使用BuildKit加速）..." -ForegroundColor Yellow
Write-Host "优化项：国内镜像源 + 多阶段缓存 + 并行构建" -ForegroundColor Gray
docker build --progress=plain -t "${ImageName}:${Version}" .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 镜像构建失败" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 镜像构建成功" -ForegroundColor Green

# 2. 导出镜像为tar文件
Write-Host ""
Write-Host "[2/4] 导出镜像为tar文件..." -ForegroundColor Yellow
Write-Host "提示：导出速度取决于镜像大小和磁盘性能" -ForegroundColor Gray
docker save -o $TarFile "${ImageName}:${Version}"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 镜像导出失败" -ForegroundColor Red
    exit 1
}

$FileSize = (Get-Item $TarFile).Length / 1MB
Write-Host "✅ 镜像已导出到: $TarFile" -ForegroundColor Green
Write-Host "文件大小: $([math]::Round($FileSize, 2)) MB" -ForegroundColor Green

# 显示构建优化建议
Write-Host ""
Write-Host "💡 优化提示：" -ForegroundColor Cyan
Write-Host "- 首次构建会较慢，后续构建会利用缓存加速" -ForegroundColor Gray
Write-Host "- 如需清理缓存重新构建：docker builder prune" -ForegroundColor Gray
Write-Host "- 镜像已包含国内镜像源配置，服务器部署更快" -ForegroundColor Gray

# 3. 显示后续步骤
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ 打包完成！" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "后续部署步骤：" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 将镜像文件上传到服务器" -ForegroundColor White
Write-Host "   使用WinSCP、FileZilla或命令：" -ForegroundColor Gray
Write-Host "   scp $TarFile user@server:/path/to/upload/" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 在服务器上加载镜像" -ForegroundColor White
Write-Host "   docker load -i $TarFile" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 上传docker-compose.yml到服务器（重要！）" -ForegroundColor White
Write-Host "   确保与docker-compose.yml在同一目录" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 首次部署：从镜像复制数据" -ForegroundColor White
Write-Host "   docker run --rm --user root -v ./data:/backup lantu-next:latest sh -c 'cp -r /app/data/* /backup/ && chown -R 1001:1001 /backup'" -ForegroundColor Gray
Write-Host ""
Write-Host "5. 启动容器" -ForegroundColor White
Write-Host "   docker-compose up -d" -ForegroundColor Gray
Write-Host ""
Write-Host "6. 更新镜像时（保留数据）" -ForegroundColor White
Write-Host "   docker-compose down" -ForegroundColor Gray
Write-Host "   docker load -i <新镜像.tar>" -ForegroundColor Gray
Write-Host "   docker-compose up -d" -ForegroundColor Gray
Write-Host ""
Write-Host "7. 查看日志排查错误" -ForegroundColor White
Write-Host "   docker-compose logs -f" -ForegroundColor Gray
Write-Host ""
