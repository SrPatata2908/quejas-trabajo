import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
 
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Revista CRC Sede San José Chiapa/ Buzon de Quejas Sede San José Chiapa',
        short_name: 'Revista/Buzón',
        description: 'Plataforma digital, avisos y buzón de quejas',
        theme_color: '#ffffff',
        icons: [
  {
    src: '/iconolobo.jpg',
    sizes: '192x192', 
    type: 'image/jpeg'
  },  
  {
    src: '/iconolobo.jpg',
    sizes: '512x512',
    type: 'image/jpeg'
  }
]
      }
    })
  ]
})