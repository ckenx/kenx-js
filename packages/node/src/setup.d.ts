// / <reference types="node" />
import type { SetupConfig, SetupTarget } from '#types/index'
import nodeFs from 'fs-extra'
import nodePath from 'node:path'
export default class Setup {
    context: any
    private readonly REFERENCE_MATCH_REGEX
    private readonly PLUGIN_NAME_MATCH_REGEX
    private Config?
    private Plugins
    readonly Path: nodePath.PlatformPath
    readonly Fs: typeof nodeFs
    private parseYaml
    private comply
    initialize(): Promise<void>;
    /**
     * Load setup configurations
     */
    loadConfig(target: SetupTarget): Promise<any>;
    /**
     * Return setup configurations
     */
    getConfig(key?: keyof SetupConfig): SetupConfig;
    /**
     * Import module
     */
    importModule(path: string, throwError?: boolean): Promise<any>;
    /**
     * Import plugin
     */
    importPlugin(refname: string): Promise<any>;
    /**
     * Resolve setup reference
     */
    resolveReference(reference: string): any;
    /**
     * Resolve path with specified project
     * directory root as dirname
     */
    resolvePath(path: string): string;
}
