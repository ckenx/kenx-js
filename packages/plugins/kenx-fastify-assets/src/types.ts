
export type JSObject<Type> = { [index: string]: Type }

export type StaticAssetConfig = {
  root: string
  options: JSObject<any>
}
export type AssetStorageSpace = {
  endpoint: string
  baseURL: string
  region: string
  bucket: string
}
export type AssetStorageConfig = {
  type: 'local' | 'cloud'
  path?: string // Only for local type
  client?:{
    key: string
    secret: string
    version?: string
  }
  spaces?: AssetStorageSpace[]
}
export type AssetUploadConfig = {
  maxFileSize: number
  mimeTypes: string[]
}
export type AssetConfig = {
  plugin?: string
  storage: AssetStorageConfig
  upload: AssetUploadConfig
  static: StaticAssetConfig[]
}