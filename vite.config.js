import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html'),
        serviceEducation: resolve(__dirname, 'services/education.html'),
        serviceHealthcare: resolve(__dirname, 'services/healthcare.html'),
        serviceBusiness: resolve(__dirname, 'services/business.html'),
        serviceIndustrial: resolve(__dirname, 'services/industrial.html'),
      },
    },
  },
})
