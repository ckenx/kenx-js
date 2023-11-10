import type { Kenx } from '#types/service'
import type { StaticAssetConfig, ApplicationAssetConfig, AssetStorageConfig, AssetUploadConfig } from '#types/index'
import os from 'os'
import { CAS } from 'globe-sdk'
import express, { Application } from 'express'
import multipart from 'express-form-data'

export default class ExpressAssetsPlugin {
  private readonly setup: Kenx.SetupManager
  private readonly app: Kenx.ApplicationPlugin<Application>

  private addStatic( configList: StaticAssetConfig[] ){
    if( !Array.isArray( configList ) || !configList.length ) return

    // Mount each static root paths & options
    configList.forEach( ({ root, options }) => {
      root = this.setup.resolvePath( root )
      if( !root ) return
      
      this.app.register( express.static( root, options || {} ) ) 
    })
  }

  private addMultipart( config: AssetUploadConfig ){
    /**
     * Multi-part form data parser with connect-multiparty
     * 
     * Options are the same as multiparty takes.
     * 
     * NOTE: there is a new option `autoClean` to clean all 
     *       files in "uploadDir" folder after the response.
     *       By default, it is `false`.
     */
    this.app
    .register( multipart.parse({ ...config, uploadDir: os.tmpdir(), autoClean: true }) )
    /**
     * Delete from the request all empty files (size == 0)
     */
    .register( multipart.format() )
    /**
     * Change the file objects to fs.ReadStream 
     */
    .register( multipart.stream() )
  }

  private addStorage( config: AssetStorageConfig ){
    switch( config.type ){
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

        this.app.decorate('storage', storage.Space )
      } break
      case 'local':
      default: {
        // TODO: Inforce local path and configuration
      }
    }
  }

  constructor( Setup: Kenx.SetupManager, app: Kenx.ApplicationPlugin<Application>, assetConfig: ApplicationAssetConfig ){
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