import type { DatabaseConfig } from '#types/index'
import type { Kenx } from '#types/service'
import { MongoClient, MongoClientOptions, Db } from 'mongodb'

export default class MongodbPugin implements Kenx.DatabasePlugin<Db> {
  private client?: MongoClient
  private readonly config: string
  connection?: Db
  
  constructor( Setup: Kenx.SetupManager, config: DatabaseConfig ){
    // TODO: Convert connection options object to connection string

    this.config = config.uri || ''
  }

  async connect(): Promise<Db>{
    if( !this.client ){
      this.client = new MongoClient( this.config )
      await this.client.connect()
    }

    return this.getConnection()
  }

  getConnection( dbname?: string ){
    if( !this.client )
      throw new Error('No database connection client found')

    return this.client.db( dbname )
  }

  async disconnect(){ this.client?.close() }
}