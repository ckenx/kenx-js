
export default class Context {
  private namespace: string

  constructor( namespace: string ){
    this.namespace = namespace
  }

  debug( ...args: unknown[] ){
    process.env.NODE_ENV !== 'production'
    && console.debug(`[${this.namespace.toUpperCase()}] -`, ...args )
  }
  error( ...args: unknown[] ){
    process.env.NODE_ENV !== 'production'
    && console.error(`[${this.namespace.toUpperCase()}] -`, ...args )
  }
  warn( ...args: unknown[] ){
    process.env.NODE_ENV !== 'production'
    && console.warn(`[${this.namespace.toUpperCase()}] -`, ...args )
  }
}