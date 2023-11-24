
import type { BuildAppOptions } from './types'
import * as tsc from 'tsc-prog'

export const execute = async ( options: BuildAppOptions ): Promise<void> => {
  try {
    tsc.build({
      basePath: process.cwd(),
      configFilePath: 'tsconfig.json', // Inherited config (optional)
      clean: {
        outDir: true,
        declarationDir: true
      },
      compilerOptions: {
        rootDir: 'src',
        outDir: 'dist',
        declaration: true,
        skipLibCheck: true,
      },
      include: ['src/**/*'],
      exclude: ['**/*.test.ts', '**/*.spec.ts'],
    })
  }
  catch( error: any ) {
    console.error( error )
    process.exit(1)
  }
}