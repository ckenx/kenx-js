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
import type { BackendConfig } from './types'
import { Manager, autoload } from './core'

/**
 * Load backend setup configuration
 * 
 */
const Backend = Manager.loadSetup('backend') as BackendConfig
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
 * Auto-load Ckenx backend services
 * 
 */
autoload( Backend )