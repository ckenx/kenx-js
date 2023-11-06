import { Express, Router } from 'express'

declare module Express {
  interface Request {
    session: any
  }
}

export default ( app: Router ) => {
  app
  // Render text request
  .get('/', async ( req: Express.Request, res ) => {
    res.send(`Hello, ${req.session.name}!`)
  })

  // Test socket.io connection at http://localhost:8008/socket
  .get('/socket', async ( req, res ) => {
    res.send(`
      <html>
        <head>
          <title>Socket</title>
          <script src="/socket.io/socket.io.js" type="text/javascript"></script>
          <script type="text/javascript">
            const socket = io()
            socket.on('connect', () => console.log('Socket Connected: ', socket.id ) )
          </script>
        </head>
      </html>
    `)
  })
}