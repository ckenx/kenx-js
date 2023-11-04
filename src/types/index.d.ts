
declare global {
  interface Array<T> {
    pmap: ( fn: ( each: T, index?: number ) => Promise<T> ) => Promise<T[]>
  }
}

export type SetupTarget = 'backend' | 'frontend' | 'native'

export type HTTPServerConfig = {
  HOST: string
  PORT: number
  application?: {
    framework: string
  }
}
export type SocketServerConfig = {
  type: string
  config: {}
}
export type ServersConfig = {
  http?: HTTPServerConfig
  socket?: SocketServerConfig
}

export type BackendConfig = {
  typscript?: boolean
  env?: {
    dev?: boolean
  }
  server?: ServersConfig
}