import type { Kenx } from '@ckenx/node'
import type { ServerConfig } from './types'
import type { FastifyInstance } from 'fastify'

export default class Server implements Kenx.ServerPlugin<Kenx.HTTPServer> {
  readonly app: Kenx.ApplicationPlugin<FastifyInstance>
  readonly server: Kenx.HTTPServer
  private readonly config: ServerConfig

  constructor( app: Kenx.ApplicationPlugin<FastifyInstance>, config: ServerConfig ){
    this.app = app
    this.config = config
    this.server = app.core.server
  }
  async listen(){
    if( !this.app || !this.config )
      throw new Error('No HTTP Server')

    !this.server.listening && await this.app.core.listen( this.config )

    return this.getInfo()
  }
  async close(){
    await this.app.core.close()
    return this
  }
  getInfo(): Kenx.ActiveServerInfo | null{
    if( !this.app )
      throw new Error('No HTTP Server')

    const info = this.server.address()
    if( typeof info == 'string' ) return null

    return {
      type: 'fastify',
      ...info
    }
  }
}