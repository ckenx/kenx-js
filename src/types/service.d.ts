import type { Server } from 'http'
import type { HTTPServerConfig } from '#types/index'
import Setup from '#core/setup'

declare namespace Kenx {
  export interface SetupManager extends Setup {}

  export interface ApplicationPlugin<T> {
    private readonly core: T
    readonly HOST: string
    readonly PORT: number
    register: ( fn: any, options?: any ) => this
    decorate: ( attribute: string, value: any ) => this
    addRouter: ( prefix: string, router: any ) => this
    addHandler: ( type: string, func: any ) => this
    onError: ( listener: ( error: Error, ...args: any[] ) => void ) => this
    serve: ( overhead?: boolean ) => Promise<ServerPlugin<Server>>
  }

  interface AppConstructor<T> {
    new( httpServerConfig: HTTPServerConfig ): ApplicationPlugin<T>
  }

  export type HTTPServer = Server
  export type ActiveServerInfo = {
    type: string
    port?: number
  }
  export interface ServerPlugin<T> {
    readonly server: T
    readonly app?: ApplicationPlugin<any>
    getInfo: () => ActiveServerInfo | null
    listen: ( arg: any ) => Promise<ActiveServerInfo | null>
    close: () => Promise<unknown>
  }
  export interface DatabasePlugin<T> {
    readonly connection?: T
    connect: () => Promise<T>
    disconnect: () => Promise<void>
    getConnection: ( dbname?: string ) => T
  }

  export type Services = {
    [index: string]: ServerPlugin<any>
    [index: string]: DatabasePlugin<any>
  }
  export type Takeover<ServerType, DBType> = {
    http?: ServerPlugin<ServerType>
    database?: DatabasePlugin<DBType>
  }
}