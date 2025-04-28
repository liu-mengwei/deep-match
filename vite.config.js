import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import AutoImport from 'unplugin-auto-import/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      // 自动导入 Vue 相关函数，如：ref, reactive, computed, toRef 等
      imports: ['vue'],
      // 可以在这里添加其他需要自动导入的库
      // 例如: 'vue-router', 'pinia', '@vueuse/core' 等
      dts: 'src/auto-imports.d.ts', // 生成全局声明文件，避免 TypeScript 报错
      eslintrc: {
        enabled: true, // 启用 ESLint 支持
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
