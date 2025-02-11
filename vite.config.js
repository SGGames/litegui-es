import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: false,
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/litegui/index.js'),
      name: 'litegui-es',
      // the proper extensions will be added
      fileName: 'litegui-es',
    }
  },
})