import type { Kenx } from '#types/service'
import type { Server } from 'http'
import routes from './routes'

export const takeover = ['http', 'database:*']
export default ( http: Kenx.ServerPlugin<Server>, databases: { [index: string]: Kenx.DatabasePlugin<any> } ) => {
  if( !http ) return
  
  const { app } = http
  if( !app ) return

  app
  // Decorate application with default database
  .decorate('mongodb', databases.default.getConnection() )

  // Add express middleware
  .addHandler('middleware', ( req: any, res: any, next: any ) => {
    console.log('-- Middleware --')

    // Test session
    req.session.name = 'Bob'
    
    next()
  })

  // Register express routes
  .addRouter('/', routes )

  // Handle application exception errors
  .onError( ( error: Error, req, res, next ) => {
    console.log( error )
    res.status(500).send( error )
  })
}