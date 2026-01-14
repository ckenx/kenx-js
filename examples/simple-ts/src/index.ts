import type { ServerPlugin, DatabasePlugin } from '../../../packages/node/dist/types'
import type http from 'http'
import type io from 'socket.io'
import type { ViteDevServer } from 'vite'
import UI from '#routes/ui'
import routes from '#routes/index'

export const takeover = ['http', 'vite', 'socketio', 'database:*']

export default async ( http: ServerPlugin<http.Server>, vite: ServerPlugin<ViteDevServer>, io: io.Server, databases: { [index: string]: DatabasePlugin<any> } ) => {
  if( !http ) return

  const { app } = http
  if( !app ) return

  app
  // Attach socket.io server interface to application
  .attach('io', io )
  // Attach database to application
  .attach('db', databases.default.getConnection() )
  // Attach vite server to application
  .attach('vite', vite.server )

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
  .use( async ( req: any, res: any, next: any ) => {
    console.log('-- Middleware --')
    // Test session
    // req.session.name = 'Bob'
    next()
  })

  // Register express routes
  .router('/', UI )
  .router('/', routes )

  // Handle application exception errors
  .onError( ( error: Error, req, res ) => {
    console.log( error )
    res.status(500).send( error )
  })

  await http.listen( true )
}