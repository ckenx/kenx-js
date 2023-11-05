import type { Express } from 'express'
import type { ApplicationSessionConfig, ApplicationSessionStore } from '#types/index'
import { createClient } from 'redis'
import cookie from 'cookie-parser'
import RedisStore from 'connect-redis'
import session, { SessionOptions } from 'express-session'

function addInMemory( app: Express, options: SessionOptions ): Express {
  // Cookie-parser is required in development mode
  app
  .use( cookie(`${options.secret}-<TEMPFIX>`) )
  .use( session( options ) )

  return app
}

/**
 * Initialize Redis-server connection to 
 * manage session store
 */
function addRedisStore( app: Express, storeConfig: ApplicationSessionStore, options: SessionOptions ): Express {
  // Initialize client
  const client = createClient()
  client
  .connect()
  .catch( ( error : Error ) => console.log('[ERROR] Redis-Server Error: ', error ) )

  // Initialize store
  const store = new RedisStore({
    client,
    ttl: 86400,
    ...storeConfig.options
  })
  
  app.use( session({
    ...options,
    store,
    resave: false, // required: force lightweight session keep alive (touch)
    saveUninitialized: false, // recommended: only save session when data exists
  }) )

  return app
}

export default ( app: Express, configsByEnv: ApplicationSessionConfig ): Express => {
  /**
   * Create session by env mode
   * - allenv
   * - development
   * - production
   */
  const config = configsByEnv[(process.env.NODE_ENV as 'development' | 'production') || 'allenv']
  if( !config )
    throw new Error(`Undefined <${process.env.NODE_ENV}> or <allenv> session configuration`)

  /**
   * Use runtime in-menory storage
   * and cookie.
   */
  if( config.type == 'in-memory' )
    app = addInMemory( app, config.options as SessionOptions )

  /**
   * Use database store
   */
  else if( config.type == 'store' ){
    if( !config.store )
      throw new Error('Undefined express session store configuration')

    switch( config.store.provider ){
      case 'redis-store': return app = addRedisStore( app, config.store, config.options as SessionOptions ); break
      // case 'mongo-store': break
      // case 'mysql-store': break
      // case 'postgress-store': break
    }
  }

  return app
}
