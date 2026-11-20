import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/lich-viet/',
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => assetInfo.name === 'app-icon-source.png'
          ? 'src/assets/app-icon-source.png'
          : 'assets/[name]-[hash][extname]',
      },
    },
  },
}))
