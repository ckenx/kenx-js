import type EventEmitter from 'events'
import type SManager from '../setup'
import type { Wrapper } from '#lib/adapters/awrapper'
import type { Server } from 'http'

/**
 * @internal
 */
export type JSObject<Type> = { [index: string]: Type }

/**
 * @internal
 */
export type SetupTarget = 'index' | 'frontend' | 'native'

/**
 * @public
 */
export type ResourceConfig = {
  type: string
  plugin: string
  key?: string
}

/**
 * @public
 */
export type ApplicationConfig = {
  plugin: string
  /*
   * Session?: ApplicationSessionConfig
   * assets?: ApplicationAssetConfig
   * routing?: ApplicationRoutingConfig
   */
  [index: string]: any
}
/**
 * @public
 */
export type HTTPServerConfig = ResourceConfig & {
  HOST: string
  PORT: number
  application?: ApplicationConfig
}
/**
 * @public
 */
export type AuxiliaryServerConfig = ResourceConfig & {
  PORT?: number
  bindTo?: string
  options?: JSObject<any>
}
/**
 * @public
 */
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

/**
 * @internal
 */
export type DirectoryConfig = {
  base: string
  pattern: string
}
/**
 * @public
 */
export type SetupConfig = {
  typescript?: boolean
  directory: DirectoryConfig
  // Servers?: (HTTPServerConfig | AuxiliaryServerConfig)[]

  [index: string]: any
}

/**
 * @public
 */
export interface SetupManager extends SManager {}

/**
 * @public
 */
export interface ApplicationPlugin<T> extends EventEmitter {
  readonly core: T
  readonly HOST: string
  readonly PORT: number
  register: ( fn: any, options?: any ) => this
  use: ( fn: any, type?: string ) => this
  attach: ( attribute: string, value: any ) => this
  router: ( prefix: string, router: any ) => this
  onError: ( listener: ( error: Error, ...args: any[] ) => void ) => this
  serve: ( overhead?: boolean ) => Promise<ServerPlugin<Server>>
}

/**
 * @internal
 */
export type HTTPServer = Server
/**
 * @public
 */
export type ActiveServerInfo = {
  type: string
  port?: number
}
/**
 * @public
 */
export interface ServerPlugin<T> {
  readonly server: T
  readonly app?: ApplicationPlugin<any>
  getInfo: () => ActiveServerInfo | null
  listen: ( arg: any ) => Promise<ActiveServerInfo | null>
  build?: () => Promise<void>
  close: () => Promise<unknown>
}
/**
 * @public
 */
export interface DatabasePlugin<T> {
  readonly connection?: T
  connect: () => Promise<T>
  disconnect: () => Promise<void>
  getConnection: ( dbname?: string ) => T
}

/**
 * @internal
 */
export type Resources = {
  [index: string]: ServerPlugin<any>
  // [index: string]: DatabasePlugin<any>
}
/**
 * @public
 */
export type Takeover<ServerType, DBType> = {
  http?: ServerPlugin<ServerType>
  database?: DatabasePlugin<DBType>
}
