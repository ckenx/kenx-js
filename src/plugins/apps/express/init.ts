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


  /**
   * Protect from HTTP parameter pollution attacks
   */
  .use( hpp() )
}