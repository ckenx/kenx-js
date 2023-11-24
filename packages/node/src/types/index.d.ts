
declare global {
  interface Array<T> {
    pmap: ( fn: ( each: T, index?: number ) => Promise<T | void> ) => Promise<T[]>
  }
}

// Add direct prototype to native array
Array.prototype.pmap = async function( fn ){
  if( !Array.isArray( this ) || !this.length )
    return []

  let counter = 0
  const
  _array = JSON.parse( JSON.stringify( this ) ),
  output: any[] = [],
  recursor = async function(){
    const each = _array.shift()
    output.push( await fn( each, counter++ ) || each )

    // Recursive async/await
    if( _array.length ) await recursor()
  }

  await recursor()
  return output
}


export type JSObject<Type> = { [index: string]: Type }

export type SetupTarget = 'index' | 'frontend' | 'native'

export type ResourceConfig = {
  type: string
  plugin: string
  key?: string
}

export type ApplicationConfig = {
  plugin: string
  /*
   * Session?: ApplicationSessionConfig
   * assets?: ApplicationAssetConfig
   * routing?: ApplicationRoutingConfig
   */
  [index: string]: any
}
export type HTTPServerConfig = ResourceConfig & {
  HOST: string
  PORT: number
  application?: ApplicationConfig
}
export type AuxiliaryServerConfig = ResourceConfig & {
  PORT?: number
  bindTo?: string
  options?: JSObject<any>
}
export type DatabaseConfig = ResourceConfig & {
  autoconnect?: string
  uri?: string
  options?: {
    host: string
    port: number
    database?: string
    user: string
    password?: string
    pool?: JSObject<any>
  }
}

export type DirectoryConfig = {
  base: string
  pattern: string
}
export type SetupConfig = {
  typescript?: boolean
  directory: DirectoryConfig
  // Servers?: (HTTPServerConfig | AuxiliaryServerConfig)[]

  [index: string]: any
}
