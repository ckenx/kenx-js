
import type { BuildAppOptions } from './types'
import { replaceTscAliasPaths } from 'tsc-alias'
import * as tsc from 'tsc-prog'

export const execute = async ( options: BuildAppOptions ): Promise<void> => {
  try {
    /**
     * Build TypeScript activated projects programmatically.
     *
     * IMPORTANT: Less suited for development builds so look out
     * for an alternative in the next versions.
     */
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
        skipLibCheck: true
      },
      include: ['src/**/*'],
      exclude: ['**/*.test.ts', '**/*.spec.ts']
    })

    /**
     * Replace alias paths with relative paths after
     * typescript compilation.
     *
     * Note:
     * Usefull when you add aliases that reference
     * other projects outside your tsconfig.json project
     * by providing a relative path to the baseUrl.
     */
    await replaceTscAliasPaths({ configFile: 'tsconfig.json' })
  }
  catch( error: any ) {
    console.error( error )
    process.exit(1)
  }
}