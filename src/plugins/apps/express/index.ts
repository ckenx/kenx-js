import type { HTTPServerConfig } from '#types/index'
import type { Ckenx } from '#types/service'
import type { Express, NextFunction, Request, Response } from 'express'
import __session__ from './session'
import __init__ from './init'

export default class ExpressApp implements Ckenx.ApplicationPlugin<Express> {
  readonly HOST: string
  readonly PORT: number
  readonly app: Express
  private readonly KManager: Ckenx.Manager

  private AUTO_HANDLE_ERROR = true
  
  constructor( kxm: Ckenx.Manager, httpServerConfig: HTTPServerConfig ){
    this.HOST = httpServerConfig.HOST
    this.PORT = httpServerConfig.PORT

    if( !this.HOST || !this.PORT )
      throw new Error('Invalid configuration. Expecting <HOST>, <PORT>, <application>, ...')

    /**
     * Ckenx Internal utils
     */
    this.KManager = kxm

    /**
     * Initiliaze application
     */
    this.app = __init__( this.PORT )
    
    /**
     * Initiliaze and manage application session
     */
    if( httpServerConfig.application?.session ){
      const extendedApp = __session__( this.app, httpServerConfig.application.session )
      if( extendedApp ) this.app = extendedApp
    }
  }

  use( fn: any ){
    this.app.use( fn )

    return this
  }

  addRouter( prefix: string, router: any ){
    this.app.use( prefix, router )

    return this
  }

  addHandler( type: string, func: any ){
    // switch( type ){
    //   case 'plugin': this.app.register( func ); break
    //   default: this.app.addHook( type, func )
    // }

    return this
  }

  private handleError( listener?: any ){
    this.app
    // catch 404 and forward to error handler
    .use( ( req, res, next ) => {
      let error: any = new Error('Not Found')
      
      error.status = 404
      next( error )
    } )
    // Print error stacktrace at the backend and
    // render the related error page at the frontend
    .use( ( error: any, req: Request, res: Response, next: NextFunction ) => {
      // no stacktraces leaked to user in production mode
      if( process.env.NODE_ENV === 'development' )
        console.error('[ERROR]: ', error )
      
      typeof listener == 'function' ?
                  // Handover error to listener
                  listener( error )
                  // Auto response with error
                  : res.status( error.status || 500 ).json( error )
    } )
  }

  onError( listener: ( error: Error ) => void ){
    this.AUTO_HANDLE_ERROR = false
    this.handleError( listener )

    return this
  }

  async serve(): Promise<Ckenx.ServerPlugin<Ckenx.HTTPServer>> {
    // Automatically handle application errors occurence
    this.AUTO_HANDLE_ERROR && this.handleError()
    
    if( !this.KManager )
      throw new Error('Undefined Ckenx Utils object supply')

    const
    HttpServer = await this.KManager.importPlugin('server:http'),
    server: Ckenx.ServerPlugin<Ckenx.HTTPServer> = new HttpServer( this.KManager, this.app )

    await server.listen({ PORT: this.PORT, HOST: this.HOST })
    return server
  }
}