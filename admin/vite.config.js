import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  server: {
    host: '0.0.0.0',
    port: 5174
  },
  plugins: [react(), tailwindcss()],
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}))
