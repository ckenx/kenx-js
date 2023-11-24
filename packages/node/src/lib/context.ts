
export default class Context {
  private namespace: string

  constructor( namespace: string ){
    this.namespace = namespace
  }

  log( ...args: any[] ){
    process.env.NODE_ENV !== 'production'
    && console.log(`[${this.namespace.toUpperCase()}] -`, ...args )
  }
  error( ...args: any[] ){
    process.env.NODE_ENV !== 'production'
    && console.error(`[${this.namespace.toUpperCase()}] -`, ...args )
  }
  warn( ...args: any[] ){
    process.env.NODE_ENV !== 'production'
    && console.warn(`[${this.namespace.toUpperCase()}] -`, ...args )
  }
}