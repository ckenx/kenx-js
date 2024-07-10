import { Express } from 'express'

export default async ( app: Express ) => {
  app
  .get('*', async ( req, res, next ) => {
    try {
      res.status(200)
        .set({ 'Content-Type': 'text/html' })
        .end( await req.render( req.originalUrl ) )
    }
    catch( error ) { next( error ) }
  })
}