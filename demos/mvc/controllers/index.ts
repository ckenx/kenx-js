import type { Kenx } from '#types/service'
import type http from 'http'
import type io from 'socket.io'
import users from './users'

export const takeover = ['http', 'socketio']
export default ({ app }: Kenx.ServerPlugin<http.Server>, io: io.Server, models: any, views?: any ) => {
  if( !app ) return

  app
  // Decorate application with socket.io server interface
  .decorate('io', io )
  // Decorate application with models
  .decorate('models', models )
  
  // Decorate application with views
  views && app.decorate('views', views )

  app
  // Register express routes
  .addRouter('/', users )
  // Handle application exception errors
  .onError( ( error: Error, req, res, next ) => {
    console.log( error )
    res.status(500).send( error )
  })
}