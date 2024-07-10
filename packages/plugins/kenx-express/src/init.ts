import hpp from 'hpp'
import logger from 'morgan'
import helmet from 'helmet'
import express from 'express'

export default ( port: number ) => {
  /**
   * Instanciate an Express application
   */
  return express()

  /**
   * Application settings
   */
  .set('x-powered-by', false )
  .set('env', process.env.NODE_ENV )
  .set('port', port )

  /**
   * Server trust proxy configuration
   *
   * TODO:
   *  - Research and find all proxy strategies & implementations
   *  - Apply proxy configurations
   *
   */
  .enable('trust proxy')

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
  .use( helmet({
    contentSecurityPolicy: {
        directives: {
            connectSrc: ["'self'", "'unsafe-inline'"],
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
            baseUri: ["'self'"],
            fontSrc: ["'self'", 'https:', 'data:']
        }
    }
  }) )

  /**
   * Request Params, Query & Body parser
   *
   * TODO:
   *  - Apply parsing configuration
   *  - Add multi-part form-data handler
   *
   */
  .use( express.json() ) // Limit: '50mb', extended: true
  .use( express.urlencoded({ extended: true }) )


  /**
   * Protect from HTTP parameter pollution attacks
   */
  .use( hpp() )
}