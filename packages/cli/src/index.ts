import type { CreateAppOptions, InstallPluginOptions, BuildAppOptions, RunAppOptions } from './types'
import arg from 'arg'
import * as Run from './run'
import * as Build from './build'
import * as Create from './create'
import * as Install from './install'

function parseArgs( rawArgs: string[] ){
  const
  options = {
    '--node': Boolean,
    '--deno': Boolean,
    '--bun': Boolean,
    '--dev': Boolean,
    '--prod': Boolean,
    '-h': '--help',
    '-v': '--version'
  },
  args = arg( options, { argv: rawArgs.slice(2) } )

  switch( args._[0] ) {
    // Create app
    case 'create': {
      const options: CreateAppOptions = {
        verb: 'create',
        directory: args._[1]
      }

      if( args['--node'] ) options.template = 'node'
      if( args['--deno'] ) options.template = 'deno'
      if( args['--bun'] ) options.template = 'bun'

      return options
    }

    // Install plugin
    case 'install': {
      const options: InstallPluginOptions = {
        verb: 'install',
        plugin: args._[1]
      }

      return options
    }

    // Build application
    case 'build': {
      const options: BuildAppOptions = {
        verb: 'build'
      }

      return options
    }

    // Run application
    case 'run': {
      const options: RunAppOptions = {
        verb: 'run',
        prod: args['--prod'] || false
      }

      return options
    }

    // CLI version
    case '-v': console.log('1.0.0'); break

    // Display help
    case '-h':
    default: {
        console.log(`
Usage: ckenx <command> [options] [ -e script | script.ts ] [arguments]

Options:

  -e, --eval [code]               Evaluate code
  -p, --print                     Print result of \`--eval\`
  -r, --require [path]            Require a node module before execution
  -i, --interactive               Opens the REPL even if stdin does not appear to be a terminal

  --esm                           Bootstrap with the ESM loader, enabling full ESM support
  --swc                           Use the faster swc transpiler

  -h, --help                      Print CLI usage
  -v, --version                   Print module version information.  -vvv to print additional information
  --showConfig                    Print resolved configuration and exit

  -T, --transpileOnly             Use TypeScript's faster \`transpileModule\` or a third-party transpiler
  -H, --compilerHost              Use TypeScript's compiler host API
  -I, --ignore [pattern]          Override the path patterns to skip compilation
  -P, --project [path]            Path to TypeScript JSON project file
  -C, --compiler [name]           Specify a custom TypeScript compiler
  --transpiler [name]             Specify a third-party, non-typechecking transpiler
  -D, --ignoreDiagnostics [code]  Ignore TypeScript warnings by diagnostic code
  -O, --compilerOptions [opts]    JSON object to merge with compiler options

  --cwd                           Behave as if invoked within this working directory.
  --files                         Load \`files\`, \`include\` and \`exclude\` from \`tsconfig.json\` on startup
  --pretty                        Use pretty diagnostic formatter (usually enabled by default)
  --cwdMode                       Use current directory instead of <script.ts> for config resolution
  --skipProject                   Skip reading \`tsconfig.json\`
  --skipIgnore                    Skip \`--ignore\` checks
  --emit                          Emit output files into \`.ts-node\` directory
  --scope                         Scope compiler to files within \`scopeDir\`.  Anything outside this directory is ignored.
  --scopeDir                      Directory for \`--scope\`
  --preferTsExts                  Prefer importing TypeScript files over JavaScript files
  --logError                      Logs TypeScript errors to stderr instead of throwing exceptions
  --noExperimentalReplAwait       Disable top-level await in REPL.  Equivalent to node's --no-experimental-repl-await
  --experimentalSpecifierResolution [node|explicit]
                                  Equivalent to node's --experimental-specifier-resolution
`)
    }
  }
}

export async function cli( args: string[] ){
  let options = parseArgs( args )
  // Options = await promptMissingOptions( options )
  if( !options ) return

  switch( options.verb ) {
    case 'create': {
      options = await Create.checkOptions( options )
      Create.execute( options )
    } break

    case 'install': {
      options = await Install.checkOptions( options )
      Install.execute( options )
    } break

    case 'build': Build.execute( options ); break

    case 'run': Run.execute( options ); break

    default: console.log('Show ckenx --help -n')
  }
}