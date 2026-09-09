# FOREX_CHART 固定 Linux 部署约定

记录时间：2026-07-22 13:03:00

## 约定结果

后续每次修改完成后都生成同名完整部署包：

```text
本机目录：D:\projects\FOREX_CHART\offline-packages\FOREX_CHART\
本机压缩包：D:\projects\FOREX_CHART\offline-packages\FOREX_CHART.tar.gz
服务器压缩包：/chart/FOREX_CHART.tar.gz
服务器应用目录：/chart/FOREX_CHART/
服务器 JDK：/chart/openlogic-openjdk-21.0.11+10-linux-x64/
```

JDK 不再放入应用目录，也不重复打包。更新应用时只替换 `/chart/FOREX_CHART/`，不得删除 `/chart/openlogic-openjdk-21.0.11+10-linux-x64/`。

## 本次调整

- 新建固定目录名部署包，不再使用带日期的目录名。
- 后端启动和环境检查统一指向 `/chart/` 下的 OpenLogic JDK 21。
- 新增 `scripts/restart-all.sh` 作为日常统一重启入口。
- 后端启动等待 23723 实际监听，前端启动等待 23722 实际监听。
- 停止脚本等待进程完全退出，防止重启时端口冲突。
- 保留完整源码、构建产物、Node.js 运行时和 Linux 前端依赖。

## 后续交付规则

每次交付必须同时提供：

1. `FOREX_CHART.tar.gz`
2. `FOREX_CHART.tar.gz.sha256`
3. 上传位置 `/chart/`
4. 停止、解压、校验、启动和访问命令
5. 本次修改文件清单及验证结果

## 首个固定目录完整包

生成结果：

```text
文件：offline-packages/FOREX_CHART.tar.gz
大小：95.27 MiB
SHA-256：0985ca86763b70fc886ecc12a26fe5b8041f4c7145f9e5514d8e8625e7837730
```

验证结果：压缩包根目录为 `FOREX_CHART/`，JDK 未打入应用包，最新前端生产资源、后端 JAR、Node.js 离线运行时和全部启动脚本均存在。
