
import type { Ckenx } from '#types/service'
import type { HTTPServerConfig } from '#types/index'
import http from 'http'

export default class HttpServer implements Ckenx.ServerPlugin<Ckenx.HTTPServer> {
  readonly app?: Ckenx.ApplicationPlugin<any>
  readonly server: Ckenx.HTTPServer

  constructor( kxm: Ckenx.Manager, app?: Ckenx.ApplicationPlugin<any> ){
    this.app = app
    this.server = http.createServer( app?.core )
  
    /**
     * Event listener for HTTPS server event.
     */
    process.on('uncaughtException', ({ stack, message }: Error ) => console.error( 'Uncaught Exception at: %s - message: %s', stack, message ) )
    process.on('unhandledRejection', ({ stack, message }: Error ) => console.error( 'Unhandled Rejection at: %s - message: %s', stack, message ) )

    /* Listen on provided port, on all network interfaces. */
    this.server
    .on('error', ( error: any ) => {
      // handle specific listen errors with friendly messages
      switch( error.code ){
        case 'EACCES': console.error('Requires elevated privileges'); break
        case 'EADDRINUSE': console.error('Server PORT is already in use'); break
        default: console.error( error )
      }
    } )
  }

  listen({ PORT, HOST }: HTTPServerConfig ): Promise<Ckenx.ActiveServerInfo | null> {
    return new Promise( ( resolve, reject ) => {
      if( !this.server )
        return reject('No HTTP Server')
    
      this.server.listen( PORT, HOST || '0.0.0.0', () => resolve( this.getInfo() ) )
    } )
  }

  close(){
    return new Promise( ( resolve, reject ) => {
      if( !this.server )
        return reject('No HTTP Server')
    
      this.server.close( ( error?: Error ) => error ? reject( error ) : resolve( true ) )
    } )
  }

  getInfo(): Ckenx.ActiveServerInfo | null {
    if( !this.server )
      throw new Error('No HTTP Server')

    const info = this.server.address()
    if( typeof info == 'string' ) return null

    return {
      type: 'express',
      ...info
    }
  }
}
