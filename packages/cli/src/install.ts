
import type { InstallPluginOptions } from './types'
import { prompt } from 'enquirer'

export const checkOptions = async ( options: InstallPluginOptions ): Promise<InstallPluginOptions> => {

  const missings = []
  if( !options.plugin )
    missings.push({
      type: 'input',
      name: 'plugin',
      message: 'Plugin name'
    })

  const { plugin }: InstallPluginOptions = await prompt( missings )
  /*
   * Keep asking undefined options values
   * if( !plugin ) return await checkInstallOptions( options )
   */

  return {
    ...options,
    plugin: options.plugin || plugin
  }
}

export const execute = async ( options: InstallPluginOptions ): Promise<void> => {
  console.log('Install: ', options )
}