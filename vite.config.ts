import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/gk-deals-react/', // Matches your GitHub repository name
  plugins: [react()],
})
