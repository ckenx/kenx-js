import type { Db } from 'mongodb'

declare module Express {
  interface Application {
    db: Db
  }
  interface Request {
    files: any
    session: any
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    db: Db
    storage: any
  }
  interface FastifyRequest {
    session: any
  }
}