import type { ApplicationPlugin, SetupManager } from '@ckenx/node'
import type { Application } from 'express'
import type { SessionConfig, SessionStore } from './types'
import { createClient } from 'redis'
import Cookie from 'cookie-parser'
import RedisStore from 'connect-redis'
import Session, { SessionOptions } from 'express-session'

export default class ExpressSessionPlugin {
  private readonly setup: SetupManager
  private readonly app: ApplicationPlugin<Application>

  private addInMemory( options: SessionOptions ){
    // Cookie-parser is required in development mode
    this.app
    .use( Cookie(`${options.secret}-<TEMPFIX>`) )
    .use( Session( options ) )
  }

  /**
   * Initialize Redis-server connection to
   * manage session store
   */
  private addRedisStore( storeConfig: SessionStore, options: SessionOptions ){
    // Initialize client

    // TODO: Connect to database
    const client = createClient()

    client
    .connect()
    .catch( ( error : Error ) => console.log('[ERROR] Redis-Server Error: ', error ) )

    // Initialize store
    const handler = Session({
      ...options,
      store: new RedisStore({
        client,
        ttl: 86400,
        ...storeConfig.options
      }),
      resave: false, // Required: force lightweight session keep alive (touch)
      saveUninitialized: false, // Recommended: only save session when data exists
    })

    this.app.use( handler )
  }

  constructor( Setup: SetupManager, app: ApplicationPlugin<Application>, sessionConfig: SessionConfig ){
    this.setup = Setup
    this.app = app

    /**
     * Create session by env mode
     * - allenv
     * - development
     * - production
     */
    const config = sessionConfig[(process.env.NODE_ENV as 'development' | 'production') || 'allenv']
    if( !config )
      throw new Error(`Undefined <${process.env.NODE_ENV}> or <allenv> session configuration`)

    /**
     * Use runtime in-menory storage
     * and cookie.
     */
    if( config.type == 'in-memory' )
      this.addInMemory( config.options as SessionOptions )

    /**
     * Use database store
     */
    else if( config.type == 'store' ) {
      if( !config.store )
        throw new Error('Undefined express session store configuration')

      switch( config.store.provider ) {
        case 'redis-store': this.addRedisStore( config.store, config.options as SessionOptions ); break
        /*
         * Case 'mongo-store': break
         * case 'mysql-store': break
         * case 'postgress-store': break
         */
      }
    }
  }
}