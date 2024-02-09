import type {
  JSObject,
  Resources,
  HTTPServer,
  ServerPlugin,
  DatabaseConfig,
  ResourceConfig,
  HTTPServerConfig,
  ApplicationPlugin,
  AuxiliaryServerConfig
} from '#types/index'
import dotenv from 'dotenv'
import SetupManager from './setup'

/**
 * Kenx setup configuration
 *
 */
const
Setup = new SetupManager(),

/**
 * Auto-loaded resources
 *
 */
RESOURCES: Resources = {}

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
  if( config.application?.type ) {
    try {
      const
      App = await Setup.importPlugin( config.application.plugin ),
      instance: ApplicationPlugin<HTTPServer> = new App( Setup, config )

      return await instance.serve()
    }
    catch( error ) {
      Setup.context.error('HTTP server application:', error )
      process.exit(1)
    }
  }

  // Create default HTTP server
  else try {
    if( !config.plugin )
      throw new Error(`Undefined <${config.type || 'http'}> server plugin`)

    const
    HttpServer = await Setup.importPlugin( config.plugin ),
    instance: ServerPlugin<HTTPServer> = new HttpServer( Setup )

    await instance.listen( config )
    return instance
  }
  catch( error ) {
    Setup.context.error('HTTP server:', error )
    process.exit(1)
  }
}

async function createAuxiliaryServer( config: AuxiliaryServerConfig ){
  try {
    if( !config.plugin )
      throw new Error(`Undefined <${config.type || 'auxiliary'}> server plugin`)

    const { plugin, bindTo, PORT, options } = config
    config.PORT = PORT || Number( process.env.HTTP_PORT )

    const
    AuxServer = await Setup.importPlugin( plugin ),
    instance: ServerPlugin<any> = new AuxServer( Setup, options )

    /**
     * Bind server
     *
     * - To HTTP Server with a given `key` or default
     * - To PORT
     */
    const binder = bindTo ? RESOURCES[ bindTo ] : config
    if( !binder )
      throw new Error('Undefined BIND_TO or PORT configuration')

    await instance.listen( binder )
    return instance
  }
  catch( error ) {
    Setup.context.error('Auxiliary server:', error )
    process.exit(1)
  }
}

async function createResource( config: ResourceConfig ){
  try {
    const Resource = await Setup.importPlugin( config.plugin )
    return new Resource( Setup, config )
  }
  catch( error ) {
    Setup.context.error(`${config.type.toUpperCase()} resource:`, error )
    process.exit(1)
  }
}

function getResource( arg: string | string[] ){
  if( typeof arg == 'string' )
    arg = [ arg ]

  const group: JSObject<string[]> = {}

  arg.forEach( ( attribute: string ) => {
    attribute = !attribute.includes(':') ? `${attribute}:default` : attribute

    const [ section, key ] = attribute.split(':')
    if( !section || !key ) return

    !group[ section ] ?
          group[ section ] = [ key ]
          : group[ section ].push( key )
  } )

  const resources: any = {}

  Object
  .entries( group )
  .map( ([ section, array ]) => {
    if( !array.length ) {
      resources[ section ] = undefined
      return
    }

    if( array.length == 1 ) {
      const key = array[0]

      // Return resource group
      if( key == '*' ) {
        resources[ section ] = {}
        Object
        .entries( RESOURCES )
        .map( ([ attribute, value ]) => {
          const [ _section, _key ] = attribute.split(':')
          if( _section && _key && _section == section ) resources[ section ][ _key ] = value
        })
      }
      else resources[ section ] = RESOURCES[`${section}:${key}`]
    }
    else {
      resources[ section ] = {}
      array.forEach( ( key: string ) => {
        Object
        .entries( RESOURCES )
        .map( ([ attribute, value ]) => {
          // Const [ _, _key ] = attribute.split(':')
          if( attribute == `${section}:${key}` ) resources[ section ][ key ] = value
        })
      } )
    }
  } )

  return resources
}

async function toSingleton( takeover?: string[] ){
  try {
    let entrypoint = await Setup.importModule('./', true )
    if( !entrypoint )
      throw new Error('No entrypoint file found')

    // Regular JS import module object structure
    if( typeof entrypoint.default === 'object' )
      entrypoint = entrypoint.default

    // Run plain script
    if( typeof entrypoint.default !== 'function' ) return

    takeover = Array.isArray( entrypoint.takeover )
                && entrypoint.takeover.length ?
                                  entrypoint.takeover // First option: Entrypoint takeover
                                  : takeover // Second option: Autorun takeover

    if( !Array.isArray( takeover ) )
      throw new Error('No entrypoint <takeover> export')

    /**
     * Give access to specified/default loaded resources
     *  - Apps
     *  - Servers
     *  - Databases
     *  - ...
     */
    const Args = Object.values( getResource( takeover ) )

    Setup.context.log('Takeover ...')
    entrypoint.default( ...Args )
  }
  catch( error ) {
    Setup.context.error('project entrypoint:', error )
    process.exit(1)
  }
}

