import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// API do Flask usada no desenvolvimento (python app.py)
const API = 'http://127.0.0.1:5000'
// endereço da versão publicada no GitHub Pages (a prévia do link no WhatsApp precisa do endereço completo)
const PAGINA = 'https://yan791.github.io/site_CM3/'

const linksAbsolutos = {
  name: 'cm3-links-absolutos',
  transformIndexHtml: {
    order: 'post' as const,
    handler: (html: string) =>
      html
        .replace(/(property="og:image" content=")[^"]*og-cm3\.jpg"/, `$1${PAGINA}og-cm3.jpg"`)
        .replace('</head>', `  <meta property="og:url" content="${PAGINA}" />
  </head>`),
  },
}

export default defineConfig(({ command, mode }) => ({
  plugins: [react(), tailwindcss(), mode === 'pages' && linksAbsolutos],
  // "@/components/ui/...": mesmo atalho usado pelos componentes no padrão shadcn
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  // o Flask entrega o site pronto em /static/site/; a versão do GitHub Pages usa caminhos relativos
  base: mode === 'pages' ? './' : command === 'build' ? '/static/site/' : '/',
  build: {
    outDir: mode === 'pages' ? 'dist-pages' : '../static/site',
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
