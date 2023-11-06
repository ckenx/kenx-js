import type { Express } from 'express'
import type { Ckenx } from '#types/service'
import os from 'os'
import multipart from 'express-form-data'

function addMultipart( app: Express ){
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

  return
}

export default ( app: Ckenx.ApplicationPlugin<Express>, assetConfig: ApplicationAssetConfig ) => {
  
}