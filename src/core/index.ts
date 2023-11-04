import type { Ckenx } from '../types/service'
import type { BackendConfig } from '../types'
import * as _Utils from './node'

export const Utils = _Utils

export const autoload = async ({ server }: BackendConfig ): Promise<Ckenx.CoreInterface> => {
  /**
   * Auto-loaded features 
   */
  const CORE_INTERFACE: Ckenx.CoreInterface = {}

  /**
   * Create HTTP server
   * 
   */
  if( server?.http ) {
    const { HOST, PORT, application } = server.http

    server.http.HOST = HOST || process.env.HTTP_HOST || '0.0.0.0'
    server.http.PORT = PORT || Number( process.env.HTTP_PORT ) || 8000

    CORE_INTERFACE.servers = {}

    /**
     * Handle server & application with
     * existing plugin frameworks. 
     * 
     * Eg. express, fastify, ...
     * 
     */
    if( application?.framework ) {
      CORE_INTERFACE.apps = {}

      try {
        const
        App = await Utils.importPlugin( application.framework ),
        instance: Ckenx.ApplicationPlugin<Ckenx.HTTPServer> = new App( Utils, server.http )

        CORE_INTERFACE.apps[ application.framework ] = instance

        const httpServer = await instance.serve()
        CORE_INTERFACE.servers.http = httpServer

        //
        const info = httpServer.getInfo()
        if( !info ) throw new Error('Server returns no information')

        console.log(`\nServer is up 🚀 running on PORT=${info.port}`)
      } 
      catch( error ){
        console.error('Failed loading server application: ', error )
        process.exit(1)
      }
    }

    // Create default HTTP server
    else try {
      const
      HttpServer = await Utils.importPlugin('http'),
      instance: Ckenx.ServerPlugin<Ckenx.HTTPServer> = new HttpServer( Utils )

      await instance.listen( PORT, HOST )
      CORE_INTERFACE.servers.http = instance

      //
      const info = instance.getInfo()
      if( !info ) throw new Error('Server returns no information')

      console.log(`\nServer is up 🚀 running on PORT=${info.port}`)
    } 
    catch( error ){
      console.error('Failed loading server application: ', error )
      process.exit(1)
    }
  }

  /**
   * Server NodeJS application 
   * 
   */

  return CORE_INTERFACE
}