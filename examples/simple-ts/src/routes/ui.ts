import { FastifyInstance } from 'fastify'
import fs from 'node:fs'
import path from 'node:path'

export default async ( app: FastifyInstance ) => {
  app
  .get('/*', async ( req, res ) => {
    const url = req.originalUrl
    const vite = (app as any).vite

    if (!vite) {
      return res.status(500).send({ error: 'Vite server not available' })
    }

    try {
      let template = fs.readFileSync(
        path.resolve('src/views/index.html'),
        'utf-8',
      )

      template = await vite.transformIndexHtml( url, template )

      res.status(200).header('Content-Type', 'text/html').send( template )
    } catch (e: any) {
      vite.ssrFixStacktrace(e)
      console.error(e.stack)
      res.status(500).send({ error: 'Internal Server Error' })
    }
  })
}