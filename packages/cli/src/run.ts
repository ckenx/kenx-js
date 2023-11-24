
import clc from 'colors'
import type { RunAppOptions } from './types'

export const execute = async ( options: RunAppOptions ): Promise<void> => {
  /**
   * Inforce environment mode by command
   * options: default to `development`
   */
  process.env.NODE_ENV = options.prod ? 'production' : 'development'

  /**
   * Run Kenx framework
   */
  try { await import(`${process.cwd()}/autorun`) }
  catch( error ) { console.log( clc.red.bold('No `autorun` file at your project root'), error ) }
}