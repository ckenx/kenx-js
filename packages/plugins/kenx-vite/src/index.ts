
import type { ServerPlugin, SetupManager, ActiveServerInfo, HTTPServer } from '@ckenx/node'
import type { UserConfig } from 'vite'

import dns from 'dns'
import { createServer, build, ViteDevServer } from 'vite'

export default class ViteServer implements ServerPlugin<ViteDevServer> {
  readonly options: UserConfig
  public server: any

  constructor( Setup: SetupManager, options: UserConfig ){
    this.options = options
  }

  async listen( arg: any | HTTPServer ): Promise<ActiveServerInfo | null>{
    if( this.server )
      throw new Error('Vite server is already up')

    if( typeof arg !== 'object' )
      throw new Error('Invalid server configuration')

    const serverConfig: any = { open: true }
    let isBound = false

    if( arg.app ) {
      isBound = true
      serverConfig.middlewareMode = true
    }
    else if( arg.PORT || arg.HOST ) {
      serverConfig.host = arg.HOST || '0.0.0.0'
      serverConfig.port = arg.PORT || '9999'
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

    this.server = await createServer({
      base: '/',
      root: '/src',
      publicDir: 'static',
      ...this.options,
      server: serverConfig
    }) as ViteDevServer

    console.log( {
      base: '/',
      root: '/src',
      publicDir: 'static',
      ...this.options,
      server: serverConfig
    } )

    // Use vite's connect instance as middleware
    if( isBound )
      arg.app.use( this.server.middlewares )

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
