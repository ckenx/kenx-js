
const routes = require('./routes')

// Export const takeover = ['http', 'socketio', 'database:*']

exports.default = async ( http, io, databases ) => {
  if( !http ) return

  const { app } = http
  if( !app ) return

  app
  // Attach socket.io server interface to application
  .attach('io', io )
  // Attach database to application
  .attach('db', databases.default.getConnection() )

  // Add fastify middleware
  .use( async ( req, res ) => {
    console.log('-- Middleware --')

    // Test session
    req.session.name = 'Bob'
  })

  // Register express routes
  .router('/', routes )

  // Handle application exception errors
  .onError( ( error, req, res ) => {
    console.log( error )
    res.status(500).send( error )
  })

  await http.listen( true )
}