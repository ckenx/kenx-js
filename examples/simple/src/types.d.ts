import type { Db } from 'mongodb'

declare module Express {
  interface Application {
    mongodb: Db
  }
  interface Request {
    files: any
    session: any
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    mongodb: Db
    storage: any
  }
  interface FastifyRequest {
    session: any
  }
}