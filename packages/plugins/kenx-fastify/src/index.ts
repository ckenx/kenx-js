import type { ServerPlugin, ApplicationPlugin, SetupManager, HTTPServer } from '@ckenx/node'
import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import type { Config, RoutingConfig, SessionConfig, AssetConfig, JSObject } from './types'
import EventEmitter from 'events'
import __init__ from './init'
import FServer from './server'

export default class FastifyPlugin extends EventEmitter implements ApplicationPlugin<FastifyInstance> {
  readonly HOST: string
  readonly PORT: number
  readonly core: FastifyInstance
  private readonly Setup: SetupManager

  private AUTO_HANDLE_ERROR = true

  private async useSession( config?: SessionConfig ){
    if( !config ) return

    const Plugin = await this.Setup.importPlugin( config.plugin || '@ckenx/kenx-fastify-session' )
    new Plugin( this.Setup, this, config )
  }

  private async useAssets( config?: AssetConfig ){
    if( !config ) return

    const Plugin = await this.Setup.importPlugin( config.plugin || '@ckenx/kenx-fastify-assets' )
    new Plugin( this.Setup, this, config )
  }

  private async useRouting( config?: RoutingConfig ){
    if( !config ) return

    const Plugin = await this.Setup.importPlugin( config.plugin || '@ckenx/kenx-routing' )
    new Plugin( this.Setup, this, config )
  }

  private eventListeners(){
    this.core
    .addHook('onRequest', ( ...args ) => this.emit('request', ...args ) )
    .addHook('onReady', ( ...args ) => this.emit('ready', ...args ) )
  }

  constructor( Setup: SetupManager, config: Config ){
    super()

    this.HOST = config.HOST
    this.PORT = Number( config.PORT )

    if( !this.HOST || !this.PORT )
      throw new Error('Invalid configuration. Expecting <HOST>, <PORT>, <application>, ...')

    /**
     * Kenx Internal utils
     */
    this.Setup = Setup

    /**
     * Initialize application
     */
    this.core = __init__()

    /**
     * Initialize and manage application session
     */
    this.useSession( config.application?.session )

    /**
     * Initialize and manage application assets
     */
    this.useAssets( config.application?.assets )

    /**
     * Initialize routing features
     */
    this.useRouting( config.application?.routing )

    /**
     * Setup on-* event listener & trigger
     */
    this.eventListeners()
  }

  register( plugin: FastifyPluginAsync, options?: JSObject<unknown> ){
    this.core.register( plugin, options )
    return this
  }

  use( fn: any, type?: string ){
    switch( type ) {
      /*
       * Case 'ready':
       * case 'after':
       * case 'before': this.core.before( func ); break
       */
      case 'prehandler': this.core.addHook('preHandler', fn ); break
      case 'prevalidation': this.core.addHook('preValidation', fn ); break
      case 'middleware':
      default: this.core.addHook('onRequest', fn )
    }

    return this
  }

  attach( attribute: string, value: unknown ){
    this.core.decorate( attribute, value )
    return this
  }

  router( prefix: string, route: ( app: FastifyInstance ) => Promise<void> ){
    this.core.register( route, { prefix } )
    return this
  }

  private handleError( listener?: any ){
    this.core
    // Not Found
    .setNotFoundHandler( ( req, rep ) => {
      typeof listener == 'function' ?
                  // Handover error to listener
                  listener( new Error('Not Found'), req, rep )
                  // Auto response with error
                  : rep.code( 404 ).send({ error: true, status: 'ERROR::NOT_FOUND', message: 'Not Found' })
    })
    // General Scope Error handler
    .setErrorHandler( ( error, req, rep ) => {
      // Log Error to console in development mode
      process.env.NODE_ENV === 'development' && console.error( error )

      // Then format API Error response
      let { statusCode, message } = error

      statusCode = statusCode || rep.statusCode || 500
      message = message || `[API] Unknown Error - ${statusCode}`

      typeof listener == 'function' ?
                  // Handover error to listener
                  listener( error, req, rep )
                  // Auto response with error
                  : rep.code( statusCode ).send({ error: true, status: `ERROR::${statusCode}`, message })
    })
  }

  onError( listener: ( error: Error, req: Request, rep: Response ) => void ){
    this.AUTO_HANDLE_ERROR = false
    this.handleError( listener )

    return this
  }

  async serve( overhead?: boolean ): Promise<ServerPlugin<HTTPServer>>{
    // Automatically handle application errors occurence
    overhead
    && this.AUTO_HANDLE_ERROR
    && this.handleError()

    if( !this.Setup )
      throw new Error('Undefined Kenx Utils object supply')

    return new FServer( this, { port: this.PORT, host: this.HOST })
  }
}