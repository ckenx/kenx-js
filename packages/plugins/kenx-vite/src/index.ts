
import type { ServerPlugin, ApplicationPlugin, SetupManager, ActiveServerInfo } from '@ckenx/node'
import type { Config } from './types'

import { fileURLToPath } from 'url'
import { createServer, ViteDevServer } from 'vite'

export default class ViteServer implements ServerPlugin<ViteDevServer> {
  // readonly app?: ApplicationPlugin<any>
  public server: any
  // private readonly __dirname

  // constructor( Setup: SetupManager, app?: ApplicationPlugin<any> ){
  //   // this.app = app

  //   // this.__dirname = fileURLToPath( new URL('.', import.meta.url ) )
  // }

  async listen({ PORT }: Config ): Promise<ActiveServerInfo | null>{
    if( this.server )
      throw new Error('Vite server is already up')

    this.server = await createServer({
      mode: 'development',
      configFile: false,
      root: __dirname,
      server: {
        port: PORT,
      }
    }) as ViteDevServer

    await this.server.listen()

    this.server.printUrls()
    this.server.bindCLIShortcuts({ print: true })

    return this.getInfo()
  }

  async close(){
    if( !this.server )
      throw new Error('No HTTP Server')

    await this.server.close()
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
