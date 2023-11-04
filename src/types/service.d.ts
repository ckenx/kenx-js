import type { Server } from 'http'
import type { HTTPServerConfig } from '.'

declare namespace Ckenx {

  export interface ApplicationPlugin<T> {
    readonly app: T
    readonly HOST: string
    readonly PORT: number
    use: ( fn: any ) => this
    addRouter: ( prefix: string, router: any ) => this
    addHandler: ( type: string, func: any ) => this
    onError: ( listener: ( error: Error ) => void ) => this
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
    getInfo: () => ActiveServerInfo | null
    listen: ( port: number, host: string ) => Promise<ActiveServerInfo | null>
    close: () => Promise<unknown>
  }

  export type CoreInterface = {
    apps?: { [index: string]: ApplicationPlugin<any> }
    servers?: { [index: string]: ServerPlugin<any> }
    databases?: { [index: string]: any }
  }
}