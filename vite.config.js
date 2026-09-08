import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // 相对路径，便于部署到 GitHub Pages 子路径
  base: './',
  server: {
    port: 5173,
    // 本地开发时把 /api 请求转发给本地后端服务
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, '')
      }
    }
  }
})
