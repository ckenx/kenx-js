
export type JSObject<Type> = { [index: string]: Type }

export type Config = {
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