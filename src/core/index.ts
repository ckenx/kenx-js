
import type IO from 'socket.io'
import type { Ckenx } from '../types/service'
import type { BackendConfig, HTTPServerConfig, AuxiliaryServerConfig } from '../types'
import * as kxm from './node'

export const Manager = kxm

/**
 * Auto-loaded features 
 */
const CORE_INTERFACE: Ckenx.CoreInterface = {}

async function createHTTPServer( config: HTTPServerConfig ){
  const { HOST, PORT, application } = config

  config.HOST = HOST || process.env.HTTP_HOST || '0.0.0.0'
  config.PORT = PORT || Number( process.env.HTTP_PORT ) || 8000

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
      App = await kxm.importPlugin(`app:${application.framework}`),
      instance: Ckenx.ApplicationPlugin<Ckenx.HTTPServer> = new App( kxm, config )

      CORE_INTERFACE.apps[ application.framework ] = instance

      return await instance.serve()
    } 
    catch( error ){
      console.error('[HTTP SERVER] -', error )
      process.exit(1)
    }
  }

  // Create default HTTP server
  else try {
    const
    HttpServer = await kxm.importPlugin('server:http'),
    instance: Ckenx.ServerPlugin<Ckenx.HTTPServer> = new HttpServer( kxm )

    await instance.listen( config )
    return instance
  }
  catch( error ){
    console.error('[HTTP SERVER] -', error )
    process.exit(1)
  }
}

async function createAuxiliaryServer( config: AuxiliaryServerConfig ){
  try {
    const { type, bindTo, PORT, options } = config
    config.PORT = PORT || Number( process.env.HTTP_PORT )

    const
    AuxServer = await kxm.importPlugin(`server:${type}`),
    instance: Ckenx.ServerPlugin<any> = new AuxServer( kxm, options )

    /**
     * Bind server
     * 
     * - To HTTP Server with a given `sid` or default
     * - To PORT
     */
    const binder = config.bindTo && CORE_INTERFACE.servers ? CORE_INTERFACE.servers[`http:${bindTo}`]?.server : config.PORT
    if( !binder )
      throw new Error('Undefined BIND_TO or PORT configuration')

    await instance.listen( binder )
    return instance
  }
  catch( error ){
    console.error('[SOCKET SERVER] -', error )
    process.exit(1)
  }
}

export const autoload = async ({ servers }: BackendConfig ): Promise<Ckenx.CoreInterface> => {
  /**
   * Load configured servers
   * 
   */
  if( Array.isArray( servers ) ){
    if( !CORE_INTERFACE.servers )
      CORE_INTERFACE.servers = {}
    
    for await ( const config of servers ){
      const { type, sid } = config
      let server

      switch( type ){
        case 'http': server = await createHTTPServer( config as HTTPServerConfig ); break
        default: server = await createAuxiliaryServer( config as AuxiliaryServerConfig ); break
      }

      if( !server )
        throw new Error(`[${type.toUpperCase()} SERVER] - Unsupported`)

      const ref = sid ? `${type}:${sid}` : type
      CORE_INTERFACE.servers[ ref ] = server

      //
      const info = server.getInfo()
      if( !info ) throw new Error('Server returns no information')

      console.log(`\n[${type.toUpperCase()} SERVER] - running \n\tPORT=${info.port}`)
    }
  }

  /**
   * Server NodeJS application 
   * 
   */

  return CORE_INTERFACE
}