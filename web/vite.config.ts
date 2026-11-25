import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tamaguiPlugin } from '@tamagui/cli/vite'

export default defineConfig({
  plugins: [
    react(),
    tamaguiPlugin({
      config: 'src/tamagui.config.ts',
      components: ['tamagui'],
      disableExtraction: true,
    }),
  ],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
