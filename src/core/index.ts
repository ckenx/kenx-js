import type { Kenx } from '#types/service'
import type { HTTPServerConfig, AuxiliaryServerConfig, DatbaseConfig, JSObject } from '#types/index'
import dotenv from 'dotenv'
import SetupManager from '#core/setup'

/**
 * Kenx setup configuration
 * 
 */
const 
Setup = new SetupManager(),

/**
 * Auto-loaded services 
 * 
 */
SERVICES: Kenx.Services = {}

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
      instance: Kenx.ApplicationPlugin<Kenx.HTTPServer> = new App( Setup, config )

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
    instance: Kenx.ServerPlugin<Kenx.HTTPServer> = new HttpServer( Setup )

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
    instance: Kenx.ServerPlugin<any> = new AuxServer( Setup, options )

    /**
     * Bind server
     * 
     * - To HTTP Server with a given `key` or default
     * - To PORT
     */
    const binder = bindTo ? SERVICES[ bindTo ].server : config.PORT
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

async function createResource( type: string, config: any ){
  try {
    if( ['server', 'app'].includes( type ) )
      throw new Error(`<${type}:> is not a resource. Expected <database:>, <worker:>, ...`)

    const Resource = await Setup.importPlugin(`${type}:${config.type}`)
    return new Resource( Setup, config )
  }
  catch( error ){
    console.error(`[${type.toUpperCase()} RESOURCE] -`, error )
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
  const { servers, databases } = Setup.getConfig()

  /**
   * Connect to databases
   * 
   */
  if( Array.isArray( databases ) ){
    for await ( const config of databases ){
      const { type, key } = config
      let database = await createResource('database', config as DatbaseConfig )
      if( !database )
        throw new Error(`[${type.toUpperCase()} DATABASE] - Unsupported`)

      SERVICES[`database:${key || 'default'}`] = database

      // Establish connection to the database during deployement
      config.autoconnect && await database.connect()
      
      console.log(`[${type.toUpperCase()} DATABASE] - ${config.autoconnect ? 'connected' : 'mounted'} \t[${config.uri || config.options?.host}]`)
    }
  }

  /**
   * Load configured servers
   * 
   */
  if( Array.isArray( servers ) ){
    for await ( const config of servers ){
      const { type, key } = config
      let server

      switch( type ){
        case 'http': server = await createHTTPServer( config as HTTPServerConfig ); break
        default: server = await createAuxiliaryServer( config as AuxiliaryServerConfig ); break
      }

      if( !server )
        throw new Error(`[${type.toUpperCase()} SERVER] - Unsupported`)

      SERVICES[`${type}:${key || 'default'}`] = server

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
export const dispatch = async () => {
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

      if( !Array.isArray( entrypoint.takeover ) )
        throw new Error('No entrypoint <takeover> export')
      
        const group: JSObject<string[]> = {}

        entrypoint.takeover.forEach( ( attribute: string ) => {
          attribute = !attribute.includes(':') ? `${attribute}:default` : attribute
          
          const [ section, key ] = attribute.split(':')
          if( !section || !key ) return

          !group[ section ] ?
                group[ section ] = [ key ]
                : group[ section ].push( key )
        } )
        
        const Args: any = []

        Object.entries( group )
        .map( ([ section, array ], index ) => {
          if( !array.length ){
            Args[ index ] = undefined
            return
          }

          if( array.length == 1 ){
            const key = array[0]

            // Return resource group
            if( key == '*' ){
              Args[ index ] = {}
              Object.entries( SERVICES )
                    .map( ([ attribute, value ]) => {
                      const [ _section, _key ] = attribute.split(':')
                      if( _section && _key && _section == section ) Args[ index ][ _key ] = value
                    })
            }
            else Args[ index ] = SERVICES[`${section}:${key}`]

            return
          }
          else {
            Args[ index ] = {}
            array.forEach( key => {
              Object.entries( SERVICES )
                  .map( ([ attribute, value ]) => {
                    const [ _section, key ] = attribute.split(':')
                    if( attribute == `${section}:${key}` ) Args[ index ][ key ] = value
                  })
            } )
          }
        } )
        
        /**
         * Give access to all loaded services
         *  - Apps
         *  - Servers
         *  - Databases
         *  - ...
         */
        entrypoint.default( ...Args )
    }
    catch( error ){ console.log('[PROJECT ENTRYPOINT] -', error ) }
  }
}