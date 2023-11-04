import fs from 'fs'
import yaml from 'yaml'

import type { SetupTarget } from '../types'

/**
 * Load setup configurations
 * 
 * @type {string} target: `backend`, `frontend`, `native`
 * @return {object} Defined setup `object` or `null` if not found
 * 
 */
export const loadSetup = ( target: SetupTarget ) => {
  try { return yaml.parse( fs.readFileSync(`./.setup/${target}.yml`, 'utf-8') ) }
  catch( error ){
    console.log('Failed parsing .setup <backend.yml> file: ', error )
    return null
  }
}

/**
 * Import plugin
 * 
 * @type {string} name
 * @return {module} Defined setup `object` or `null` if not found
 * 
 */
export const importPlugin = async ( name: string ) => {
  try { return ( await import(`./../plugins/${name}`) ).default }
  catch( error: any ){
    console.error( error )
    throw new Error(`Failed importing <${name}> plugin`)
  }
}