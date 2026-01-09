import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/gk-deals-expenses/', // Change this if your repo name is different
  plugins: [react()],
})
