
import type { BuildAppOptions } from './types'
import clc from 'colors'

export const execute = async ( options: BuildAppOptions ): Promise<void> => {
  /**
   * Build in for production: Enforce environment mode
   */
  // process.env.NODE_ENV = 'production'

  /**
   * Run Kenx framework
   */
  try { await import(`${process.cwd()}/build`) }
  catch( error ) {
    console.log( clc.red.bold('No `build` file at your project root'), error )
    process.exit(1)
  }
}