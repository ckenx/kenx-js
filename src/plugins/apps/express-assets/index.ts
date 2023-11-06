import type { Ckenx } from '#types/service'
import type { StaticAssetConfig, ApplicationAssetConfig, AssetStorageConfig, AssetUploadConfig } from '#types/index'
// import './types'
import os from 'os'
import { CAS } from 'globe-sdk'
import express, { Express } from 'express'
import multipart from 'express-form-data'

function addStatic( Setup: Ckenx.SetupManager, app: Ckenx.ApplicationPlugin<Express>, configList: StaticAssetConfig[] ){
  if( !Array.isArray( configList ) || !configList.length ) return

  // Mount each static root paths & options
  configList.forEach( ({ root, options }) => {
    root = Setup.resolvePath( root )
    if( !root ) return
    
    app.use( express.static( root, options || {} ) ) 
  })
}

function addMultipart( Setup: Ckenx.SetupManager, app: Ckenx.ApplicationPlugin<Express>, uploadConfig: AssetUploadConfig ){
  /**
   * Multi-part form data parser with connect-multiparty
   * 
   * Options are the same as multiparty takes.
   * 
   * NOTE: there is a new option `autoClean` to clean all 
   *       files in "uploadDir" folder after the response.
   *       By default, it is `false`.
   */
  app
  .use( multipart.parse({ uploadDir: os.tmpdir(), autoClean: true }) )
  /**
   * Delete from the request all empty files (size == 0)
   */
  .use( multipart.format() )
  /**
   * Change the file objects to fs.ReadStream 
   */
  .use( multipart.stream() )

  return
}

function addStorage( Setup: Ckenx.SetupManager, app: Ckenx.ApplicationPlugin<Express>, storageConfig: AssetStorageConfig ){
  switch( storageConfig.type ){
    case 'cloud': {
      const { client, spaces } = storageConfig
      if( !client )
        throw new Error('Undefined cloud storage client configuration')

      if( !spaces )
        throw new Error('Undefined cloud storage spaces')

      const config = {
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
      }

      app.decorate('storage', CAS.config( config ).Space )
    } break
    case 'local':
    default: {
      // TODO: Inforce local path and configuration
    }
  }
}

export default ( Setup: Ckenx.SetupManager, app: Ckenx.ApplicationPlugin<Express>, assetConfig: ApplicationAssetConfig ) => {
  /**
   * Setup asset storage access
   */
  assetConfig.storage && addStorage( Setup, app, assetConfig.storage )

  /**
   * Setup asset uploading handler
   */
  assetConfig.upload && addMultipart( Setup, app, assetConfig.upload )

  /**
   * Setup static assets server
   */
  assetConfig.static && addStatic( Setup, app, assetConfig.static )
}