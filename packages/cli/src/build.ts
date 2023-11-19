
import type { BuildAppOptions } from './types'

export const execute = async ( options: BuildAppOptions ): Promise<void> => {
  console.log('Build: ', options )
}