async function toMVC(){
  try {
    /**
     * Load models
     */
    const mFactory = await Setup.importModule('./models', true )
    if( !mFactory || typeof mFactory.default !== 'function' )
      throw new Error('Invalid models index. Expected default export')

    /**
     * Auto-assign mounted database to models factory
     */
    const mFactoryDeps = getResource( mFactory.takeover || 'database:*' )
    if( !mFactoryDeps ) Setup.context.warn('No takeover dependency available for <models>')

    const models = mFactory.default( ...Object.values( mFactoryDeps ) )

    /**
     * Load views (Optional)
     */
    let views
    const vFactory = await Setup.importModule('./views')
    if( vFactory ) {
      if( typeof vFactory.default !== 'function' )
        throw new Error('Invalid views index. Expected default export')

      let vFactoryDeps = {}
      if( vFactory.takeover )
        vFactoryDeps = getResource( vFactory.takeover )

      views = vFactory.default( ...Object.values( vFactoryDeps ) )
    }

    /**
     * Load controllers
     */
    const cFactory = await Setup.importModule('./controllers', true )
    if( !cFactory || typeof cFactory.default !== 'function' )
      throw new Error('Invalid controllers index. Expected default export')

    /**
     * Auto-assign loaded resources
     * to controller factory
     */
    const cFactoryDeps = getResource( cFactory.takeover || 'http:*')

    if( !cFactoryDeps ) Setup.context.warn('No resource available for <controllers>')
    if( !models ) Setup.context.warn('No models available for <controllers>')
    if( !views ) Setup.context.warn('No views available for <controllers>')

    Setup.context.log('Takeover ...')
    cFactory.default( ...Object.values( cFactoryDeps ), models, views )
  }
  catch( error ) {
    Setup.context.error('MVC pattern:', error )
    process.exit(1)
  }
}

export default class Core {

  constructor(){
    /**
     * Minumum NodeJS version required
     * v16+ supported from the fist version of
     * kenx framework.
     */
    const nodeVersionMajor = parseInt( process.version.split('.')[0].replace('v', '') )

    if( nodeVersionMajor < 16 ) {
      console.log(`Please use Node.js version 16.x or above. Current version: ${nodeVersionMajor}`)
      process.exit(2)
    }

    require.main == module && process.exit(0)
  }

  async autoload(): Promise<void>{
    /**
     * Load Environment Variables
     *
     */
    process.env.NODE_ENV == 'development' ?
            dotenv.config({ path: `${process.cwd()}/.env.local` }) // Load local environment variables
            : dotenv.config() // Load default .env variables

    /**
     * Load setup configuration
     *
     */
    await Setup.initialize()
    const { servers, databases } = Setup.getConfig()

    /**
     * Connect to databases
     *
     */
    if( Array.isArray( databases ) )
      for await ( const config of databases ) {
        const database = await createResource( config as DatabaseConfig )
        if( !database ) {
          console.error(`<${config.type} database> is not supported`)
          process.exit(1)
        }

        RESOURCES[`database:${config.key || 'default'}`] = database

        // Establish connection to the database during deployement
        config.autoconnect && await database.connect()

        console.log(`<${config.type} database> ${config.autoconnect ? 'connected' : 'mounted'} \t[${config.uri || config.options?.host}]`)
      }

    /**
     * Load configured servers
     *
     */
    if( Array.isArray( servers ) )
      for await ( const config of servers ) {
        const { type, key } = config
        let server

        switch( type ) {
          case 'http': server = await createHTTPServer( config as HTTPServerConfig ); break
          default: server = await createAuxiliaryServer( config as AuxiliaryServerConfig ); break
        }

        if( !server ) {
          console.error(`<${type} server> is not supported`)
          process.exit(1)
        }

        RESOURCES[`${type}:${key || 'default'}`] = server

        const info = server.getInfo()
        if( !info ) {
          Setup.context.error('Server returns no information')
          process.exit(1)
        }

        console.log(`<${type.toUpperCase()} server> - running \t[PORT=${info.port}]`)
      }
  }

  /**
   * Initialize and run project
   *
   * @type {object} config
   * @return {module} Defined setup `object` or `null` if not found
   *
   */
  async dispatch( takeover?: string [] ){
    // Assumed `autoload` method has resolved
    Setup ?
      Setup.context.log('Ready')
      : process.exit(1)

    const { directory } = Setup.getConfig()
    switch( directory.pattern ) {
      /**
       * MVC entrypoints project structure
       *
       * path:
       *  - models: `<base>/models`
       *  - views: `<base>/views`
       *  - controllers: `<base>/controllers`
       */
      case 'mvc': toMVC(); break

      /**
       * Single entrypoint project structure
       *
       * path: `<base>/index.ts` or .js
       */
      default: toSingleton( takeover )
    }
  }
}