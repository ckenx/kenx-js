import type { Kenx } from '#types/service'
import type { FastifyInstance } from 'fastify'
import type { HTTPServerConfig } from '#types/index'

export default class Server implements Kenx.ServerPlugin<Kenx.HTTPServer> {
  readonly app: Kenx.ApplicationPlugin<FastifyInstance>
  readonly server: Kenx.HTTPServer
  private readonly options: HTTPServerConfig

  constructor( app: Kenx.ApplicationPlugin<FastifyInstance>, options: HTTPServerConfig ){
    this.app = app
    this.options = options
    this.server = app.core.server
  }
  async listen(){
    if( !this.app || !this.options )
      throw new Error('No HTTP Server')

    if( !this.server.listening ){
      const { PORT, HOST } = this.options
      await this.app.core.listen({ port: PORT, host: HOST })
    }

    return this.getInfo()
  }
  async close(){
    await this.app.core.close()
    return this
  }
  getInfo(): Kenx.ActiveServerInfo | null {
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