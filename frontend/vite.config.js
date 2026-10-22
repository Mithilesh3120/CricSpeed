import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/upload': 'http://127.0.0.1:5050',
      '/uploads': 'http://127.0.0.1:5050',
      '/process_frame': 'http://127.0.0.1:5050',
      '/video_feed': 'http://127.0.0.1:5050',
      '/api': 'http://127.0.0.1:5050',
      '/analytics_data': 'http://127.0.0.1:5050',
      '/sounds': 'http://127.0.0.1:5050'
    }
  }
})
