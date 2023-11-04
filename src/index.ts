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
 * NodeJS util functions
 * 
 */
import { Utils, autoload } from './core'

/**
 * Load backend setup configuration
 * 
 */
const Backend = Utils.loadSetup('backend') as BackendConfig
if( !Backend ) process.exit(1)

/**
 * Load Environment Variabales
 * 
 */
import dotenv from 'dotenv'

Backend.env?.dev === true ?
      dotenv.config({ path: './.env.dev' }) // Load development specific environment variables
      : dotenv.config() // Load default .env variables

/**
 * Server NodeJS application 
 * 
 */
import { BackendConfig } from './types'

autoload( Backend )