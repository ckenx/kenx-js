
import type { SetupConfig, SetupTarget } from '#types/index'
import Yaml from 'yaml'
import nodeFs from 'fs-extra'
import nodePath from 'node:path'
import * as tsc from 'tsc-prog'
import Context from '../lib/context'

export default class Setup {
  // Defined setup context
  public context = new Context('setup')

  private readonly REFERENCE_MATCH_REGEX = /\[([a-zA-Z0-9-_.]+)\]:([a-zA-Z0-9-_.]+)/i
  private readonly PLUGIN_NAME_MATCH_REGEX = /(@?[a-zA-Z0-9-_.]+)\/?([a-zA-Z0-9-_.]+)?/i
  private Config?: SetupConfig

  public readonly Path = nodePath
  public readonly Fs = nodeFs

  private async parseYaml( filepath: string ){
    try {
      let content = Yaml.parse( await this.Fs.readFile(`${filepath}.yml`, 'utf-8') )
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
      this.context.log(`Parsing <${filepath}.yml> file:`, error )
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
    if( !this.Config ){
      this.context.error('Setup configuration not found')
      process.exit(1)
    }
    
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

    /**
     * Automatically build typscript activated project
     */
    if( this.Config?.typescript )
      try {
        tsc.build({
          basePath: process.cwd(),
          configFilePath: 'tsconfig.json', // Inherited config (optional)
          clean: {
            outDir: true,
            declarationDir: true
          },
          compilerOptions: {
            rootDir: 'src',
            outDir: 'dist',
            declaration: true,
            skipLibCheck: true,
          },
          include: ['src/**/*'],
          exclude: ['**/*.test.ts', '**/*.spec.ts'],
        })
      }
      catch( error: any ){
        console.error( error )
        process.exit(1)
      }
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
    try { return await this.parseYaml(`${process.cwd()}/.config/${target}`) }
    catch( error ){
      this.context.log(`<${target}> target: %o`, error )
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
   * Import module
   * 
   * @type {string} module name
   * @return {module} Defined setup `object` or `null` if not found
   * 
   */
  async importModule( path: string ){
    if( !this.Config )
      throw new Error('No setup configuration found')

    if( !path )
      throw new Error('Undefined module path')

    path = this.Config?.typescript ?
                      // Typescript build folder
                      this.Path.join(`${process.cwd()}/dist`, path )
                      // Specified project root
                      : this.Path.join( this.Config.directory.root, path )

    /**
     * Check project's current working directory
     */
    let module
    try { module = await import( path ) }
    catch( error: any ){}
    
    return module
  }

  /**
   * Import plugin
   * 
   * @type {string} reference
   * @return {module} Defined setup `object` or `null` if not found
   * 
   */
  async importPlugin( refname: string ){
    if( !this.Config )
      throw new Error('No setup configuration found')

    if( !refname )
      throw new Error('Undefined plugin name')

    const [ _, namespace, name ] = refname.match( this.PLUGIN_NAME_MATCH_REGEX ) || []
    if( !_ || !namespace )
      throw new Error('Invalid plugin name')

    refname = /^@/.test( namespace ) ?
                      `${namespace}/${name ? name : 'index'}` // Namespace plugin
                      : namespace // Standalone plugin

    let plugin

    /**
     * Check plugins in the project's current 
     * working directory
     */
    try { plugin = await this.importModule(`/plugins/${refname}`) }
    catch( error: any ){}

    // Check installed plugins in /node_modules folder
    if( !plugin )
      try { plugin = await import(`${process.cwd()}/node_modules/${refname}`) }
      catch( error: any ){}

    // Check kenx build-in plugins folder
    if( !plugin )
      try { plugin = await import(`./../plugins/${refname}`) }
      catch( error: any ){}

    if( !plugin?.default )
      throw new Error(`<${refname}> plugin not found`)

    return plugin.default
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