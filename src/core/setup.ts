import Yaml from 'yaml'
import nodeFs from 'fs-extra'
import nodePath from 'node:path'
import type { JSObject, SetupConfig, SetupTarget } from '#types/index'

export default class Setup {
  private readonly REFERENCE_MATCH_REGEX = /\[([a-zA-Z0-9-_.]+)\]:([a-zA-Z0-9-_.]+)/i
  private readonly PLUGIN_NAME_MATCH_REGEX = /(@?[a-zA-Z0-9-_.]+)\/?([a-zA-Z0-9-_.]+)?/i
  private Config?: SetupConfig

  public readonly Path = nodePath
  public readonly Fs = nodeFs

  private async parseYaml( filepath: string ){
    try {
      let content = Yaml.parse( await this.Fs.readFile(`./${filepath}.yml`, 'utf-8') )
      if( content.__extends__ )
        for( const each of content.__extends__ ){
          content = {
            ...content,
            ...(await this.parseYaml(`${this.Path.dirname( filepath )}/${each}`))
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

  private comply( value: any ): any {
    if( !value ) return value

    switch( typeof value ){
      case 'string': return this.REFERENCE_MATCH_REGEX.test( value ) ? this.comply( this.resolveReference( value ) ) : value
      case 'number': return value
      default: {
        if( Array.isArray( value ) )
          return value.map( ( each: any ) => { return this.comply( each ) })

        else {
          Object.entries( value ).map( ([ key, subValue ]) => value[ key ] = this.comply( subValue ) )
          return value
        }
      }
    }
  }
  
  async initialize(){
    this.Config = await this.loadConfig('index')
    if( !this.Config ) process.exit(1)
    
    /**
     * Comply data by resolving all key references
     * throughout partials configurations
     */
    this.comply( this.Config )

    /**
     * Define project directory structure 
     * and pattern
     * 
     */
    this.Config.directory = this.Config.directory || {}
    
    this.Config.directory.root = this.Path.resolve( process.cwd(), this.Config.directory.root || '/' )
    this.Config.directory.pattern = this.Config.directory.pattern || '-' 
  }

  /**
   * Load setup configurations
   * 
   * @type {string} target: `index`, `native`
   * @return {object} Defined config `object` or `null` if not found
   * 
   */
  async loadConfig( target: SetupTarget ){
    // Default target is .config index
    try { return await this.parseYaml(`.config/${target}`) }
    catch( error ){
      console.log(`[SETUP] <${target}> target:`, error )
      return null
    }
  }

  /**
   * Return setup configurations
   * 
   * @type {string} key
   * @return {object} unknow
   * 
   */
  getConfig( key?: keyof SetupConfig ): SetupConfig {
    if( !this.Config )
      throw new Error('No setup configuration found')
    
    return key ? this.Config[ key ] : this.Config
  }

  /**
   * Import plugin
   * 
   * @type {string} reference
   * @return {module} Defined setup `object` or `null` if not found
   * 
   */
  async importPlugin( refname: string ){
    try {
      if( !refname ) throw null

      const [ _, namespace, name ] = refname.match( this.PLUGIN_NAME_MATCH_REGEX ) || []
      if( !_ || !namespace ) throw null

      refname = /^@/.test( namespace ) ?
                        `${namespace}/${name ? name : 'index'}` // Namespace plugin
                        : namespace // Standalone plugin
      
      return ( await import(`./../plugins/${refname}`) ).default
    }
    catch( error: any ){
      console.error( error )
      throw new Error(`Failed importing <${refname}> plugin`)
    }
  }

  /**
   * Resolve setup reference
   * 
   * @type {string} reference
   * @return {any}
   * 
   */
  resolveReference( reference: string ){
    if( !this.Config || typeof this.Config !== 'object' )
      throw new Error('No setup configuration found')

    const [ _, section, key ] = reference.match( this.REFERENCE_MATCH_REGEX ) || []
    if( !_ || !key || !section ) return

    // Refer to defined environment variables
    if( section === 'env' )
      return process.env[ key ]

    // Multi-configurations array
    else if( Array.isArray( this.Config[ section ] ) ){
      for( const config of this.Config[ section ] )
        if( ( !config.key && key == 'default' ) || config.key == key )
          return config
    }

    // Consise object
    else return this.Config[ section ] ? this.Config[ section ][ key ] : undefined
  }

  /**
   * Resolve path with specified project
   * directory root as dirname
   * 
   * @type {string} path
   * @return {string} path
   * 
   */
  resolvePath( path: string ){
    if( !this.Config || typeof this.Config !== 'object' )
      throw new Error('No setup configuration found')

    return this.Path.resolve( this.Config?.directory.root, path )
  }
}