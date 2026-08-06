import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 配置: React + 后端 API 代理
export default defineConfig({
  plugins: [react()],
  server: {
    // 2026-07-22 11:59:52：Linux 开发入口固定对外监听 23722，端口冲突时直接失败。
    host: '0.0.0.0',
    port: 23721,
    strictPort: true,
    // 开发期把 /api 请求代理到 Spring Boot, 避免 CORS
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:23723',
        changeOrigin: true,
      },
      // 2026-07-21 22:44:03：开发环境保持与 iframe 生产环境相同的相对 WebSocket 地址。
      '/ws': {
        target: 'ws://127.0.0.1:23723',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  preview: {
    // 2026-07-22 11:59:52：Linux 效果验证使用同一前端端口，并显式保留 HTTP/WebSocket 代理。
    host: '0.0.0.0',
    port: 23722,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:23723',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://127.0.0.1:23723',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
