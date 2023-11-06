import type { ServeStaticOptions } from 'serve-static'
import type { Ckenx } from '#types/service'
import type { ApplicationAssetConfig, AssetStorageConfig, AssetUploadConfig } from '#types/index'
import os from 'os'
import express, { Express } from 'express'
import multipart from 'express-form-data'

type StaticAssetConfig = {
  root: string
  options?: ServeStaticOptions
}

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