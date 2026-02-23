import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // When deploying to GitHub Pages the repo lives under /<repo-name>/
  // Set VITE_BASE_PATH in the GitHub Actions env or .env.production.
  // For Netlify / custom domain leave it as '/'.
  const base = env.VITE_BASE_PATH || '/'

  // Dev-only proxy — forwards API calls to the local FastAPI server so
  // no CORS issues during development and no hardcoded host needed.
  const apiTarget = env.VITE_API_URL || 'http://127.0.0.1:8000'

  return {
    plugins: [react()],
    base,
    assetsInclude: ['**/*.webp'],
    server: {
      port: 3000,
      proxy: {
        '/ask-recruiter': { target: apiTarget, changeOrigin: true },
        '/docs':          { target: apiTarget, changeOrigin: true },
        '/openapi.json':  { target: apiTarget, changeOrigin: true },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            three:  ['three'],
          },
        },
      },
    },
  }
})
