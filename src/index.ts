/**
 * Minumum NodeJS version required
 * v16+ supported from the fist version of 
 * ckenx framework.
 */
const nodeVersionMajor = parseInt( process.version.split('.')[0].replace('v', '') )

if( nodeVersionMajor < 16 ) {
  console.log(`Please use Node.js version 16.x or above. Current version: ${nodeVersionMajor}`)
  process.exit(2)
}

/**
 * Start initialization
 * 
 */
import { autoload, run } from '#core/index'

( async () => {
  /**
   * Autoload Chenx services
   * 
   */
  await autoload()

  /**
   * Initialize & run the project
   * 
   */
  await run()
})()