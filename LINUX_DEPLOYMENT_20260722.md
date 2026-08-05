# Linux 部署与端口说明

更新时间：2026-07-22 11:59:52（Asia/Shanghai）

## 当前部署结构

```text
外部浏览器
    |
    | http://Linux-IP:23722
    v
Vite preview 0.0.0.0:23722
    |-- /api  -> http://127.0.0.1:23723
    `-- /ws   -> ws://127.0.0.1:23723
                     |
                     v
             Spring Boot 127.0.0.1:23723
```

Linux 防火墙只需开放 TCP `23722`。后端 `23723` 仅供本机代理访问，不应对公网开放。

## Linux 需要安装

- Java 17 或更高版本，建议 Java 21。
- Node.js 18 或更高版本，建议 Node.js 20 LTS。
- npm。
- 当前验证阶段不需要 Nginx，也不要求 Linux 安装 Maven。

## 推荐上传内容

先在开发机完成构建，然后上传以下最小集合：

```text
/opt/forex-chart/
|-- backend/
|   `-- chart-backend-1.0.0.jar
`-- frontend/
    |-- dist/
    |-- package.json
    |-- package-lock.json
    `-- vite.config.ts
```

开发机生成文件：

```powershell
cd D:\projects\FOREX_CHART\backend
mvn clean package

cd D:\projects\FOREX_CHART\frontend
npm ci
npm run build
```

对应上传来源：

- `backend/target/chart-backend-1.0.0.jar`
- `frontend/dist/` 整个目录
- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/vite.config.ts`

不要上传 `frontend/node_modules/`，应在 Linux 上重新安装依赖。

## Linux 启动命令

### 1. 启动后端

```bash
cd /opt/forex-chart/backend
nohup java -jar chart-backend-1.0.0.jar > backend.log 2>&1 &
```

### 2. 安装前端预览服务依赖

```bash
cd /opt/forex-chart/frontend
npm ci --include=dev
```

Vite 属于开发依赖，所以不要使用会排除 devDependencies 的安装方式。

### 3. 启动前端

```bash
cd /opt/forex-chart/frontend
nohup npm run preview > frontend.log 2>&1 &
```

### 4. 检查监听状态

```bash
ss -lntp | grep -E '23722|23723'
```

预期结果：

```text
0.0.0.0:23722
127.0.0.1:23723
```

### 5. 验证

Linux 本机验证后端：

```bash
curl http://127.0.0.1:23723/api/meta/instruments
```

外部浏览器访问：

```text
http://Linux服务器IP:23722
```

页面打开后应自动连接 `/ws/market`，最后一根 K 线、叠加指标和副图指标会持续更新。

## 防火墙示例

Ubuntu/UFW：

```bash
sudo ufw allow 23722/tcp
```

CentOS/RHEL/firewalld：

```bash
sudo firewall-cmd --permanent --add-port=23722/tcp
sudo firewall-cmd --reload
```

不要开放 `23723`，除非将来明确需要外部系统直接调用后端 API。

## 注意事项

- `npm run preview` 适合当前验收图表效果，不适合作为长期正式生产服务器。
- 长期运行建议后续使用 Nginx 或 Caddy 托管 `dist/`，继续将 `/api` 和 `/ws` 代理到 `127.0.0.1:23723`。
- 如果启动命令额外传入 `--server.port` 或 `--server.address`，会覆盖 JAR 内的当前配置。
- 如果 Linux 上已有外部 `application.yml`，也要确认其中没有把后端端口覆盖回旧值。

## 2026-07-22 本机联调结果

- `mvn clean package`：成功，生成 `backend/target/chart-backend-1.0.0.jar`，6 个测试全部通过。
- `npm run build`：成功，生成最新 `frontend/dist/`。
- 后端实际监听：`127.0.0.1:23723`。
- 前端实际监听：`0.0.0.0:23722`。
- `http://127.0.0.1:23722/`：返回 HTTP 200。
- `http://127.0.0.1:23722/api/meta/instruments`：经代理返回 HTTP 200 和 35 个品种。
- `ws://127.0.0.1:23722/ws/market`：经代理收到 `SUBSCRIBED`、`BAR`、`INDICATORS`。
- 联调完成后已关闭临时进程，`23722`、`23723` 均已释放。
