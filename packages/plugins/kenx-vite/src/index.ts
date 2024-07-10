import type { ServerPlugin, SetupManager, ActiveServerInfo, HTTPServer } from '@ckenx/node'
import type { ServerOptions, UserConfig } from 'vite'

import dns from 'dns'
import path from 'path'
import { spawn } from 'child_process'
import { readFileSync } from 'fs-extra'
import { createServer, build, ViteDevServer } from 'vite'

export default class ViteServer implements ServerPlugin<ViteDevServer> {
  private readonly Setup: SetupManager
  private readonly options: UserConfig
  public server: any

  constructor( Setup: SetupManager, options: UserConfig ){
    this.Setup = Setup
    this.options = options
  }

  async listen( arg: HTTPServer | any ): Promise<ActiveServerInfo | null>{
    if( this.server )
      throw new Error('Vite server is already up')

    if( typeof arg !== 'object' )
      throw new Error('Invalid server configuration')

    const serverConfig: ServerOptions = {
      open: true,
      headers: {
        'Content-Security-Policy': "style-src 'nonce-random' 'self';script-src 'self'",
      }
    }
    let isBound = false

    if( arg.app ) {
      isBound = true
      serverConfig.middlewareMode = true
    }
    else if( arg.PORT || arg.HOST ) {
      serverConfig.host = arg.HOST || '0.0.0.0'
      serverConfig.port = arg.PORT || 9999
    }

    /**
     * There are cases when other servers might respond instead of Vite.
     *
     * The first case is when localhost is used. Node.js under v17 reorders
     * the result of DNS-resolved addresses by default. When accessing localhost,
     * browsers use DNS to resolve the address and that address might differ
     * from the address which Vite is listening to. Vite prints the resolved
     * address when it differs.
     *
     * You can set dns.setDefaultResultOrder('verbatim') to disable the reordering
     * behavior. Vite will then print the address as localhost.
     */
    dns.setDefaultResultOrder('verbatim')

    /**
     * Resolve vite's defined plugins
     */
    const plugins = this.options.plugins as unknown as string[]
    if( Array.isArray( plugins ) ) {
      let resolvedPlugins: any[] = []

      await Promise.all( plugins.map( async module => {
        const list = (await this.Setup.importModule( module )).default
        resolvedPlugins = [ ...resolvedPlugins, ...list ]
      } ) )

      this.options.plugins = resolvedPlugins
    }

    const serverOptions = {
      base: '/static/',
      root: '/src',
      publicDir: 'static',
      mode: process.env.NODE_ENV || 'development',
      ...this.options,
      server: serverConfig,

      /**
       * Enable .apply-color -> applyColor CSS import
       *
       * Example:
       *  ```
       *  import { applyColor } from './example.module.css'
       *  document.getElementById('foo').className = applyColor
       *  ```
       */
      // css: {
      //   modules: {
      //     localsConvention: 'camelCase'
      //   }
      // }
    }
    this.server = await createServer( serverOptions ) as ViteDevServer

    // console.log('Server-config:', process.cwd(), this.options, serverConfig )

    // Use vite's connect instance as middleware
    if( isBound ) {
      arg.app.use( this.server.middlewares )
      arg.app.use( ( req: any, res: any, next: any ) => {
        req.render = async ( url: string ) => {
          try {
            /**
             * 1. Read index.html
             *
             * 2. Apply Vite HTML transforms. This injects the Vite HMR client,
             *    and also applies HTML transforms from Vite plugins, e.g. global
             *    preambles from @vitejs/plugin-react
             *
             * 3a. Load the server entry. ssrLoadModule automatically transforms
             *     ESM source code to be usable in Node.js! There is no bundling
             *     required, and provides efficient invalidation similar to HMR.
             *
             * 3b. Since Vite 5.1, you can use the experimental createViteRuntime API 
             *     instead.
             *     It fully supports HMR and works in a simillar way to ssrLoadModule
             *     More advanced use case would be creating a runtime in a separate
             *     thread or even a different machine using ViteRuntime class
             *
             * 4. render the app HTML. This assumes entry-server.js's exported
             *    `render` function calls appropriate framework SSR APIs,
             *    e.g. ReactDOMServer.renderToString()
             *
             * 5. Inject the app-rendered HTML into the template.
             */
            const
            template = await this.server.transformIndexHtml( url, readFileSync( path.resolve( serverOptions.root, 'index.html'), 'utf-8') ),
            { render } = await this.server.ssrLoadModule(`${serverOptions.root}/server.tsx`)

            return template.replace('<!--outlet-->', await render( url ) )
          }
          catch( error ) {
            /**
             * If an error is caught, let Vite fix the stack 
             * trace so it maps back to your actual source code.
             */
            this.server.ssrFixStacktrace( error )
            throw error
          }
        }

        next()
      })
    }
    // Run standalone server
    else {
      await this.server.listen()

      this.server.printUrls()
      this.server.bindCLIShortcuts({ print: true })
    }

    return this.getInfo()
  }

  async close(){
    if( !this.server )
      throw new Error('No HTTP Server')

    await this.server.close()
  }

  async build(){
    await build({
      base: '/',
      root: '/src',
      publicDir: 'static',
      ...this.options
    })
  }

  /**
   * Programmatical operation of `test: 'vitest'` script
   */
  async test(){
    await this.listen({ PORT: 3333 })
    console.log('Server running on port: 3333')

    try {
      const vitestProcess = spawn('npx', ['vitest'], {
        stdio: 'inherit'
      })

      vitestProcess.on('close', ( code: number ) => {
        console.log(`Vitest exited with code ${code}`)
      })
    }
    catch( error ) { console.error('Tests failed:', error ) }
    finally { await this.server.close() }
  }

  getInfo(): ActiveServerInfo | null{
    if( !this.server )
      throw new Error('No HTTP Server')

    const info = this.server.config
    if( typeof info == 'string' ) return null

    return {
      type: 'vite',
      ...info
    }
  }
}
