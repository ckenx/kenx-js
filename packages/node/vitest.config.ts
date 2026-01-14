import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '#types': path.resolve(__dirname, './src/types'),
      '#lib': path.resolve(__dirname, './src/lib'),
      '#root': path.resolve(__dirname, './src')
    }
  },
  test: {
    name: '@ckenx/node',
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts', 'src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'dist/**', 'temp/**']
    }
  }
})
