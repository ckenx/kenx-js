# Setup Manager

The Setup Manager is responsible for loading configurations, importing plugins, and managing the TypeScript compilation process.

## Overview

The Setup Manager (`SetupManager` class) is the backbone of Kenx's configuration system. It handles:

- YAML configuration parsing
- Cross-file configuration merging
- Reference resolution
- Plugin discovery and import
- TypeScript compilation
- Module loading

**Location:** `packages/node/src/setup.ts`

---

## Core Responsibilities

### 1. Configuration Loading

The Setup Manager loads and parses YAML configuration files from the `.config/` directory.

```typescript
async loadConfig(target: SetupTarget): Promise<SetupConfig>
```

**Process:**

1. Parse target YAML file (e.g., `.config/index.yml`)
2. Check for `__extends__` property
3. Recursively load and merge extended files
4. Return combined configuration

**Example:**

```yaml
# .config/index.yml
typescript: true
__extends__: ['servers', 'databases']
```

The Setup Manager will:
1. Load `.config/index.yml`
2. Load `.config/servers.yml`
3. Load `.config/databases.yml`
4. Merge all three configurations

### 2. Cross-File Extension

The `__extends__` mechanism allows splitting configuration across multiple files.

```yaml
# .config/index.yml
__extends__: [
  'servers',
  'databases',
  'security'
]
```

**Benefits:**
- Better organization
- Reusable configuration modules
- Easier maintenance
- Version control friendly

### 3. Reference Resolution

Resolves configuration references using the pattern `[section]:key`.

```typescript
resolveReference(reference: string): any
```

**Supported References:**

**Environment Variables:**
```yaml
PORT: [env]:HTTP_PORT
```
Resolves to `process.env.HTTP_PORT`

**Configuration Sections:**
```yaml
bindTo: [servers]:default
```
Resolves to the server configuration with `key: default`

**Reference Syntax:**

```
[section]:key
```

- `section` - Configuration section name
- `key` - Specific key within that section

**Implementation:**

```typescript
private readonly REFERENCE_MATCH_REGEX = /\[([a-zA-Z0-9-_.]+)\]:([a-zA-Z0-9-_.]+)/i

resolveReference(reference: string) {
  const [_, section, key] = reference.match(this.REFERENCE_MATCH_REGEX) || []
  
  // Environment variables
  if (section === 'env') {
    return process.env[key]
  }
  
  // Configuration references
  if (Array.isArray(this.Config[section])) {
    return this.Config[section].find(item => item.key === key)
  }
  
  return this.Config[section]?.[key]
}
```

### 4. Plugin Management

The Setup Manager handles plugin discovery, import, and auto-installation.

```typescript
async importPlugin(refname: string)
```

**Plugin Discovery Process:**

1. **Check Local Plugins** - `./src/plugins/<plugin-name>`
2. **Check Node Modules** - `node_modules/<plugin-name>`
3. **Auto-Install** (Development only) - Install missing plugins

**Example:**

```yaml
servers:
  - plugin: '@ckenx/kenx-express'  # Auto-installed if missing
```

**Plugin Collection:**

As configurations are processed, plugins are automatically collected for installation:

```typescript
private Plugins: string[] = []

// During configuration compliance
if (key === 'plugin' && typeof value === 'string') {
  if (!this.Plugins.includes(value)) {
    this.Plugins.push(value)
  }
}
```

### 5. Module Resolution

Import application modules from the project's source directory.

```typescript
async importModule(path: string, throwError = false)
```

**Resolution Logic:**

```typescript
async importModule(path: string) {
  const basePath = this.Config?.typescript ?
    `${process.cwd()}/dist` :      // TypeScript: use compiled output
    this.Config.directory.base      // JavaScript: use source
  
  const fullPath = this.Path.join(basePath, path)
  
  try {
    return await import(fullPath)
  } catch (error) {
    if (throwError) throw error
    return null
  }
}
```

### 6. TypeScript Compilation

Automatic TypeScript compilation in development mode.

```typescript
async dev()
```

**Compilation Process:**

1. Check if TypeScript is enabled (`typescript: true`)
2. Look for custom `tsconfig.json`
3. Compile using `tsc-prog`
4. Resolve path aliases with `tsc-alias`

**Configuration:**

```typescript
tsc.build({
  basePath: process.cwd(),
  configFilePath: 'tsconfig.json',  // Optional
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
  exclude: ['**/*.test.ts']
})
```

**Path Alias Resolution:**

```typescript
await replaceTscAliasPaths({
  configFile: 'tsconfig.json',
  verbose: true
})
```

---

## API Reference

### Constructor

```typescript
new Setup()
```

Creates a new Setup Manager instance with:
- Context logger
- Empty configuration
- Plugin collection array

### Methods

#### `dev()`

Prepare application for development mode.

```typescript
async dev(): Promise<void>
```

**Steps:**
1. Load configuration
2. Collect plugins from config
3. Install missing plugins (development only)
4. Compile TypeScript (if enabled)

#### `build()`

Prepare application for production build.

```typescript
async build(): Promise<void>
```

**Steps:**
1. Load configuration
2. Clean output directory
3. Compile TypeScript
4. Resolve path aliases

#### `loadConfig(target)`

Load and parse configuration file.

```typescript
async loadConfig(target: SetupTarget): Promise<SetupConfig>
```

**Parameters:**
- `target` - Configuration file name (without extension)

**Returns:** Complete merged configuration

#### `getConfig(key?)`

Get loaded configuration or specific section.

```typescript
getConfig(key?: keyof SetupConfig): SetupConfig
```

