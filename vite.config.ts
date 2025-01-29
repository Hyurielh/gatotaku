import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/gatotaku/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,  
    open: false,        
    cors: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173
    },
    headers: {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
    },
    watch: {
      ignored: ['**/node_modules/**', '**/.git/**'],  
    }
  },
  preview: {
    host: true,
    port: 5173,
    strictPort: false,
    open: false,
    cors: true,
    headers: {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});