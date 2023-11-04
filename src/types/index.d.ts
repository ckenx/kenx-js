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

export type SetupTarget = 'index' | 'frontend' | 'native'

export type ServerType = 'http' | 'socket.io' | 'websocket'
export type ServerConfig = {
  type: ServerType
  key?: string
  bindTo?: string
}

export type ApplicationSessionStore = {
  provider: string
  db: string
}
export type ApplicationSessionConfig = {
  type: 'in-memory' | 'store'
  env?: 'development' | 'production'
  store?: ApplicationSessionStore
  config: {
    name: string
    secret: string
    saveUninitialized?: boolean
    resave?: boolean
    cookie?: {
      path?: string
      httpOnly: boolean
      secure: boolean
      maxAge?: number
    }
  }
}
export type ApplicationConfig = {
  framework: string
  session?: ApplicationSessionConfig
}
export type HTTPServerConfig = ServerConfig & {
  HOST: string
  PORT: number
  application?: ApplicationConfig
}
export type AuxiliaryServerConfig = ServerConfig & {
  PORT?: number
  options?: IO.ServerOptions
}

export type DirectoryConfig = {
  root?: string
  pattern?: string
}
export type SetupConfig = {
  typescript?: boolean
  env?: {
    dev?: boolean
  }
  directory: DirectoryConfig
  servers?: (HTTPServerConfig | AuxiliaryServerConfig)[]
}
