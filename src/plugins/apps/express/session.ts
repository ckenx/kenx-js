import type { Express } from 'express'

export const create = async ( app: Express ) => {
  // Session management Configuration
  let sessionConfig = {
    secret: process.env.SESSION_ENCRYPT_SECRET,
    name: process.env.APPNAME +'-UISS',
    saveUninitialized: true,
    resave: false,
    cookie: {
      path: '/',
      httpOnly: true,
      secure: ( process.env.USER_AGENT_SECURE == 'true' ),
      maxAge: Number( process.env.SESSION_EXPIRY ) * 24 * 3600000 // session age per day
    }
  }

  /* Initialize Redis-server connection to manage session
    store in production
  */
  if( process.env.NODE_ENV == 'production' ){
    /*{
      host: process.env.REDIS_SERVER_HOST,
      port: Number( process.env.REDIS_SERVER_PORT ),
      username: process.env.REDIS_SERVER_USERNAME,
      password: process.env.REDIS_SERVER_PASSWORD
    }
    */
    const
    RedisStore = redisConnect( session ),
    RedisClient = redis.createClient( process.env.REDIS_SERVER_URL )

    RedisClient
    .on( 'connect', error => console.log('[REDIS] Connected to redis successfully') )
    .on( 'error', error => {
      console.log('['+ clc.red('ERROR') +'] Redis-Server Error: ', error )
      // process.exit(0)
    } )

    // Use different session name in production
    sessionConfig.name += '--PrSST'

    Object.assign( sessionConfig, { store: new RedisStore({ client: RedisClient, ttl: 86400 }) } )
  }
  // Cookie-parser is required in development mode
  else app.use( cookieParser( process.env.COOKIE_ENCRYPT_SECRET ) )

  app.use( session( sessionConfig ) )

}
