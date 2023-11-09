declare module Express {
  interface Application {
    mongodb: Db
  }
  interface Request {
    files: any
    session: any
  }
}
