import type { SetupConfig, SetupTarget } from '#types/index'
import Yaml from 'yaml'
import nodeFs from 'fs-extra'
import { exec } from 'shelljs'
import * as tsc from 'tsc-prog'
import nodePath from 'node:path'
import Context from '#lib/context'

export default class Setup {
  // Defined setup context
  public context = new Context('setup')

  private readonly REFERENCE_MATCH_REGEX = /\[([a-zA-Z0-9-_.]+)\]:([a-zA-Z0-9-_.]+)/i
  private readonly PLUGIN_NAME_MATCH_REGEX = /(@?[a-zA-Z0-9-_.]+)\/?([a-zA-Z0-9-_.]+)?/i
  private Config?: SetupConfig
  private Plugins: string[] = []

  public readonly Path = nodePath
  public readonly Fs = nodeFs

  private async parseYaml( filepath: string ){
    try {
      let content = Yaml.parse( await this.Fs.readFile(`${filepath}.yml`, 'utf-8') )
      if( content.__extends__ )
        for( const each of content.__extends__ ) {
          content = {
            ...content,
            ...(await this.parseYaml(`${this.Path.dirname( filepath )}/${each}`))
          }

          delete content.__extends__
        }

      return content
    }
    catch( error ) {
      this.context.log(`Parsing <${filepath}.yml> file:`, error )
      return null
    }
  }

  private comply( value: any ): any{
    if( !value ) return value

    switch( typeof value ) {
      case 'string': return this.REFERENCE_MATCH_REGEX.test( value ) ? this.comply( this.resolveReference( value ) ) : value
      case 'number': return value
      default: {
        if( Array.isArray( value ) )
          return value.map( ( each: any ) => { return this.comply( each ) })


          Object
          .entries( value )
          .map( ([ key, subValue ]) => {
            /**
             * Auto-collect plugin dependencies from
             * the configuration, to be install before
             * project build or run.
             */
            key == 'plugin'
            && typeof subValue == 'string'
            && !this.Plugins.includes( subValue )
            && this.Plugins.push( subValue )

            // Resolve references
            value[ key ] = this.comply( subValue )
          } )
          return value

      }
    }
  }

  async initialize(){
    this.Config = await this.loadConfig('index')
    if( !this.Config ) {
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
     */
    this.Config.directory = this.Config.directory || {}

    this.Config.directory.base = this.Path.resolve( process.cwd(), this.Config.directory.base || '/' )
    this.Config.directory.pattern = this.Config.directory.pattern || '-'

    /**
     * Wheter come next is only for development
     * mode environment.
     *
     * It assumes all dependencies and builds are
     * created before production deployment.
     */
    if( process.env.NODE_ENV === 'production' ) return

    /**
     * Install plugin dependencies collected
     * from the configuration.
     *
     * TODO: Attach the compatible versions of each
     *       plugin to the project's Kenx setup version.
     */
    if( this.Plugins.length )
      try {
        console.log('Installing dependency plugins ...')

        const packageJson = await this.Fs.readJSON('package.json')
        if( !packageJson )
          throw new Error('Project package.json file not found')

        // Install missing dependency packages
        const deps = this.Plugins.filter( each => { return !packageJson.dependencies[ each ] } )
        deps.length && await exec(`npm install ${deps.join(' ')}`)
      }
      catch( error ) {
        console.error( error )
        process.exit(1)
      }

    /**
     * Automatically build typscript project
     *
     * Note: Must set `typescript` in `.config/index.yml`
     *       to true. Also add `tsconfig.json` to your
     *       project's root.
     *
     * TODO: Set up hot reload
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
      catch( error: any ) {
        console.error( error )
        process.exit(1)
      }
  }

  /**
   * Load setup configurations
   */
  async loadConfig( target: SetupTarget ){
    // Default target is .config index
    try { return await this.parseYaml(`${process.cwd()}/.config/${target}`) }
    catch( error ) {
      this.context.log(`<${target}> target: %o`, error )
      return null
    }
  }

  /**
   * Return setup configurations
   */
  getConfig( key?: keyof SetupConfig ): SetupConfig{
    if( !this.Config )
      throw new Error('No setup configuration found')

    return key ? this.Config[ key ] : this.Config
  }

  /**
   * Import module
   */
  async importModule( path: string, throwError = false ){
    if( !this.Config )
      throw new Error('No setup configuration found')

    if( !path )
      throw new Error('Undefined module path')

    path = this.Config?.typescript ?
                      // Typescript build folder
                      this.Path.join(`${process.cwd()}/dist`, path )
                      // Specified project directory base
                      : this.Path.join( this.Config.directory.base, path )

    /**
     * Check project's current working directory
     */
    let module
    try { module = await import( path ) }
    catch( error: any ) { throwError && console.log(`import <${path}> failed: `, error ) }

    return module
  }

  /**
   * Import plugin
   */
  async importPlugin( refname: string ){
    if( !this.Config )
      throw new Error('No setup configuration found')

    if( !refname )
      throw new Error('Undefined plugin name')

    let plugin

    /**
     * Check plugins in the project's current
     * working directory
     */
    try { plugin = await this.importModule(`/plugins/${refname}`) }
    catch( error: any ) {}

    // Check installed plugins in /node_modules folder
    if( !plugin )
      try { plugin = await import( refname ) }
      catch( error: any ) {}

    if( !plugin?.default )
      throw new Error(`<${refname}> plugin not found`)

    return plugin.default
  }

  /**
   * Resolve setup reference
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
    else if( Array.isArray( this.Config[ section ] ) ) {
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
   */
  resolvePath( path: string ){
    if( !this.Config || typeof this.Config !== 'object' )
      throw new Error('No setup configuration found')

    return this.Path.resolve( this.Config?.directory.base, path )
  }
}