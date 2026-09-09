# 手机本地调试指南

更新时间：2026-08-04（实测修订：公司 WiFi 存在「客户端隔离 + 域控防火墙」，同一 WiFi 直连不可用；正确方法是「手机热点」，已实测通过）

目标：让手机（Android / iPhone）访问电脑上运行的本地开发环境，真机查看/调试移动端 UI 与实时行情。

## 访问链路（无需改任何配置）

```text
手机浏览器
    |
    | http://<PC当前局域网IP>:23722
    v
Vite dev 0.0.0.0:23722        （frontend/vite.config.ts 已监听 0.0.0.0）
    |-- /api -> http://127.0.0.1:23723
    `-- /ws  -> ws://127.0.0.1:23723
                     |
                     v
             Spring Boot 127.0.0.1:23723   （后端仅供本机，手机不直连）
```

要点：

- 前端 API（`src/api/client.ts` 的 `baseURL: '/api'`）和 WebSocket（`src/realtime/MarketSocket.ts` 按 `window.location.host` 拼地址）都是相对路径，手机访问时自动指向电脑当前 IP，无需改动。
- 后端绑定 `127.0.0.1:23723`、CORS 只放行 23722 端口——都无需修改。
- **关键：手机打开的地址 = 电脑"当前所在网络"的 IP。电脑换网络（连热点/换 WiFi/插网线）后 IP 会变，务必重新 `ipconfig` 查询。**

## 正确的测试办法（推荐，已实测可用）：手机热点

公司/企业 WiFi 通常禁止设备互连（客户端隔离），直接连公司 WiFi 手机访问不了电脑。**手机开热点、电脑连热点**，等于把手机和电脑放进一个无隔离的小局域网，实测稳定可用。

**前置条件**（每台机器启动一次，保持运行即可）：
1. 后端：`cd backend && mvn spring-boot:run`，或 `java -jar chart-backend-1.0.0.jar`
2. 前端：`cd frontend && npm run dev`（Vite 固定监听 `0.0.0.0:23722`）

**测试步骤**：
1. **手机开热点**：设置 → 个人热点 / 便携式 WLAN 热点，记住热点名称和密码。
2. **电脑连手机热点**：Windows 右下角 WiFi 列表选手机热点并输入密码（电脑断开公司 WiFi 属正常现象；Vite 和后端**无需重启**——它们监听 `0.0.0.0` / `127.0.0.1`，不受网卡切换影响）。
3. **查电脑当前 IP**：电脑上执行 `ipconfig`，找到当前活动网卡的 IPv4 地址（实测例：`10.212.37.173`）。
4. **手机访问**：手机浏览器打开 `http://<第 3 步的 IP>:23722`。
5. 若提示「不安全 / 继续访问」，点继续（纯 HTTP 局域网调试的正常提示）。

**验证清单**（确认调试环境真正可用）：
- [ ] 手机能打开页面，无白屏
- [ ] 页面为移动端布局（`useIsMobile` 窄屏断点触发 `MobileLayout`）
- [ ] 品种列表能加载、K 线有数据、实时行情滚动（WebSocket `/ws/market` 已连接）
- [ ] 横竖屏切换、刘海屏安全区（`env(safe-area-inset-*)`）正常
- [ ] 电脑改代码 → 手机刷新能看到最新效果（HMR 生效）

**注意事项**：
- **换网络后 IP 会变**：每次重新连热点/换 WiFi，都要重新 `ipconfig` 查新 IP，手机地址跟着改。
- 热点方案依赖电脑防火墙放行入站 TCP 23722；常规情况下 Windows 按本地规则放行（可用 `mobile-debug.sh` 以管理员添加），若仍不通见「常见问题排查」。

## 替代方案 A：同一 WiFi 直连（仅限家用/无隔离网络）

家用路由器网络可用此方案；**公司 WiFi 不可用**（原因见「企业/公司网络」一节）。

