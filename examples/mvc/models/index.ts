import type { Collection } from 'mongodb'
import type { DatabasePlugin } from '../../../packages/node/dist/types'

type UserQuery = {
  email: string
}

async function getUser( collection: Collection, query: UserQuery ){
  return await collection.findOne( query, { projection: { _id: 0 } })
}

async function getCourses( mysqldb: any, query: UserQuery ){
  return await mysqldb.query(`SELECT * from Courses WHERE email=${query.email}`)
}


export default ( databases: { [index: string]: DatabasePlugin<any> } ) => {
  if( !databases ) return

  const
  db = databases.default.getConnection(),
  userCol = db.collection('users')

  const mysqldb = databases['mysql-db'].getConnection()

  return {
    getUser: async ( query: UserQuery ) => { return await getUser( userCol, query ) },
    getCourses: async ( query: UserQuery ) => { return await getCourses( mysqldb, query ) },
  }
}