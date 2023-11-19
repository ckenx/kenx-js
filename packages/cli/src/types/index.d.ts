
export type CreateAppOptions = {
  verb: 'create'
  template?: 'node' | 'deno' | 'bun'
  directory?: string
}

export type InstallPluginOptions = {
  verb: 'install'
  plugin?: string
}

export type BuildAppOptions = {
  verb: 'build'
}

export type RunAppOptions = {
  verb: 'run'
  prod?: boolean
}