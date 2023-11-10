import type { HTTPServerConfig, ApplicationSessionConfig, ApplicationAssetConfig, ApplicationApiComplianceConfig } from '#types/index'
import type { Kenx } from '#types/service'
import type { FastifyInstance } from 'fastify'
import __init__ from './init'
import { ApplicationHook, LifecycleHook } from 'fastify/types/hooks'

class Server implements Kenx.ServerPlugin<Kenx.HTTPServer> {
  readonly app: Kenx.ApplicationPlugin<FastifyInstance>
  readonly server: Kenx.HTTPServer
  private readonly options: HTTPServerConfig

  constructor( app: Kenx.ApplicationPlugin<FastifyInstance>, options: HTTPServerConfig ){
    this.app = app
    this.options = options
    this.server = app.core.server
  }
  async listen(){
    if( !this.app || !this.options )
      throw new Error('No HTTP Server')

    if( !this.server.listening ){
      const { PORT, HOST } = this.options
      await this.app.core.listen({ port: PORT, host: HOST })
    }

    return this.getInfo()
  }
  async close(){
    await this.app.core.close()
    return this
  }
  getInfo(): Kenx.ActiveServerInfo | null {
    if( !this.app )
      throw new Error('No HTTP Server')

    const info = this.server.address()
    if( typeof info == 'string' ) return null

    return {
      type: 'fastify',
      ...info
    }
  }
}

export default class FastifyPlugin implements Kenx.ApplicationPlugin<FastifyInstance> {
  readonly HOST: string
  readonly PORT: number
  readonly core: FastifyInstance
  private readonly Setup: Kenx.SetupManager

  private AUTO_HANDLE_ERROR = true
  
  private async useSession( config?: ApplicationSessionConfig ){
    if( !config ) return

    const Plugin = await this.Setup.importPlugin(`app:${config.plugin || '@fastify/session'}`)
    new Plugin( this.Setup, this, config )
  }

  private async useAssets( config?: ApplicationAssetConfig ){
    if( !config ) return

    const Plugin = await this.Setup.importPlugin(`app:${config.plugin || '@fastify/assets'}`)
    new Plugin( this.Setup, this, config )
  }

  private async useAPICompliance( config?: ApplicationApiComplianceConfig ){
    if( !config ) return

    const Plugin = await this.Setup.importPlugin(`app:${config.plugin || '@fastify/api-compliance'}`)
    new Plugin( this.Setup, this, config )
  }

  constructor( Setup: Kenx.SetupManager, httpServerConfig: HTTPServerConfig ){
    this.HOST = httpServerConfig.HOST
    this.PORT = httpServerConfig.PORT

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
    this.useSession( httpServerConfig.application?.session )
    
    /**
     * Initialize and manage application assets
     */
    this.useAssets( httpServerConfig.application?.assets )
    
    /**
     * Initialize api compliances features
     */
    this.useAPICompliance( httpServerConfig.application?.api )
  }

  register( plugin: any, options?: any ){
    this.core.register( plugin, options )
    return this
  }

  decorate( attribute: string, value: any ){
    this.core.decorate( attribute, value )
    return this
  }

  addRouter( prefix: string, route: ( app: FastifyInstance ) => Promise<void> ){
    this.core.register( route, { prefix } )
    return this
  }

  addHandler( type: string, func: any ){
    switch( type ){
      // case 'ready':
      // case 'after':
      // case 'before': this.core.before( func ); break
      case 'onRequest':
      case 'preHandler': 
      default: this.core.addHook( type as ApplicationHook | LifecycleHook, func )
    }

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

  async serve( overhead?: boolean ): Promise<Kenx.ServerPlugin<Kenx.HTTPServer>> {
    // Automatically handle application errors occurence
    overhead
    && this.AUTO_HANDLE_ERROR
    && this.handleError()
    
    if( !this.Setup )
      throw new Error('Undefined Kenx Utils object supply')

    const server = new Server( this, { type: 'http', PORT: this.PORT, HOST: this.HOST })
    // await server.listen({ port: this.PORT, host: this.HOST })

    return server
  }
}