**Parameters:**
- `key` - Optional section name

**Returns:** Full config or specific section

#### `importModule(path, throwError?)`

Import application module.

```typescript
async importModule(path: string, throwError?: boolean): Promise<any>
```

**Parameters:**
- `path` - Module path relative to base directory
- `throwError` - Throw error if module not found

**Returns:** Imported module or null

#### `importPlugin(refname)`

Import and return plugin.

```typescript
async importPlugin(refname: string): Promise<any>
```

**Parameters:**
- `refname` - Plugin package name

**Returns:** Plugin default export

**Throws:** Error if plugin not found

#### `resolveReference(reference)`

Resolve configuration reference.

```typescript
resolveReference(reference: string): any
```

**Parameters:**
- `reference` - Reference string (`[section]:key`)

**Returns:** Resolved value

#### `resolvePath(path)`

Resolve path relative to project directory base.

```typescript
resolvePath(path: string): string
```

**Parameters:**
- `path` - Relative path

**Returns:** Absolute path

---

## Usage Examples

### Basic Setup

```typescript
import SetupManager from './setup'

const Setup = new SetupManager()

// Load configuration
await Setup.dev()

// Get configuration
const config = Setup.getConfig()
const servers = Setup.getConfig('servers')

// Import module
const app = await Setup.importModule('./index')

// Import plugin
const ExpressPlugin = await Setup.importPlugin('@ckenx/kenx-express')
```

### Configuration Processing

```typescript
// Load with extension
const config = await Setup.loadConfig('index')

// Config with __extends__
// .config/index.yml:
//   __extends__: ['servers']
//
// Results in merged configuration:
// {
//   ...index.yml content,
//   ...servers.yml content
// }
```

### Plugin Auto-Installation

```typescript
// In development mode
await Setup.dev()

// Any plugins referenced in config are automatically installed:
// servers:
//   - plugin: '@ckenx/kenx-express'  ← Installed automatically
```

### Reference Resolution

```typescript
// Configuration with references
// servers:
//   - HOST: [env]:HTTP_HOST
//     PORT: [env]:HTTP_PORT

const servers = Setup.getConfig('servers')
// servers[0].HOST = process.env.HTTP_HOST
// servers[0].PORT = process.env.HTTP_PORT
```

---

## Configuration Flow

```
1. Application Start
   ↓
2. Setup.dev() or Setup.build()
   ↓
3. loadConfig('index')
   ├─ Parse index.yml
   ├─ Check for __extends__
   ├─ Load extended files recursively
   └─ Merge configurations
   ↓
4. comply(config)
   ├─ Resolve all references
   ├─ Collect plugin dependencies
   └─ Return processed config
   ↓
5. Install Plugins (dev only)
   ├─ Check package.json
   ├─ Install missing plugins
   └─ Update dependencies
   ↓
6. Compile TypeScript (if enabled)
   ├─ Read tsconfig.json
   ├─ Compile with tsc-prog
   └─ Resolve path aliases
   ↓
7. Configuration Ready
```

---

## Internal Properties

### `context`

Logger context for setup operations.

```typescript
public context = new Context('setup')
```

### `Config`

Loaded configuration object.

```typescript
private Config?: SetupConfig
```

### `Plugins`

Collected plugin dependencies.

```typescript
private Plugins: string[] = []
```

### `Path`

Node.js path module.

```typescript
public readonly Path = nodePath
```

### `Fs`

Node.js fs-extra module.

```typescript
public readonly Fs = nodeFs
```

---

## Error Handling

### Configuration Not Found

```typescript
if (!this.Config) {
  this.context.error('Setup configuration not found')
  process.exit(1)
}
```

### Plugin Not Found

```typescript
if (!plugin?.default) {
  throw new Error(`<${refname}> plugin not found`)
}
```

### TypeScript Compilation Error

```typescript
try {
  tsc.build({ /* ... */ })
} catch (error) {
  console.error(error)
  process.exit(1)
}
```

---

## Advanced Features

### Custom Configuration Targets

Load different configuration files:

```typescript
// Load alternative config
const testConfig = await Setup.loadConfig('test')
const prodConfig = await Setup.loadConfig('production')
```

### Dynamic Plugin Loading

```typescript
// Load plugin dynamically
const pluginName = config.server.plugin
const Plugin = await Setup.importPlugin(pluginName)
const instance = new Plugin(Setup, config)
```

### Path Resolution

```typescript
// Resolve paths relative to project base
const routesPath = Setup.resolvePath('./routes')
const modelsPath = Setup.resolvePath('./models')
```

---

## Debugging

### Enable Debug Logging

```typescript
Setup.context.debug('Configuration loaded:', config)
Setup.context.debug('Plugins collected:', this.Plugins)
```

### Configuration Inspection

```typescript
// View processed configuration
console.log(JSON.stringify(Setup.getConfig(), null, 2))
```

---

## Best Practices

1. **Single Setup Instance** - Use one Setup Manager per application
2. **Load Early** - Call `dev()` or `build()` before using resources
3. **Handle Errors** - Wrap setup calls in try-catch blocks
4. **Version Control** - Commit `.config/` directory
5. **Environment Separation** - Use references for environment-specific values

---

## Next Steps

- **[Core System](../core/index.md)** - Application lifecycle and resource management
- **[Configuration System](../configuration/index.md)** - Configuration guide
- **[Plugins](../plugins/index.md)** - Plugin development

---

**Previous:** [← Environment](../environment/index.md) | **Next:** [Core System →](../core/index.md)
