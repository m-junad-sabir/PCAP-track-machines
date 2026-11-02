import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { VitePWA } from 'vite-plugin-pwa';

// HTTPS is required for GPS + camera on phones. The /api proxy keeps API calls same-origin (no mixed content).
export default defineConfig({
  plugins: [
    react(), tailwindcss(), basicSsl(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: { name: 'PCAP Field App', short_name: 'PCAP', theme_color: '#1f4d3a', background_color: '#ffffff', display: 'standalone', start_url: '/' },
      workbox: { navigateFallbackDenylist: [/^\/api/] },
    }),
  ],
  server: { host: true, port: 5173, proxy: { '/api': 'http://localhost:3000' } },
});
