import type { Kenx } from '../../../packages/node/src/types/resource'
import type http from 'http'
import type io from 'socket.io'
import routes from './routes'

// Export const takeover = ['http', 'socketio', 'database:*']

export default ( http: Kenx.ServerPlugin<http.Server>, io: io.Server, databases: { [index: string]: Kenx.DatabasePlugin<any> } ) => {
  if( !http ) return

  const { app } = http
  if( !app ) return

  app
  // Decorate application with socket.io server interface
  .decorate('io', io )
  // Decorate application with default database
  .decorate('mongodb', databases.default.getConnection() )

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
  .addHandler('onRequest', async ( req: any, res: any ) => {
    console.log('-- Middleware --')

    // Test session
    req.session.name = 'Bob'
  })

  // Register express routes
  .addRouter('/', routes )

  // Handle application exception errors
  .onError( ( error: Error, req, res, next ) => {
    console.log( error )
    res.status(500).send( error )
  })

  http.listen( true )
}