import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import eslint from 'vite-plugin-eslint2'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), eslint({ emitErrorAsWarning: true })],
    server: {
        port: 5174,
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-motion': ['framer-motion'],
                    'vendor-lucide': ['lucide-react']
                }
            }
        }
    }
})
