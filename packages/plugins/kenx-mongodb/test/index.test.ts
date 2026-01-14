import { describe, it, expect } from 'vitest'

describe('@ckenx/kenx-mongodb', () => {
  it('should have a valid module', async () => {
    const module = await import('../src/index')
    expect(module).toBeDefined()
  })

  it('should export functions', async () => {
    const module = await import('../src/index')
    expect(module).toBeTypeOf('object')
  })
})
