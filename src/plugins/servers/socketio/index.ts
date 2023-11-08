
import type { Kenx } from '#types/service'
import { Server, ServerOptions } from 'socket.io'

export default class SocketIOServer implements Kenx.ServerPlugin<Server> {
  readonly server: Server
  private info: Kenx.ActiveServerInfo = {
    type: 'socket.io'
  }

  constructor( Setup: Kenx.SetupManager, options: ServerOptions ){
    this.server = new Server( options ) // Standalone
  
    /* Listen on provided port, on all network interfaces. */
    this.server
    .on('error', ( error: any ) => console.error( error ) )
  }

  listen( arg: number | Kenx.HTTPServer ): Promise<Kenx.ActiveServerInfo | null> {
    return new Promise( ( resolve, reject ) => {
      if( !this.server )
        return reject('No Socket.io Server')
    
      this.server.attach( arg )

      if( typeof arg == 'number' ) this.info.port = arg
      else {
        const address = arg.address()
        typeof address !== 'string' ?
                  this.info = { ...this.info, ...address } 
                  : this.info.port = Number( address )
      }
      
      resolve( this.getInfo() )
    } )
  }

  close(){
    return new Promise( ( resolve, reject ) => {
      if( !this.server )
        return reject('No Socket.io Server')
    
      this.server.close( ( error?: Error ) => error ? reject( error ) : resolve( true ) )
    } )
  }

  getInfo(): Kenx.ActiveServerInfo | null {
    if( !this.server )
      throw new Error('No Socket.io Server')
    
    return this.info
  }
}
