import Yaml from 'yaml'
import Fs from 'node:fs'
import Path from 'node:path'

import type { SetupTarget } from '#types/index'

function parseYaml( filepath: string ){
  try {
    let content = Yaml.parse( Fs.readFileSync(`./${filepath}.yml`, 'utf-8') )
    if( content.__extends__ )
      for( const each of content.__extends__ ){
        content = {
          ...content,
          ...parseYaml(`${Path.dirname( filepath )}/${each}`)
        }

        delete content.__extends__
      }

    return content
  }
  catch( error ){
    console.log(`[SETUP] - Parsing <${filepath}.yml> file:`, error )
    return null
  }
}

/**
 * Load setup configurations
 * 
 * @type {string} target: `index`, `native`
 * @return {object} Defined setup `object` or `null` if not found
 * 
 */
export const loadSetup = ( target?: SetupTarget ) => {
  // Default target is .setup index
  target = target || 'index' 

  try { return parseYaml(`.setup/${target}`) }
  catch( error ){
    console.log(`[SETUP] <${target}> target:`, error )
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
export const importPlugin = async ( reference: string ) => {
  try { 
    const [type, name] = reference.split(':')
    if( !['app', 'server'].includes( type ) )
      throw new Error(`<${type}:> is not a valid import type. Expect <app:>, <server:>, ...`)

    return ( await import(`./../plugins/${type}s/${name}`) ).default
  }
  catch( error: any ){
    console.error( error )
    throw new Error(`Failed importing <${reference}> plugin`)
  }
}

/**
 * Return project directory root
 * 
 * @type {string} path
 * @return {string} root
 * 
 */
export const getRoot = ( path?: string ) => {
  if( !path ) return process.cwd()

  return Path.resolve( process.cwd(), path )
}