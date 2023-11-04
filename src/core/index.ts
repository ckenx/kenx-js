import type { Ckenx } from '#types/service'
import type { BackendConfig, HTTPServerConfig, AuxiliaryServerConfig } from '#types/index'
import dotenv from 'dotenv'
import * as kxm from '#core/node'

export const Manager = kxm

/**
 * Ckenx backend setup configuration
 * 
 */
let Backend: BackendConfig

/**
 * Auto-loaded features 
 * 
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
     * - To HTTP Server with a given `key` or default
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

export const autoload = async (): Promise<void> => {
  /**
   * Load backend setup configuration
   * 
   */
  Backend = Manager.loadSetup('backend')
  if( !Backend ) process.exit(1)

  /**
   * Load Environment Variabales
   * 
   */
  Backend.env?.dev === true ?
        dotenv.config({ path: './.env.dev' }) // Load development specific environment variables
        : dotenv.config() // Load default .env variables

  /**
   * Define project directory structure 
   * and pattern
   * 
   */
  Backend.directory = Backend.directory || {}
  
  Backend.directory.root = Manager.getRoot( Backend.directory.root )
  Backend.directory.pattern = Backend.directory.pattern || '-'

  /**
   * Load configured servers
   * 
   */
  if( Array.isArray( Backend.servers ) ){
    if( !CORE_INTERFACE.servers )
      CORE_INTERFACE.servers = {}
    
    for await ( const config of Backend.servers ){
      const { type, key } = config
      let server

      switch( type ){
        case 'http': server = await createHTTPServer( config as HTTPServerConfig ); break
        default: server = await createAuxiliaryServer( config as AuxiliaryServerConfig ); break
      }

      if( !server )
        throw new Error(`[${type.toUpperCase()} SERVER] - Unsupported`)

      const ref = key ? `${type}:${key}` : type
      CORE_INTERFACE.servers[ ref ] = server

      //
      const info = server.getInfo()
      if( !info ) throw new Error('Server returns no information')

      console.log(`\n[${type.toUpperCase()} SERVER] - running \n\tPORT=${info.port}`)
    }
  }
}

/**
 * Initialize and run project
 * 
 * @type {object} config
 * @return {module} Defined setup `object` or `null` if not found
 * 
 */
export const run = async () => {
  // Assumed `autoload` method has resolved
  if( !Backend ) process.exit(1)
  
  const { typescript, directory } = Backend
  switch( directory.pattern ){
    /**
     * MVC entrypoints project structure
     * 
     * path: 
     *  - models: `root/models`
     *  - views: `root/views`
     *  - controllers: `root/controllers`
     */
    case 'mvc': break

    /**
     * Single entrypoint project structure
     * 
     * path: `root/index.ts` or .js 
     */
    default: try {
      const
      filename = `index.${typescript ? 'ts' : 'js'}`,
      entrypoint = await import(`${directory.root}/index`)
      if( !entrypoint )
        throw new Error(`Invalid root directory or file - ${directory.root}/${filename}`)
      
      // Run plain script
      if( typeof entrypoint.default !== 'function' ) return
      
      /**
       * Give access to all loaded services
       *  - Apps
       *  - Servers
       *  - Databases,
       *  - ... 
       */
      entrypoint.default( CORE_INTERFACE )
    }
    catch( error ){ console.log('[PROJECT ENTRYPOINT] -', error ) }
  }
}