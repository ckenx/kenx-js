import type { ServerPlugin, SetupManager, ActiveServerInfo, ApplicationPlugin } from '@ckenx/node'
import type { InlineConfig, ViteDevServer, PluginOption } from 'vite'
import type { ViteConfig, ServerOptions, SSRConfig, PluginDefinition } from './types'

import dns from 'dns'
import path from 'node:path'
import { readFileSync } from 'node:fs'
import { createServer, build } from 'vite'

export default class ViteServer implements ServerPlugin<ViteDevServer> {
  readonly server!: ViteDevServer
  private readonly Setup: SetupManager
  private readonly config: ViteConfig
  private isMiddlewareMode = false

  constructor(Setup: SetupManager, config: ViteConfig) {
    this.Setup = Setup
    this.config = config

    if (!this.config.options) {
      this.config.options = {}
    }
  }

  /**
   * Load and resolve Vite plugins from configuration
   * 
   * Supports both:
   * - Direct PluginOption objects
   * - YAML-defined plugins with imports and scripts
   */
  private async loadPlugins(): Promise<PluginOption[]> {
    const plugins: PluginOption[] = []
    const pluginDefs = this.config.options?.plugins || []

    for (const pluginDef of pluginDefs) {
      if (this.isPluginDefinition(pluginDef)) {
        try {
          const resolved = await this.resolvePluginDefinition(pluginDef)
          plugins.push(resolved)
        } catch (error) {
          console.error('Failed to load plugin:', error)
        }
      } else {
        plugins.push(pluginDef as PluginOption)
      }
    }

    return plugins
  }

  /**
   * Check if plugin definition is a YAML-defined plugin
   */
  private isPluginDefinition(plugin: any): plugin is PluginDefinition {
    return plugin && typeof plugin === 'object' && 'imports' in plugin && 'script' in plugin
  }

  /**
   * Resolve plugin definition by dynamically importing packages
   * and executing the configuration script
   */
  private async resolvePluginDefinition(def: PluginDefinition): Promise<PluginOption> {
    const imports: Record<string, any> = {}

    for (const [name, packageName] of Object.entries(def.imports)) {
      try {
        const module = await import(packageName)
        imports[name] = module.default || module
      } catch (error) {
        console.error(`Failed to import ${packageName}:`, error)
        throw error
      }
    }

    const fn = new Function(...Object.keys(imports), `return ${def.script}`)
    const plugin = fn(...Object.values(imports))

    if (def.enforce) {
      plugin.enforce = def.enforce
    }

    if (def.apply) {
      plugin.apply = def.apply
    }

    return plugin
  }

  async listen(arg: ServerOptions): Promise<ActiveServerInfo | null> {
    if (this.server) {
      throw new Error('Vite server is already running')
    }

    if (typeof arg !== 'object') {
      throw new Error('Invalid server configuration')
    }

    dns.setDefaultResultOrder('verbatim')

    const plugins = await this.loadPlugins()

    const viteConfig: InlineConfig = {
      root: this.config.options?.root || process.cwd(),
      base: this.config.options?.base || '/',
      publicDir: this.config.options?.publicDir || 'public',
      mode: process.env.NODE_ENV || 'development',
      ...this.config.options,
      plugins,
      server: {
        host: arg.HOST || this.config.HOST || '0.0.0.0',
        port: arg.PORT || this.config.PORT || 5173,
        middlewareMode: !!arg.app,
        ...this.config.options?.server
      },
      css: {
        modules: {
          localsConvention: 'camelCase'
        },
        ...this.config.options?.css
      }
    }

    const server = await createServer(viteConfig)
    ;(this as any).server = server
    this.isMiddlewareMode = !!arg.app

    if (arg.app) {
      arg.app.use(server.middlewares)

      if (this.config.ssr?.enabled) {
        this.attachSSRMiddleware(arg.app, this.config.ssr)
      }
    } else {
      await server.listen()
      server.printUrls()
      server.bindCLIShortcuts({ print: true })
    }

    return this.getInfo()
  }

  private attachSSRMiddleware(app: ApplicationPlugin<any>, ssrConfig: SSRConfig) {
    const viteRoot = this.config.options?.root || process.cwd()
    const entryPath = ssrConfig.entry || `${viteRoot}/entry-server`
    const templatePath = ssrConfig.template || `${viteRoot}/index.html`

    app.attach('renderSSR', async (url: string) => {
      try {
        if (process.env.NODE_ENV === 'production') {
          const template = readFileSync(path.resolve(templatePath), 'utf-8')
          const { render } = await import(entryPath)
          return template.replace('<!--ssr-outlet-->', await render(url))
        }

        let template = readFileSync(path.resolve(templatePath), 'utf-8')
        template = await this.server!.transformIndexHtml(url, template)
        const { render } = await this.server!.ssrLoadModule(entryPath)
        
        return template.replace('<!--ssr-outlet-->', await render(url))
      } catch (error: any) {
        this.server!.ssrFixStacktrace(error)
        throw error
      }
    })
  }

  async build(): Promise<void> {
    const viteRoot = this.config.options?.root || process.cwd()
    const plugins = await this.loadPlugins()

    const buildConfig: InlineConfig = {
      root: viteRoot,
      base: this.config.options?.base || '/',
      mode: 'production',
      ...this.config.options,
      plugins,
      build: {
        outDir: path.resolve(viteRoot, 'dist'),
        emptyOutDir: true,
        ...this.config.options?.build
      }
    }

    try {
      await build(buildConfig)
      
      if (this.config.ssr?.enabled) {
        const ssrConfig: InlineConfig = {
          ...buildConfig,
          build: {
            ...buildConfig.build,
            ssr: this.config.ssr.entry || true,
            outDir: path.resolve(viteRoot, 'dist/server')
          }
        }
        await build(ssrConfig)
      }
    } catch (error) {
      console.error('Build error:', error)
      throw error
    }
  }

  async close(): Promise<unknown> {
    if (!this.server) {
      throw new Error('No Vite server running')
    }

    return this.server.close()
  }

  getInfo(): ActiveServerInfo | null {
    if (!this.server) {
      return null
    }

    const address = this.server.httpServer?.address()
    
    if (typeof address === 'string') {
      return { type: 'vite' }
    }

    return {
      type: 'vite',
      port: address?.port || this.config.PORT
    }
  }
}
