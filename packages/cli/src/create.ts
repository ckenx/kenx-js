import type { CreateAppOptions } from './types'
import clc from 'colors'
import fs from 'fs-extra'
import path from 'node:path'
import Git from 'simple-git'
import { cp, exec } from 'shelljs'
// Import { rimraf } from 'rimraf'
import { prompt } from 'enquirer'

export const checkOptions = async ( options: CreateAppOptions ): Promise<CreateAppOptions> => {
  const
  defaultDir = 'my-app',
  missings = []

  if( !options.template )
    missings.push({
      type: 'list',
      name: 'template',
      message: 'Choose which project template to use',
      choices: ['node', 'deno', 'bun'],
      default: 'node'
    })

  if( !options.directory )
    missings.push({
      type: 'input',
      name: 'directory',
      message: 'Specify project directory (Eg. /path/to/my-app)',
      default: defaultDir
    })

  const { directory, template }: CreateAppOptions = await prompt( missings )
  /*
   * Keep asking undefined options values
   * if( !directory || !template ) return await checkCreateOptions( options )
   */

  if( options.directory == '.' )
    options.directory = defaultDir

  return {
    ...options,
    directory: options.directory || directory,
    template: options.template || template
  }
}

export const execute = async ( options: CreateAppOptions ): Promise<void> => {
  try {
    const git = Git({
      baseDir: process.cwd(),
      binary: 'git',
      maxConcurrentProcesses: 6,
      // Trimmed: false
    })

    options.directory = path.join( process.cwd(), options.directory as string )

    if( await fs.exists( options.directory ) ) {
      console.log(`Directory <${options.directory}> already exists`)
      process.exit(1)
    }

    // Create project template directory
    await cp('-R', path.join( __dirname, `../templates/create-${options.template}-app`), options.directory )

    /*
     * Clone Git repository to local
     * await git.clone(`https://github.com/ckenx/create-${options.template}-app.git`, options.directory as string )
     * Remove git completely from a directory
     * await rimraf( path.resolve( process.cwd(), `${options.directory || ''}/.git` ) )
     */

    // Install package dependencies
    await exec('npm install', { cwd: options.directory })

    // Create app completed
    console.info( clc.green.bold('-- Application created successfully --') )
  }
  catch( error ) { console.log( clc.red.bold('Unexpected - '), error ) }
}