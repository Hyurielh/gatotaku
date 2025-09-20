import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',  // Alias para importaciones más limpias
    },
    dedupe: [
      'react',
      'react-dom',
      '@tanstack/react-query'
    ]
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'react-helmet-async'
    ],
    exclude: ['lucide-react'],
    force: true,
    esbuildOptions: {
      target: 'es2020'  // Mejorar compatibilidad
    }
  },
  server: {
    host: '127.0.0.1', // Cambiar de true a una dirección IP específica
    port: 5173,
    strictPort: true,  // Cambiar a true para asegurar el puerto
    open: false,        
    cors: true,
    hmr: {
      protocol: 'ws',
      host: '127.0.0.1',
      port: 5173,
      clientPort: 5173,
      overlay: true  // Mostrar errores en pantalla
    },
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
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
      'Cache-Control': 'public, max-age=31536000, immutable',
    }
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