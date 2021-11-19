import { defineConfig, UserConfigExport } from 'vite'
import vue from '@vitejs/plugin-vue'
import jsx from '@vitejs/plugin-vue-jsx'
import path from 'path'
import visualizer from 'rollup-plugin-visualizer'
const config: UserConfigExport = {
  resolve: {
    alias: {
      '@': path.join(__dirname, '/src')
    }
  },
  server: {
    hmr: true,
    proxy: {
      '/api': 'https://nezha.weis1606.cn',
      '/export': 'https://nezha.weis1606.cn/',
      '/upload': 'https://nezha.weis1606.cn/',
      '/import': 'https://nezha.weis1606.cn/',
      '/upload/meituanImage': {
        target: 'https://nezha.weis1606.cn/',
        changeOrigin: true,
        rewrite: path => path.replace('/upload/meituanImage', '/upload/meituanImage')
      },
      '/weisapi': {
        target: 'https://otherterrace.weis1606.cn/',
        changeOrigin: true,
        rewrite: path => path.replace('/weisapi', '/api')
      },
      '/weisupload': {
        target: 'https://otherterrace.weis1606.cn/',
        changeOrigin: true,
        rewrite: path => path.replace('/weisupload', '/upload')
      },
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue': ['vue', 'vue-router', 'vuex'],
          'html2canvas': ['html2canvas'],
          'element-plus': ['element-plus', 'element-plus/lib/theme-chalk/index.css']
        }
      }
    }
  },
  plugins: [vue({
    script: {
      babelParserPlugins: ['jsx']
    }
  }), jsx()]
}

if (process.env.chunk) {
  config.plugins.push(
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  )
}

export default defineConfig(config)
