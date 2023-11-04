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

export type SetupTarget = 'backend' | 'frontend' | 'native'

export type ServerType = 'http' | 'socket.io' | 'websocket'
export type ServerConfig = {
  type: ServerType
  sid?: string
  bindTo?: string
}
export type HTTPServerConfig = ServerConfig & {
  HOST: string
  PORT: number
  application?: {
    framework: string
  }
}
export type AuxiliaryServerConfig = ServerConfig & {
  PORT?: number
  options?: IO.ServerOptions
}

export type BackendConfig = {
  typscript?: boolean
  env?: {
    dev?: boolean
  }
  servers?: (HTTPServerConfig | AuxiliaryServerConfig)[]
}
