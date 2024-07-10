
import { FastifyInstance } from 'fastify'
import fs from 'node:fs'
import path from 'node:path'
import { transformIndexHtml } from 'vite'

export default async ( app: FastifyInstance ) => {
  app
  .get('/*', async ( req, res, next ) => {
    const url = req.originalUrl

    console.log('hit this endpoint: -----------------')

    try {
      // 1. Read index.html
      let template = fs.readFileSync(
        path.resolve('src/views/index.html'),
        'utf-8',
      )

      // 2. Apply Vite HTML transforms. This injects the Vite HMR client,
      //    and also applies HTML transforms from Vite plugins, e.g. global
      //    preambles from @vitejs/plugin-react
      template = await vite.transformIndexHtml( url, template )

      // 3a. Load the server entry. ssrLoadModule automatically transforms
      //    ESM source code to be usable in Node.js! There is no bundling
      //    required, and provides efficient invalidation similar to HMR.
      // const { render } = await vite.ssrLoadModule('/src/entry-server.js')
      // 3b. Since Vite 5.1, you can use the experimental createViteRuntime API
      //    instead.
      //    It fully supports HMR and works in a simillar way to ssrLoadModule
      //    More advanced use case would be creating a runtime in a separate
      //    thread or even a different machine using ViteRuntime class
      const runtime = await vite.createViteRuntime( server )
      const { render } = await runtime.executeEntrypoint('/src/entry-server.js')

      // 4. render the app HTML. This assumes entry-server.js's exported
      //     `render` function calls appropriate framework SSR APIs,
      //    e.g. ReactDOMServer.renderToString()
      const appHtml = await render( url )

      // 5. Inject the app-rendered HTML into the template.
      const html = template.replace('<!--ssr-outlet-->', appHtml )

      // 6. Send the rendered HTML back.
      res.status(200).set({ 'Content-Type': 'text/html' }).end( template )
    } catch (e) {
      // If an error is caught, let Vite fix the stack trace so it maps back
      // to your actual source code.
      vite.ssrFixStacktrace(e)
      next(e)
    }
  })
}