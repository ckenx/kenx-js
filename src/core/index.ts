import type { Ckenx } from '#types/service'
import type { HTTPServerConfig, AuxiliaryServerConfig } from '#types/index'
import dotenv from 'dotenv'
import SetupManager from '#core/setup'

/**
 * Ckenx setup configuration
 * 
 */
const 
Setup = new SetupManager(),

/**
 * Auto-loaded features 
 * 
 */
CORE_INTERFACE: Ckenx.CoreInterface = {}

async function createHTTPServer( config: HTTPServerConfig ){
  const { HOST, PORT } = config

  config.HOST = HOST || process.env.HTTP_HOST || '0.0.0.0'
  config.PORT = PORT || Number( process.env.HTTP_PORT ) || 8000

  /**
   * Handle server & application with
   * existing plugin frameworks. 
   * 
   * Eg. express, fastify, ...
   * 
   */
  if( config.application?.framework ) {
    try {
      const
      App = await Setup.importPlugin(`app:${config.application.framework}`),
      instance: Ckenx.ApplicationPlugin<Ckenx.HTTPServer> = new App( Setup, config )

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
    HttpServer = await Setup.importPlugin('server:http'),
    instance: Ckenx.ServerPlugin<Ckenx.HTTPServer> = new HttpServer( Setup )

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
    AuxServer = await Setup.importPlugin(`server:${type}`),
    instance: Ckenx.ServerPlugin<any> = new AuxServer( Setup, options )

    /**
     * Bind server
     * 
     * - To HTTP Server with a given `key` or default
     * - To PORT
     */
    const binder = bindTo && CORE_INTERFACE.servers ? CORE_INTERFACE.servers[ bindTo ]?.server : config.PORT
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
   * Load Environment Variabales
   * 
   */
  process.env.NODE_ENV == 'development' ?
          dotenv.config({ path: './.env.dev' }) // Load development specific environment variables
          : dotenv.config() // Load default .env variables

  /**
   * Load setup configuration
   * 
   */
  Setup.initialize()
  const { servers } = Setup.getConfig()

  /**
   * Load configured servers
   * 
   */
  if( Array.isArray( servers ) ){
    if( !CORE_INTERFACE.servers )
      CORE_INTERFACE.servers = {}
    
    for await ( const config of servers ){
      const { type, key } = config
      let server

      switch( type ){
        case 'http': server = await createHTTPServer( config as HTTPServerConfig ); break
        default: server = await createAuxiliaryServer( config as AuxiliaryServerConfig ); break
      }

      if( !server )
        throw new Error(`[${type.toUpperCase()} SERVER] - Unsupported`)

      CORE_INTERFACE.servers[`${type}:${key || 'default'}`] = server

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
  if( !Setup ) process.exit(1)
  
  const { typescript, directory } = Setup.getConfig()
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
        throw new Error(`Invalid entrypoint file path - ${directory.root}/${filename}`)
      
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