1. 手机和电脑连同一个 WiFi。
2. `ipconfig` 查电脑局域网 IP（可运行 `mobile-debug.sh` 自动解析）。
3. 启动后端、前端（命令见上节）。
4. 放行 Windows 防火墙入站 TCP 23722（以管理员运行 `mobile-debug.sh`，或手动执行 `netsh advfirewall firewall add rule name="FORFXChart-Dev-23722" dir=in action=allow protocol=TCP localport=23722`）。
5. 手机浏览器打开 `http://<电脑局域网IP>:23722`。

## 替代方案 B：Android USB 远程调试（不依赖任何网络，可看 console）

1. 手机开启「开发者选项 → USB 调试」，USB 连接电脑，`adb devices` 确认设备可见。
2. 执行端口反向转发：`adb reverse tcp:23722 tcp:23722`
3. 手机 Chrome 打开 `http://localhost:23722`。
4. PC 上 Chrome 打开 `chrome://inspect`，可远程查看 console、网络请求、元素与截图——真正的"调试"体验。

## 替代方案 C：iPhone 说明

- 热点 / 家用 WiFi 下直接用 Safari 打开 `http://<电脑IP>:23722` 即可查看移动端效果。
- Safari Web Inspector 远程调试**仅支持 Mac + USB**，Windows 下无法使用；如需看 console/网络，可临时用浏览器内调试工具或后端日志辅助。

## 企业/公司网络为什么直连失败（实测结论 2026-08-04）

**症状**：手机与电脑同 WiFi、同网段（如都在 10.18.100.x）、防火墙规则已加、前后端正常监听，手机仍打不开。

**定位命令（电脑上执行）**：

```bash
ping <手机IP>            # 超时
arp -a | grep <手机IP>   # 无条目 → 二层都不通 = 客户端隔离
netsh advfirewall show currentprofile
# LocalFirewallRules: N/A (仅 GPO 存储) → 域控策略，本地规则可能不生效
```

**结论**：公司 WiFi 存在双重拦截，均为公司网络策略，本机无法修改：
1. **AP/客户端隔离**：同一 WiFi 下设备间禁止通信（连 ARP 都解析不了）；
2. **域控 GPO 防火墙**：`LocalFirewallRules 仅 GPO 存储`，本地 `netsh add rule` 加的规则可能被忽略。

因此直接连公司 WiFi 调试不可行，使用「手机热点」或「USB adb 隧道」方案。

## 常见问题排查

| 现象 | 原因与处理 |
| --- | --- |
| 手机打不开页面 | 1) 确认访问的是电脑**当前** IP（换网络后 IP 会变，重新 `ipconfig`）；2) 热点方案下仍不通 → 防火墙本地规则未生效，改用 USB adb 或内网穿透（cloudflared/ngrok）；3) 家用 WiFi 下检查防火墙是否放行 23722 |
| 页面能开但行情数据不动 / WebSocket 断开 | 后端没启动或挂了：`curl http://127.0.0.1:23723/api/meta/instruments` 应返回 200 + 品种 JSON；后端启动命令见「前置条件」 |
| 手机提示「不安全 / 证书错误」 | 纯 HTTP 局域网调试的正常提示，忽略即可 |
| 画面不是最新代码 | Vite dev 有 HMR，电脑改代码后手机刷新即可；注意浏览器缓存，必要时用无痕模式 |
| 手机上横竖屏/刘海屏适配不对 | 项目已做移动端适配（`src/mobile/`、`src/hooks/useIsMobile.ts`、`main.css` 的 safe-area 规则），真机验证即可 |

## 相关文件

- `frontend/vite.config.ts` —— dev/preview 均监听 `0.0.0.0:23722`，代理 `/api`、`/ws` 到 `127.0.0.1:23723`
- `backend/src/main/resources/application.yml` —— 后端仅绑定 `127.0.0.1:23723`（手机调试无需改动）
- `mobile-debug.sh` —— 辅助脚本：解析局域网 IP、探测前后端端口、尝试放行防火墙
