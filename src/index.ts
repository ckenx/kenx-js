/**
 * Minumum NodeJS version required
 * v16+ supported from the fist version of 
 * kenx framework.
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
import { autoload, dispatch } from '#core/index'

export default async function init(){
  /**
   * Autoload Chenx services
   * 
   */
  await autoload()

  /**
   * Initialize & map setup services to project components
   * 
   */
  await dispatch()
}

// require.main == module && init()