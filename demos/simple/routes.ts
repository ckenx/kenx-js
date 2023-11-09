import { Router } from 'express'

export default ( app: Router ) => {
  app
  // Render text request
  .get('/', async ( req, res ) => {
    res.send(`Hello, ${req.session.name}!`)
  })

  // Make mongo database query
  .get('/user/:email', async ( req, res ) => {
    const
    { email } = req.params,
    users = req.app.mongodb.collection('users'),
    user = await users.findOne({ email }, { projection: { _id: 0 } })

    res.json( user )
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

  // Test assets storage request
  .get('/storage', async ( req, res ) => {
    // @ts-ignore
    const storage = req.app.storage()

    res.send({
      error: false,
      status: 'STORAGE',
      results: await storage.fetch()
    })
  })

  // Upload assets page
  .get('/upload', async ( req, res ) => {
    res.send(`
      <html>
        <head>
          <title>Upload</title>
          <script type="text/javascript">
            function onLoad(){
              document
              .querySelector('#file-input')
              .addEventListener('change', e => {
                const body = new FormData()

                Array.from( e.target.files ).map( file => body.append('file', file ) )
                
                fetch('/upload/to', { method: 'POST', body }).catch( error => console.log('Failed:', error ) )
              })
            }
          </script>
        </head>
        <body onload="onLoad()">
          <input id="file-input" type="file" name="avatar"/>
        </body>
      </html>
    `)
  })
  // Test handle upload and storage of assets
  .post('/upload/to', async ( req, res ) => {
    
    console.log( req.files )

    res.send('Uploaded successfully!')
  })
}