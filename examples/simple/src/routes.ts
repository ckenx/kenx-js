import { Router } from 'express'
import { FastifyInstance } from 'fastify'
import fs from 'node:fs'
import path from 'node:path'

export default async ( app: FastifyInstance ) => {
  app
  // Render text request
  .get('/', async ( req, res ) => {
    res.send(`Hello, ${req.session.name}!`)
  })

  // Make mongo database query:
  .get('/user/:email', async ( req, res ) => {
    const
    { email }: any = req.params,
    users = app.mongodb.collection('users'),
    user = await users.findOne({ email }, { projection: { _id: 0 } })

    res.send( user )
  })

  // Test socket.io connection at http://localhost:8008/socket
  .get('/socket', async ( req, res ) => {
    res
    .headers({ 'content-type': 'text/html' })
    .send(`
      <html>
        <head>
          <title>Socket</title>
          <script src="/socket.io/socket.io.js" type="text/javascript"></script>
          <script type="text/javascript">
            const socket = io()
            socket.on('connect', () => alert('Socket Connected: '+ socket.id ) )
          </script>
        </head>
      </html>
    `)
  })

  // Test assets storage request
  .get('/storage', async ( req, res ) => {
    // @ts-ignore
    const storage = app.storage()

    res.send({
      error: false,
      status: 'STORAGE',
      results: await storage.fetch()
    })
  })

  // Upload assets page
  .get('/upload', async ( req, res ) => {
    res
    .headers({ 'content-type': 'text/html' })
    .send(`
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
  /*
   * Test handle upload and storage of assets
   * .post('/upload/to', async ( req, res ) => {
   *   if ( !req.isMultipart() )
   *     return res.code(400).send( new Error('Request is not multipart') )
   */

  //   Const files = await req.files()

  /*
   *   For await ( const each of files ){
   *     console.log( each.filename )
   *     // Store file in ./public folder
   *     await req.pumpStream( each.file, fs.createWriteStream( path.resolve( __dirname, `./public/${each.filename}` )) )
   *     // Or Store file on cloud space storage
   *     await req.pumpStream( each.file, await app.storage().stream.to(`chenx/${each.filename}`) )
   *   }
   */

  /*
   *   Return res.send('Uploaded successfully!')
   * })
   */
}