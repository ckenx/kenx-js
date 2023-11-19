
export default () => {
  console.log('View Index')

  return {
    index: ( scope: any ) => {
      return `<html>
                <head>
                  <title>Hello Socket</title>
                  <script src="/socket.io/socket.io.js" type="text/javascript"></script>
                  <script type="text/javascript">
                    const socket = io()
                    socket.on('connect', () => console.log('Socket Connected: ', socket.id ) )
                  </script>
                </head>
                <body>
                  <h1>Hello world!</h1>
                </body>
              </html>`
    }
  }
}