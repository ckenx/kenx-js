import type { Server } from 'http'
import type { HTTPServerConfig } from '#types/index'
import Setup from '#core/setup'

declare namespace Ckenx {
  export interface SetupManager extends Setup {}

  export interface ApplicationPlugin<T> {
    private readonly core: T
    readonly HOST: string
    readonly PORT: number
    use: ( fn: any ) => this
    addRouter: ( prefix: string, router: any ) => this
    addHandler: ( type: string, func: any ) => this
    onError: ( listener: ( error: Error, ...args: any[] ) => void ) => this
    serve: () => Promise<ServerPlugin<Server>>
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

  export type CoreInterface = {
    servers?: { [index: string]: ServerPlugin<any> }
    databases?: { [index: string]: any }
  }
}