import type { Kenx } from "#root/index"

type RequestMethod = 'HEAD' | 'OPTIONS' | 'CONNECT' | 'TRACE' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type Request = {

}
type Response = {

}
type PreHandler = ( req: Request, res: Response ) => Promise<void>
type PreValidation = ( req: Request, res: Response ) => Promise<void>
type SchemaObject = {

}

class Route {
  private core: any
  private route: string
  private method: RequestMethod
  private prehanders: PreHandler[] = []
  private prevalidations: PreValidation[] = []
  private schemaObject?: SchemaObject

  constructor( method: RequestMethod, route: string, core: Wrapper ){
    this.core = core
    this.route = route
    this.method = method
  }

  prehandle( arg: PreHandler | PreHandler[] ){
    Array.isArray( arg ) ? 
            [ ...this.prehanders, ...arg ]
            : this.prehanders.push( arg )

    return this
  }

  prevalidate( arg: PreValidation | PreValidation[] ){
    Array.isArray( arg ) ? 
            [ ...this.prevalidations, ...arg ]
            : this.prevalidations.push( arg )

    return this
  }

  schema( arg: SchemaObject ){
    this.schemaObject = arg
    return this
  }

  handle(){
    this.core[ this.method.toLowerCase() ]( this.route )
  }
}

export class Wrapper {
  private app: Kenx.ApplicationPlugin<any>

  constructor( app: Kenx.ApplicationPlugin<any> ){
    this.app = app
  }

  get( route: string ){
    new Route('GET', route, this.app.core )
    return this
  }
}