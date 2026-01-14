import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: '@ckenx/kenx-http',
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['dist/**']
    }
  }
})
