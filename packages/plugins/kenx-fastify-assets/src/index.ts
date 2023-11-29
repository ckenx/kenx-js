import type { ApplicationPlugin, SetupManager } from '@ckenx/node'
import type { StaticAssetConfig, AssetConfig, AssetStorageConfig, AssetUploadConfig } from './types'
import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { CAS } from 'globe-sdk'
import Plugin from 'fastify-plugin'
import Static from '@fastify/static'
import multipart from '@fastify/multipart'
import util from 'node:util'
import { Stream, pipeline } from 'node:stream'

declare module 'fastify' {
  interface FastifyRequest {
    pumpStream: ( input: Stream, output: Stream ) => Promise<void>
  }
}

export default class FastifyAssetsPlugin {
  private readonly setup: SetupManager
  private readonly app: ApplicationPlugin<FastifyInstance>

  private addStatic( configList: StaticAssetConfig[] ){
    if( !Array.isArray( configList ) || !configList.length ) return

    // Mount each static root paths & options
    configList.forEach( ({ root, options }) => {
      root = this.setup.resolvePath( root )
      if( !root ) return

      this.app.register( Static, { root: [ root ], ...options })
    })
  }

  private addMultipart( config: AssetUploadConfig ){
    /**
     * Multi-part form data parser with fastify-multiparty
     *
     * Options are the same as multiparty takes.
     *
     * NOTE: there is a new option `autoClean` to clean all
     *       files in "uploadDir" folder after the response.
     *       By default, it is `false`.
     */
    this.app.register( multipart )

    /**
     * Register a wrapper function for the `node:stream` pump
     * to support cross-runtime environment use.
     * Eg. Node, Deno, Bun
     */
    const
    pump = util.promisify( pipeline ),
    plugin: FastifyPluginAsync = Plugin( async ( app: FastifyInstance ) => {
      app.addHook('onRequest', async req => {
        req.pumpStream = async ( input, output ) => { await pump( input as any, output as any ) }
      } )
    } )

    this.app.register( plugin )
  }

  private addStorage( config: AssetStorageConfig ){
    switch( config.type ) {
      case 'cloud': {
        const { client, spaces } = config
        if( !client )
          throw new Error('Undefined cloud storage client configuration')

        if( !spaces )
          throw new Error('Undefined cloud storage spaces')

        const storage = CAS.config({
          accessKey: client.key,
          secret: client.secret,
          spaces: spaces.map( ({ region, bucket, baseURL, endpoint }) => {
            return {
              region,
              bucket,
              endpoint,
              host: baseURL,
              version: client.version
            }
          })
        })

        this.app.attach('storage', storage.Space )
      } break
      case 'local':
      default: {
        // TODO: Inforce local path and configuration
      }
    }
  }

  constructor( Setup: SetupManager, app: ApplicationPlugin<FastifyInstance>, assetConfig: AssetConfig ){
    this.setup = Setup
    this.app = app

    /**
     * Setup asset storage access
     */
    assetConfig.storage && this.addStorage( assetConfig.storage )

    /**
     * Setup asset uploading handler
     */
    assetConfig.upload && this.addMultipart( assetConfig.upload )

    /**
     * Setup static assets server
     */
    assetConfig.static && this.addStatic( assetConfig.static )
  }
}