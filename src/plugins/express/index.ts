import type { HTTPServerConfig } from '../../types'
import type { Ckenx } from '../../types/service'
import express, { Express, NextFunction, Request, Response } from 'express'
import http from 'http'
import cors from 'cors'
import logger from 'morgan'
import helmet from 'helmet'

function _init_( port: number ){
  /**
   * Instanciate an Express application
   */
  return express()
  
  /**
   * Server trust proxy configuration
   * 
   * TODO: 
   *  - Research and find all proxy strategies & implementations
   *  - Apply proxy configurations
   * 
   */
  .enable('trust proxy')
  .set('port', port )

  /**
   * Development logs
   * 
   * TODO:
   *  - Provide to developer to set their favorate customization of logger
   *  - Apply logger customization configurations
   *  - Set default logger and recommandations as well
   * 
   */
  .use( logger('dev') )

  /**
   * Security configuration
   * 
   * TODO:
   *  - Apply security configuration
   *  - Include CORS handler & configurations as well
   *  - Propose best security practices configuration recommendation
   * 
   */
  .use( helmet() )

  /**
   * Request Params, Query & Body parser
   * 
   * TODO: 
   *  - Apply parsing configuration
   *  - Add multi-part form-data handler
   * 
   */
  .use( express.json() ) // limit: '50mb', extended: true
  .use( express.urlencoded({ extended: true }) )
}

class HTTPServer implements Ckenx.ServerPlugin<Ckenx.HTTPServer> {
  private server: Ckenx.HTTPServer

  constructor( app?: Express ){
    this.server = http.createServer( app )
  
    /**
     * Event listener for HTTPS server event.
     */
    process.on('uncaughtException', ({ stack, message }: Error ) => console.error( 'Uncaught Exception at: %s - message: %s', stack, message ) )
    process.on('unhandledRejection', ({ stack, message }: Error ) => console.error( 'Unhandled Rejection at: %s - message: %s', stack, message ) )

    /* Listen on provided port, on all network interfaces. */
    this.server
    .on('error', ( error: any ) => {
      // handle specific listen errors with friendly messages
      switch( error.code ){
        case 'EACCES': console.error('Requires elevated privileges'); break
        case 'EADDRINUSE': console.error('Server PORT is already in use'); break
        default: console.error( error )
      }
    } )
  }

  listen( port: number, host?: string ): Promise<Ckenx.ActiveServerInfo | null> {
    return new Promise( ( resolve, reject ) => {
      if( !this.server )
        return reject('No HTTP Server')
    
      this.server.listen( port, host || '0.0.0.0', () => resolve( this.getInfo() ) )
    } )
  }

  close(){
    return new Promise( ( resolve, reject ) => {
      if( !this.server )
        return reject('No HTTP Server')
    
      this.server.close( ( error?: Error ) => error ? reject( error ) : resolve( true ) )
    } )
  }

  getInfo(): Ckenx.ActiveServerInfo | null {
    if( !this.server )
      throw new Error('No HTTP Server')

    const info = this.server.address()
    if( typeof info == 'string' ) return null

    return {
      type: 'express',
      ...info
    }
  }
}

export default class ExpressApp implements Ckenx.ApplicationPlugin<Express> {
  readonly HOST: string
  readonly PORT: number
  readonly app: Express

  private AUTO_HANDLE_ERROR = true
  
  constructor( httpServerConfig: HTTPServerConfig ){
    this.HOST = httpServerConfig.HOST
    this.PORT = httpServerConfig.PORT

    this.app = _init_( this.PORT )
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

    const server = new HTTPServer( this.app )
    await server.listen( this.PORT, this.HOST )

    return server
  }
}