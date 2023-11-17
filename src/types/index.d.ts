import type IO from 'socket.io'

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

type JSObject<Type> = { [index: string]: Type }

export type SetupTarget = 'index' | 'frontend' | 'native'

export type ResourceConfig = {
  type: string
  plugin: string
  key?: string
}

export type ApplicationSessionStore = {
  provider: string
  db: string
  options: JSObject<any>
}
export type ApplicationSessionConfigSet = {
  type: 'in-memory' | 'store'
  store?: ApplicationSessionStore
  options: JSObject<any>
}
export type ApplicationSessionConfig = {
  plugin?: string
  allenv: ApplicationSessionConfigSet
  development?: ApplicationSessionConfigSet
  production?: ApplicationSessionConfigSet
}

export type StaticAssetConfig = {
  root: string
  options: JSObject<any>
}
export type AssetStorageSpace = {
  endpoint: string
  baseURL: string
  region: string
  bucket: string
}
export type AssetStorageConfig = {
  type: 'local' | 'cloud'
  path?: string // Only for local type
  client?:{
    key: string
    secret: string
    version?: string
  }
  spaces?: AssetStorageSpace[]
}
export type AssetUploadConfig = {
  maxFileSize: number
  mimeTypes: string[]
}
export type ApplicationAssetConfig = {
  plugin?: string
  storage: AssetStorageConfig
  upload: AssetUploadConfig
  static: StaticAssetConfig[]
}

export type ApplicationRoutingConfig = {
  plugin?: string
  profile: {
    appname?: string
    version: string
    status: 'development' | 'operational' | 'maintenance' | 'deprecated'
  }
  ratelimit: {
    maxRPS: number
  }
}
export type ApplicationConfig = {
  plugin: string
  session?: ApplicationSessionConfig
  assets?: ApplicationAssetConfig
  routing?: ApplicationRoutingConfig
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
  options?: IO.ServerOptions
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
  root: string
  pattern: string
}
export type SetupConfig = {
  typescript?: boolean
  directory: DirectoryConfig
  servers?: (HTTPServerConfig | AuxiliaryServerConfig)[]

  [index: string]: any
}
