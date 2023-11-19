import type { Config } from './types'
import type { Kenx } from '@ckenx/node'
import { type Connection, createConnection, createPool, ConnectionConfig } from 'mysql2/promise'

export default class MysqlPlugin implements Kenx.DatabasePlugin<Connection> {
  private readonly config?: string | ConnectionConfig
  private isPool = false
  connection?: Connection
  
  constructor( Setup: Kenx.SetupManager, config: Config ){
    if( config.uri )
      this.config = config.uri

    else if( typeof config.options == 'object' ){
      const { pool, ...rest } = config.options
      this.config = {
        ...rest,
        ...pool,
        /**
         * REVIEW:
         * If you have two columns with the same name, you might 
         * want to get results as an array rather than an object 
         * to prevent them from clashing.
         */
        rowsAsArray: true
      } as ConnectionConfig

      if( pool ){
        this.isPool = true
        this.config = { ...this.config, ...pool }
      }
    }

    else throw new Error('Invalid database configuration')
  }

  async connect(): Promise<Connection>{
    if( !this.config )
      throw new Error('No database configuration')

    if( this.connection )
      return this.getConnection()
    
    this.connection = typeof this.config == 'string'
                      || !this.isPool ?
                                await createConnection( this.config as any )
                                : await createPool( this.config )

    return await this.getConnection()
  }

  getConnection( dbname?: string ){
    if( !this.connection )
      throw new Error('No database connection client found')
    
    return this.connection
  }

  async disconnect(){ this.connection?.end() }
}