# Linux 离线部署包整理记录

记录时间：2026-07-22 12:28:00

## 处理原因

目标服务器为 RHEL 7.5 x86_64，当前 DNS 解析失败，无法通过 yum、curl 或 npm 在线安装依赖。为便于一次上传并验证图表实时效果，将新项目的前后端源码、构建产物和兼容运行时整理为一个离线部署包；旧项目 `chart` 不包含在内，也未做修改。

## 输出位置

```text
D:\projects\FOREX_CHART\offline-packages\FOREX_CHART_LINUX_20260722\
D:\projects\FOREX_CHART\offline-packages\FOREX_CHART_LINUX_20260722.tar.gz
D:\projects\FOREX_CHART\offline-packages\FOREX_CHART_LINUX_20260722.tar.gz.sha256
```

## 部署包内容

- `backend/`：后端源码、Maven 配置、可直接启动的 Spring Boot JAR。
- `frontend/`：前端源码、已构建 `dist`、为 Linux x86_64 预装的 Vite 运行依赖。
- `runtime/`：Node.js v22.23.1 `linux-x64-glibc-217` 的 `.tar.gz` 离线包。
- `scripts/`：环境检查、Node 解压、前后端启停和运行状态检查。
- `docs/`：当前项目的指标、移动端、实时推送与 Linux 部署记录。
- `MANIFEST.sha256`：JAR、Node 离线包和前端 dist 关键文件的校验值。

## 已完成校验

- Node.js 离线包 SHA-256 与发布方 `SHASUMS256.txt` 一致。
- 前端离线依赖只包含 Linux x86_64 的 esbuild/rollup 原生包，不包含 Windows 原生包。
- 部署包中的后端 JAR、前端 dist 和配置与当前工作区构建产物哈希一致。
- 所有 `.sh` 文件均为 LF 换行且没有 UTF-8 BOM，适合 Linux Bash 执行。
- 新项目有效配置未残留 8080、5173、4173 或 18080；对外前端端口为 23722，后端本机端口为 23723。

## 服务器使用入口

详细命令见部署包根目录的 `README_OFFLINE_DEPLOY.md`。2026-07-22 12:36:58 起，启动脚本默认使用部署目录内的 `openlogic-openjdk-21.0.11+10-linux-x64/bin/java`；Node.js 已包含在包内，不需要系统在线安装。

最终上传压缩包大小为 95.27 MiB，SHA-256 为：

```text
18cd2dfba9fb2e46659d8c070e5b72386417fb30a1c070096a2a21394ab98788
```

> 2026-07-22 12:28:00：此包使用 `vite preview` 满足当前无 Nginx 的效果验证需求。正式长期生产运行时再补充 Nginx/Caddy 与 systemd。
