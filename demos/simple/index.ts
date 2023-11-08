import type { MongoClient } from 'mongodb'
import type { Kenx } from '#types/service'
import routes from './routes'

export const takeover = ['http', 'database']

export default ({ http, database }: Kenx.Takeover<http.Server, MongoClient> ) => {
  if( !http ) return

  const { app } = servers['http:default']
  if( !app ) return

  app
  .use( ( req: any, res: any, next: any ) => {
    console.log('Call here....')

    // Test session
    req.session.name = 'Bob'
    
    next()
  } )

  .addRouter('/', routes )

  .onError( ( error: Error, req, res, next ) => {
    console.log( error )
    res.status(500).send( error )
  })
}