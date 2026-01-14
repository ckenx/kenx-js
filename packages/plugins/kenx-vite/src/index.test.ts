import { describe, it, expect } from 'vitest'
import ViteServer from './index'

describe('@ckenx/kenx-vite', () => {
  it('should export ViteServer class', () => {
    expect(ViteServer).toBeDefined()
    expect(ViteServer.name).toBe('ViteServer')
  })

  it('should create ViteServer instance', () => {
    const mockSetup = {} as any
    const mockConfig = { PORT: 5173, options: {} }
    const server = new ViteServer(mockSetup, mockConfig)
    expect(server).toBeInstanceOf(ViteServer)
  })
})
