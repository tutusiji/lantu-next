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

# 1. 构建镜像（使用BuildKit优化）
Write-Host ""
Write-Host "[1/3] 构建Docker镜像（使用BuildKit加速）..." -ForegroundColor Yellow
Write-Host "优化项：国内镜像源 + 多阶段缓存 + 并行构建" -ForegroundColor Gray
docker build --progress=plain -t "${ImageName}:${Version}" .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 镜像构建失败" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 镜像构建成功" -ForegroundColor Green

# 2. 导出镜像为tar文件
Write-Host ""
Write-Host "[2/3] 导出镜像为tar文件..." -ForegroundColor Yellow
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
Write-Host "3. 运行容器（方式一：直接运行）" -ForegroundColor White
Write-Host "   docker run -d -p 4701:3000 \\" -ForegroundColor Gray
Write-Host "     -v ./data:/app/data \\" -ForegroundColor Gray
Write-Host "     --name lantu-next-app \\" -ForegroundColor Gray
Write-Host "     --restart unless-stopped \\" -ForegroundColor Gray
Write-Host "     ${ImageName}:${Version}" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 运行容器（方式二：使用docker-compose，推荐）" -ForegroundColor White
Write-Host "   - 同时上传docker-compose.yml和data目录到服务器" -ForegroundColor Gray
Write-Host "   - 修改docker-compose.yml中的build配置为：" -ForegroundColor Gray
Write-Host "     image: ${ImageName}:${Version}" -ForegroundColor Gray
Write-Host "   - 执行: docker-compose up -d" -ForegroundColor Gray
Write-Host ""
