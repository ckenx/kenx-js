import { Router } from 'express'

export default ( app: Router, models: any ) => {
  app
  // Render text request
  .get('/', async ( req, res ) => {
    res.send(`Hello, ${req.session.name}!`)
  })

  // Make mongo database query
  .get('/user/:email', async ( req, res ) => {
    res.json( await req.app.models.getUser({ email: req.params.email }) )
  })

  // Test socket.io connection at http://localhost:8008/socket
  .get('/hello', async ( req, res ) => {
    res.send( req.app.views.index({ name: 'Bob' }) )
  })
}