import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // important for electron file:// loading
  server: {
    port: 5173,
    strictPort: true
  }
})
