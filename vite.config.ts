import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Pantallas de funciones no liberadas (huella/check-in). En `vite build` se
 * sustituyen por un stub para que su código no entre al bundle de producción.
 * El gate de rutas está en `src/lib/features.ts`.
 */
const UNRELEASED_PAGES = [
  '@/pages/dashboard/Fingerprint',
  '@/pages/kiosk/CheckIn',
  '@/pages/member/MyCheckins',
]

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      manifestFilename: 'manifest.json',
      includeAssets: ['icons/*.svg', 'icons/*.png', 'brand/omega-logo.png'],
      manifest: {
        id: '/',
        lang: 'es',
        name: 'Omega Gym',
        short_name: 'Omega Gym',
        description: 'Sistema de Gestión de Gimnasio',
        start_url: '/',
        scope: '/',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/icons/icon-48.svg', sizes: '48x48', type: 'image/svg+xml' },
          { src: '/icons/icon-72.svg', sizes: '72x72', type: 'image/svg+xml' },
          { src: '/icons/icon-96.svg', sizes: '96x96', type: 'image/svg+xml' },
          { src: '/icons/icon-128.svg', sizes: '128x128', type: 'image/svg+xml' },
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/rest\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'supabase-api', expiration: { maxEntries: 100, maxAgeSeconds: 86400 } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: [
      // Solo en `vite build`: el servidor de desarrollo conserva las pantallas reales.
      ...(command === 'serve'
        ? []
        : UNRELEASED_PAGES.map((find) => ({
            find,
            replacement: path.resolve(__dirname, 'src/lib/unreleased-stub.tsx'),
          }))),
      { find: '@', replacement: path.resolve(__dirname, 'src') },
    ],
  },
}))
