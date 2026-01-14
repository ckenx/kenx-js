import { describe, it, expect } from 'vitest'

describe('@ckenx/node', () => {
  it('should have core module', async () => {
    const module = await import('../src/index')
    expect(module).toBeDefined()
  })

  it('should export core functionality', async () => {
    const module = await import('../src/index')
    expect(module).toBeTypeOf('object')
  })
})
