import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// API do Flask usada no desenvolvimento (python app.py)
const API = 'http://127.0.0.1:5000'

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // "@/components/ui/...": mesmo atalho usado pelos componentes no padrão shadcn
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  // o Flask entrega o site pronto em /static/site/
  base: command === 'build' ? '/static/site/' : '/',
  build: {
    outDir: '../static/site',
    emptyOutDir: true,
    target: 'es2022',
    assetsInlineLimit: 0,
  },
  server: {
    proxy: {
      '/api': {
        target: API,
        changeOrigin: true,
        // o Flask recusa POST de outra origem; no desenvolvimento a origem passa a ser a própria API
        headers: { origin: API },
      },
    },
  },
}))
