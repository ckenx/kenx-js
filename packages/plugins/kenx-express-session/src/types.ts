export type JSObject<Type> = { [index: string]: Type }

export type SessionStore = {
  provider: string
  db: string
  options: JSObject<any>
}
export type SessionConfigSet = {
  type: 'in-memory' | 'store'
  store?: SessionStore
  options: JSObject<any>
}
export type SessionConfig = {
  plugin?: string
  allenv: SessionConfigSet
  development?: SessionConfigSet
  production?: SessionConfigSet
}