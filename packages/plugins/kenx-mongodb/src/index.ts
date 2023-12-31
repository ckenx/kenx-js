import type { Config } from './types'
import type { DatabasePlugin, SetupManager } from '@ckenx/node'
import { MongoClient, Db } from 'mongodb'

export default class MongodbPugin implements DatabasePlugin<Db> {
  private client?: MongoClient
  private readonly config: string
  connection?: Db

  constructor( Setup: SetupManager, config: Config ){
    // TODO: Convert connection options object to connection string

    this.config = config.uri || ''
  }

  async connect(): Promise<Db>{
    if( !this.client ) {
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