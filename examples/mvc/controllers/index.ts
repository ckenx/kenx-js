import type { ServerPlugin } from '../../../packages/node/dist/types'
import type http from 'http'
import type io from 'socket.io'
import users from './users'

export const takeover = ['http', 'socketio']
export default ({ app }: ServerPlugin<http.Server>, io: io.Server, models: any, views?: any ) => {
  if( !app ) return

  app
  .attach('io', io )
  .attach('models', models )

  // Attach views handler to application
  views && app.attach('views', views )

  app
  // Register express routes
  .router('/', users )
  // Handle application exception errors
  .onError( ( error: Error, req, res ) => {
    console.log( error )
    res.status(500).send( error )
  })
}