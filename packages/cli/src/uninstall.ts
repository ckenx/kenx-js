
import type { UnInstallPluginOptions } from './types'
import { prompt } from 'enquirer'

export const checkOptions = async ( options: UnInstallPluginOptions ): Promise<UnInstallPluginOptions> => {

  const missings = []
  if( !options.plugin )
    missings.push({
      type: 'input',
      name: 'plugin',
      message: 'Plugin name'
    })

  const { plugin }: UnInstallPluginOptions = await prompt( missings )
  /*
   * Keep asking undefined options values
   * if( !plugin ) return await checkInstallOptions( options )
   */

  return {
    ...options,
    plugin: options.plugin || plugin
  }
}

export const execute = async ( options: UnInstallPluginOptions ): Promise<void> => {
  console.log('Unnstall: ', options )
}