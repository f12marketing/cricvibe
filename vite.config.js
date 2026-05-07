import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * CricVibe Production Configuration
 * Optimized for Vite 8 + Rolldown + Node 20
 */
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  build: {
    target: 'esnext',
    // We rely on Vite 8's smart automatic chunking (Rolldown) 
    // to avoid compatibility issues with manualChunks function types.
    minify: 'esbuild',
    sourcemap: false
  }
})
