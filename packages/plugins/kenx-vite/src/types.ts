import type { UserConfig, PluginOption } from 'vite'

export type PluginDefinition = {
  imports: Record<string, string>
  script: string
  enforce?: 'pre' | 'post'
  apply?: 'build' | 'serve'
}

export type SSRConfig = {
  enabled: boolean
  entry?: string
  template?: string
}

export type ViteConfig = {
  HOST?: string
  PORT?: number
  bindTo?: string
  options?: UserConfig & {
    plugins?: (PluginOption | PluginDefinition)[]
  }
  ssr?: SSRConfig
}

export type ServerOptions = {
  HOST?: string
  PORT?: number
  app?: any
}