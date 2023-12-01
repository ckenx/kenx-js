
export type JSObject<Type> = { [index: string]: Type }

export type ApplicationConfig = {
  plugin: string
  /*
   * Session?: SessionConfig
   * assets?: AssetConfig
   * routing?: RoutingConfig
   */
  [index: string]: any
}
export type Config = {
  HOST: string
  PORT: number
  plugin?: string
  application?: ApplicationConfig
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
export type SessionConfig = {
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
export type AssetConfig = {
  plugin?: string
  storage: AssetStorageConfig
  upload: AssetUploadConfig
  static: StaticAssetConfig[]
}

export type RoutingConfig = {
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