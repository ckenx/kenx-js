import Yaml from 'yaml'
import Fs from 'node:fs'
import Path from 'node:path'
import type { SetupConfig, SetupTarget } from '#types/index'

const REFERENCE_MATCH_REGEX = /\[([a-zA-Z0-9-_.]+)\]:([a-zA-Z0-9-_.]+)/i

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

  try { 
    const 
    data = parseYaml(`.setup/${target}`),
    comply = ( value: any ): any => {
      if( !value ) return value

      switch( typeof value ){
        case 'string': return REFERENCE_MATCH_REGEX.test( value ) ? comply( resolveSetupReference( data, value ) ) : value
        case 'number': return value
        default: {
          if( Array.isArray( value ) )
            return value.map( ( each: any ) => { return comply( each ) })

          else {
            Object.entries( value ).map( ([ key, subValue ]) => {
              value[ key ] = comply( subValue )
              // console.log( key, subValue )
            } )
            return value
          }
        }
      }
    }
    
    /**
     * Comply data by resolving all key references
     * throughout partials configurations
     * 
     */
    comply( data )

    return data
  }
  catch( error ){
    console.log(`[SETUP] <${target}> target:`, error )
    return null
  }
}

/**
 * Import plugin
 * 
 * @type {string} reference
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
 * Resolve setup reference
 * 
 * @type {string} reference
 * @return {any}
 * 
 */
export const resolveSetupReference = ( Setup: any, reference: string ) => {
  if( typeof Setup !== 'object' || !Setup )
    return

  const [ _, section, key ] = reference.match( REFERENCE_MATCH_REGEX ) || []
  if( !_ || !key || !section ) return

  // Refer to defined environment variables
  if( section === 'env' )
    return process.env[ key ]

  // Multi-configurations array
  else if( Array.isArray( Setup[ section ] ) ){
    for( const config of Setup[ section ] )
      if( ( !config.key && key == 'default' ) || config.key == key )
        return config
  }

  // Consise object
  else return Setup[ section ][ key ]
}

/**
 * Return project directory root
 * 
 * @type {string} path
 * @return {string} root
 * 
 */
export const getRoot = ( path?: string ) => {
  if( !path )
    return process.cwd()

  return Path.resolve( process.cwd(), path )
}