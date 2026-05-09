import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Это указывает Vite слушать все адреса (эквивалентно '0.0.0.0')
    port: 5173, // Порт можно оставить по умолчанию
  }
})