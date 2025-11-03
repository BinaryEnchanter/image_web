import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './',
  build: {
    outDir: 'dist', // 输出目录（默认就是 dist）
  },
  server: {
    port: 5173,
  }
})
