import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ens-vendor': ['@ensdomains/ensjs', 'viem'],
          'query-vendor': ['@tanstack/react-query'],
          'graph-vendor': ['@xyflow/react'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@ensdomains/ensjs', 'viem'],
  },
})

