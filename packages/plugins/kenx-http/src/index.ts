
import type { Kenx } from '@ckenx/node'
import type { Config } from './types'
import http from 'http'

export default class HttpServer implements Kenx.ServerPlugin<Kenx.HTTPServer> {
  readonly app?: Kenx.ApplicationPlugin<any>
  readonly server: Kenx.HTTPServer

  constructor( Setup: Kenx.SetupManager, app?: Kenx.ApplicationPlugin<any> ){
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
      // Handle specific listen errors with friendly messages
      switch( error.code ) {
        case 'EACCES': console.error('Requires elevated privileges'); break
        case 'EADDRINUSE': console.error('Server PORT is already in use'); break
        default: console.error( error )
      }
    } )
  }

  listen({ PORT, HOST }: Config ): Promise<Kenx.ActiveServerInfo | null>{
    return new Promise( ( resolve, reject ) => {
      if( !this.server )
        return reject('No HTTP Server')

      !this.server.listening
      && this.server.listen( PORT, HOST || '0.0.0.0', () => resolve( this.getInfo() ) )
    } )
  }

  close(){
    return new Promise( ( resolve, reject ) => {
      if( !this.server )
        return reject('No HTTP Server')

      this.server.close( ( error?: Error ) => error ? reject( error ) : resolve( true ) )
    } )
  }

  getInfo(): Kenx.ActiveServerInfo | null{
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
