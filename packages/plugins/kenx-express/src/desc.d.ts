
// Extend express application for decorative attributes
declare module Express {
  interface Application {
    [index: string]: unknown
  }
}