import type { DatbaseConfig } from '#types/index'
import type { Kenx } from '#types/service'
import { RedisClientOptions, RedisClientType, createClient } from 'redis'

export default class RedisPugin implements Kenx.DatabasePlugin<any> {
  private client?: RedisClientType
  private readonly config: RedisClientOptions
  connection?: any
  
  constructor( Setup: Kenx.SetupManager, config: DatbaseConfig ){
    if( typeof config == 'string' )
      this.config = { url: config }

    else if( typeof config.options == 'object' ){
      this.config = config.options as any
    }

    else throw new Error('Invalid database configuration')
  }

  async connect(): Promise<any>{
    if( !this.connection )
      this.connection = await createClient( this.config )

    this.connection.connect()
    return this.getConnection()
  }

  getConnection( dbname?: string ){
    if( !this.connection )
      throw new Error('No database connection client found')

    return this.connection
  }

  async disconnect(){ this.client?.disconnect() }
}