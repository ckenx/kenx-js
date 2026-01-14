import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  'packages/node/vitest.config.ts',
  'packages/plugins/*/vitest.config.ts'
])
