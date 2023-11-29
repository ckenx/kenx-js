import type { ServerPlugin, DatabasePlugin } from '../../../packages/node/dist/types'
import type http from 'http'
import type io from 'socket.io'
import routes from './routes'

// Export const takeover = ['http', 'socketio', 'database:*']

export default ( http: ServerPlugin<http.Server>, io: io.Server, databases: { [index: string]: DatabasePlugin<any> } ) => {
  if( !http ) return

  const { app } = http
  if( !app ) return

  app
  // Attach socket.io server interface to application
  .attach('io', io )
  // Attach database to application
  .attach('db', databases.default.getConnection() )

  /*
   * Add express middleware
   * .register( ( req: any, res: any, next: any ) => {
   *   console.log('-- Middleware --')
   */

  /*
   *   // Test session
   *   req.session.name = 'Bob'
   */

  /*
   *   Next()
   * })
   */

  // Add fastify middleware
  .use( async ( req: any, res: any ) => {
    console.log('-- Middleware --')

    // Test session
    req.session.name = 'Bob'
  })

  // Register express routes
  .router('/', routes )

  // Handle application exception errors
  .onError( ( error: Error, req, res ) => {
    console.log( error )
    res.status(500).send( error )
  })

  http.listen( true )
}