import type { Kenx } from '@ckenx/node'
import type { Config, SessionConfig, AssetConfig, RoutingConfig } from './types'
import type { NextFunction, Request, Response, Application } from 'express'
import { Router } from 'express'
import __init__ from './init'

export default class ExpressPlugin implements Kenx.ApplicationPlugin<Application> {
  readonly HOST: string
  readonly PORT: number
  readonly core: Application
  private readonly Setup: Kenx.SetupManager

  private AUTO_HANDLE_ERROR = true

  private async useSession( config?: SessionConfig ){
    if( !config?.plugin ) return

    const Plugin = await this.Setup.importPlugin( config.plugin )
    new Plugin( this.Setup, this, config )
  }

  private async useAssets( config?: AssetConfig ){
    if( !config?.plugin ) return

    const Plugin = await this.Setup.importPlugin( config.plugin )
    new Plugin( this.Setup, this, config )
  }

  private async useRoute( config?: RoutingConfig ){
    if( !config?.plugin ) return

    const Plugin = await this.Setup.importPlugin( config.plugin )
    new Plugin( this.Setup, this, config )
  }

  constructor( Setup: Kenx.SetupManager, config: Config ){
    this.HOST = config.HOST
    this.PORT = config.PORT

    if( !this.HOST || !this.PORT )
      throw new Error('Invalid configuration. Expecting <HOST>, <PORT>, <application>, ...')

    /**
     * Kenx Internal utils
     */
    this.Setup = Setup

    /**
     * Initialize application
     */
    this.core = __init__( this.PORT )

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
    this.useRoute( config.application?.routing )
  }

  register( middleware: any ){
    this.core.use( middleware )
    return this
  }

  decorate( attribute: string, value: any ){
    this.core[ attribute ] = value
    return this
  }

  addRouter( prefix: string, fn: any ){
    const router = Router()
    fn( router )

    this.core.use( prefix, router )
    return this
  }

  addHandler( type: string, func: any ){
    /*
     * Switch( type ){
     *   case 'middleware':
     *   default: this.core.use( func )
     * }
     */

    return this
  }

  private handleError( listener?: any ){
    this.core
    // Catch 404 and forward to error handler
    .use( ( req, res, next ) => {
      const error: any = new Error('Not Found')

      error.status = 404
      next( error )
    } )
    /*
     * Print error stacktrace at the backend and
     * render the related error page at the frontend
     */
    .use( ( error: any, req: Request, res: Response, next: NextFunction ) => {
      // No stacktraces leaked to user in production mode
      if( process.env.NODE_ENV === 'development' )
        console.error('[ERROR]: ', error )

      typeof listener == 'function' ?
                  // Handover error to listener
                  listener( error, req, res, next )
                  // Auto response with error
                  : res.status( error.status || 500 ).json( error )
    } )
  }

  onError( listener: ( error: Error, req: Request, res: Response, next: NextFunction ) => void ){
    this.AUTO_HANDLE_ERROR = false
    this.handleError( listener )

    return this
  }

  async serve( overhead?: boolean ): Promise<Kenx.ServerPlugin<Kenx.HTTPServer>>{
    // Automatically handle application errors occurence
    overhead
    && this.AUTO_HANDLE_ERROR
    && this.handleError()

    if( !this.Setup )
      throw new Error('Undefined Kenx Utils object supply')

    const
    HttpServer = await this.Setup.importPlugin('server:http'),
    server: Kenx.ServerPlugin<Kenx.HTTPServer> = new HttpServer( this.Setup, this )

    await server.listen({ PORT: this.PORT, HOST: this.HOST })
    return server
  }
}