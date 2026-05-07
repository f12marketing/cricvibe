import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * CricVibe Stable Production Configuration
 * Downgraded to Vite 7 for maximum compatibility and stability.
 * Uses esbuild for minification to avoid extra dependency issues.
 */
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
})
