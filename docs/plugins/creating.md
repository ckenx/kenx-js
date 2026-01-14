# Creating Plugins

Guide to creating custom Kenx plugins for extending framework functionality.

## Overview

Kenx plugins are modular extensions that integrate with the core system. You can create plugins for:
- HTTP frameworks (Express, Fastify, custom)
- Databases (MySQL, MongoDB, PostgreSQL)
- Real-time services (Socket.io, WebSockets)
- Build tools (Vite, Webpack)
- Custom services (caching, logging, auth)

**Plugin Types:**
- **Server Plugins** - HTTP servers and applications
- **Database Plugins** - Database connections and ORM
- **Auxiliary Plugins** - Socket.io, message queues, etc.
- **Custom Plugins** - Any service or utility

---

## Plugin Structure

### Basic Plugin Class

```typescript
// src/plugins/my-plugin.ts
export default class MyPlugin {
  private config: any
  private Setup: any
  
  constructor(Setup: any, config: any) {
    this.Setup = Setup
    this.config = config
    this.initialize()
  }
  
  private initialize() {
    // Plugin initialization logic
    console.log('MyPlugin initialized with config:', this.config)
  }
  
  // Plugin methods
  public doSomething() {
    return 'Plugin working!'
  }
}
```

### Server Plugin Structure

```typescript
export default class MyServerPlugin {
  public server: any
  public app: any
  
  constructor(Setup: any, config: any) {
    this.server = this.createServer()
    this.app = this.createApplication()
  }
  
  private createServer() {
    // Create HTTP server
    const http = require('http')
    return http.createServer()
  }
  
  private createApplication() {
    return {
      router: (path: string, handler: Function) => {
        // Route registration logic
      }
    }
  }
  
  async listen(): Promise<any> {
    const port = this.config.PORT || 8000
    return new Promise((resolve) => {
      this.server.listen(port, () => {
        console.log(`Server listening on port ${port}`)
        resolve(this.server)
      })
    })
  }
  
  async close(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => resolve())
    })
  }
}
```

### Database Plugin Structure

```typescript
export default class MyDatabasePlugin {
  private connection: any
  private config: any
  
  constructor(Setup: any, config: any) {
    this.config = config
    
    if (config.autoconnect) {
      this.connect()
    }
  }
  
  async connect() {
    // Establish database connection
    this.connection = await this.createConnection()
    console.log('Database connected')
  }
  
  private async createConnection() {
    // Return database connection
    return {} // Your connection logic
  }
  
  getConnection() {
    return this.connection
  }
  
  async query(sql: string, params?: any[]) {
    // Execute query
    return this.connection.query(sql, params)
  }
  
  async close() {
    if (this.connection) {
      await this.connection.end()
    }
  }
}
```

---

## Plugin Configuration

### Registering Plugin in Config

```yaml
# .config/index.yml
servers:
  - type: http
    key: api
    plugin: '@myorg/my-server-plugin'
    HOST: [env]:HTTP_HOST
    PORT: [env]:HTTP_PORT
    customOption: value

databases:
  - type: custom
    key: default
    plugin: '@myorg/my-database-plugin'
    autoconnect: true
    options:
      host: localhost
      port: 5432
```

### Local Plugin Path

```yaml
servers:
  - plugin: './src/plugins/my-plugin'
    key: custom
```

---

## Plugin Development

### Step 1: Project Setup

**Create plugin directory:**
```bash
mkdir my-kenx-plugin
cd my-kenx-plugin
npm init -y
```

**package.json:**
```json
{
  "name": "@myorg/kenx-my-plugin",
  "version": "1.0.0",
  "description": "My custom Kenx plugin",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "prepublish": "npm run build"
  },
  "keywords": ["kenx", "kenx-plugin"],
  "peerDependencies": {
    "@ckenx/node": "^0.0.1"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 2: Implement Plugin

**src/index.ts:**
```typescript
import http from 'http'
import { ServerConfig } from './types'

export default class MyServerPlugin {
  public server: http.Server
  public app: any
  private config: ServerConfig
  
  constructor(Setup: any, config: ServerConfig) {
    this.config = config
    this.server = http.createServer()
    this.app = this.createApp()
    this.setupMiddleware()
  }
  
  private createApp() {
    const routes = new Map()
    
    return {
      router: (path: string, handler: Function) => {
        routes.set(path, handler)
      },
      getRoutes: () => routes
    }
  }
  
  private setupMiddleware() {
    this.server.on('request', (req, res) => {
      const routes = this.app.getRoutes()
      const handler = routes.get(req.url)
      
      if (handler) {
        handler(req, res)
      } else {
        res.statusCode = 404
        res.end('Not Found')
      }
    })
  }
  
  async listen(): Promise<http.Server> {
    const port = this.config.PORT || 8000
    const host = this.config.HOST || '0.0.0.0'
    
    return new Promise((resolve, reject) => {
      this.server.listen(port, host, () => {
        console.log(`Server running at http://${host}:${port}`)
        resolve(this.server)
      })
      
      this.server.on('error', reject)
    })
  }
  
  async close(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => resolve())
    })
  }
}
```

**src/types.ts:**
```typescript
export interface ServerConfig {
  HOST: string
  PORT: number
  [key: string]: any
}
```

### Step 3: Build Plugin

```bash
npm run build
```

### Step 4: Test Plugin Locally

**Link plugin locally:**
```bash
# In plugin directory
npm link

# In your Kenx app
npm link @myorg/kenx-my-plugin
```

**Use in config:**
```yaml
servers:
  - plugin: '@myorg/kenx-my-plugin'
    key: custom
    HOST: localhost
    PORT: 8000
```

---

## Advanced Plugin Patterns

### Plugin with Lifecycle Hooks

```typescript
export default class AdvancedPlugin {
  constructor(Setup: any, config: any) {
    this.init(Setup, config)
  }
  
  // Initialization
  private async init(Setup: any, config: any) {
    await this.beforeInit()
    await this.initialize(config)
    await this.afterInit()
  }
  
  async beforeInit() {
    // Pre-initialization logic
  }
  
  async initialize(config: any) {
    // Main initialization
  }
  
  async afterInit() {
    // Post-initialization logic
  }
}
```

### Plugin with Options Validation

```typescript
import Joi from 'joi'

const configSchema = Joi.object({
  HOST: Joi.string().required(),
  PORT: Joi.number().port().required(),
  timeout: Joi.number().default(30000)
})

export default class ValidatedPlugin {
  constructor(Setup: any, config: any) {
    const { error, value } = configSchema.validate(config)
    
    if (error) {
      throw new Error(`Plugin config validation failed: ${error.message}`)
    }
    
    this.config = value
  }
}
```

### Plugin with Event Emitter

```typescript
import { EventEmitter } from 'events'

export default class EventPlugin extends EventEmitter {
  constructor(Setup: any, config: any) {
    super()
    this.config = config
    this.setup()
  }
  
  private setup() {
    // Emit events
    this.emit('initialized', this.config)
  }
  
  public on(event: string, listener: Function) {
    return super.on(event, listener)
  }
}

// Usage
const plugin = new EventPlugin(Setup, config)
plugin.on('initialized', (config) => {
  console.log('Plugin initialized:', config)
})
```

### Middleware Plugin

```typescript
export default class MiddlewarePlugin {
  private middlewares: Function[] = []
  
  constructor(Setup: any, config: any) {
    this.config = config
  }
  
  use(middleware: Function) {
    this.middlewares.push(middleware)
  }
  
  async execute(context: any) {
    for (const middleware of this.middlewares) {
      await middleware(context)
    }
  }
}
```

---

## Express Plugin Example

Complete example of an Express plugin:

```typescript
import express, { Express, Request, Response } from 'express'
import http from 'http'

export default class ExpressPlugin {
  public server: http.Server
  public framework: Express
  public app: any
  
  constructor(Setup: any, config: any) {
    this.framework = express()
    this.server = http.createServer(this.framework)
    this.app = this.createAdapter()
    this.setupDefaults()
  }
  
  private createAdapter() {
    return {
      router: (path: string, options: any) => {
        if (typeof options === 'function') {
          // Simple handler
          this.framework.all(path, options)
        } else if (options.method && options.handler) {
          // Method-specific
          const method = options.method.toLowerCase()
          this.framework[method](path, options.handler)
        } else {
          // Multiple methods
          Object.keys(options).forEach(method => {
            if (typeof options[method] === 'function') {
              this.framework[method.toLowerCase()](path, options[method])
            }
          })
        }
      }
    }
  }
  
  private setupDefaults() {
    // Default middleware
    this.framework.use(express.json())
    this.framework.use(express.urlencoded({ extended: true }))
  }
  
  async listen(): Promise<http.Server> {
    const port = this.config.PORT || 8000
    const host = this.config.HOST || '0.0.0.0'
    
    return new Promise((resolve) => {
      this.server.listen(port, host, () => {
        console.log(`Express server on http://${host}:${port}`)
        resolve(this.server)
      })
    })
  }
  
  async close(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => resolve())
    })
  }
}
```

---

## Testing Plugins

### Unit Tests

```typescript
// test/plugin.test.ts
import MyPlugin from '../src/index'

describe('MyPlugin', () => {
  let plugin: MyPlugin
  
  beforeEach(() => {
    const mockSetup = {}
    const config = {
      HOST: 'localhost',
      PORT: 8000
    }
    plugin = new MyPlugin(mockSetup, config)
  })
  
  it('should initialize correctly', () => {
    expect(plugin).toBeDefined()
    expect(plugin.server).toBeDefined()
  })
  
  it('should register routes', () => {
    const handler = jest.fn()
    plugin.app.router('/test', handler)
    
    const routes = plugin.app.getRoutes()
    expect(routes.has('/test')).toBe(true)
  })
})
```

### Integration Tests

```typescript
import request from 'supertest'
import MyPlugin from '../src/index'

describe('MyPlugin Integration', () => {
  let plugin: MyPlugin
  
  beforeAll(async () => {
    plugin = new MyPlugin({}, { PORT: 0 })
    
    plugin.app.router('/test', (req, res) => {
      res.end('OK')
    })
    
    await plugin.listen()
  })
  
  afterAll(async () => {
    await plugin.close()
  })
  
  it('should handle requests', async () => {
    const response = await request(plugin.server)
      .get('/test')
      .expect(200)
    
    expect(response.text).toBe('OK')
  })
})
```

---

## Publishing Plugin

### Step 1: Prepare for Publishing

**Update package.json:**
```json
{
  "name": "@myorg/kenx-my-plugin",
  "version": "1.0.0",
  "description": "My custom Kenx plugin",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/myorg/kenx-my-plugin"
  },
  "keywords": [
    "kenx",
    "kenx-plugin",
    "server"
  ],
  "author": "Your Name",
  "license": "MIT"
}
```

**Create README.md:**
```markdown
# @myorg/kenx-my-plugin

Custom Kenx plugin for [purpose].

## Installation

npm install @myorg/kenx-my-plugin

## Usage

.config/servers.yml:
servers:
  - plugin: '@myorg/kenx-my-plugin'
    key: myserver
    PORT: 8000

## Configuration Options

- `HOST` - Server host (default: '0.0.0.0')
- `PORT` - Server port (default: 8000)
```

### Step 2: Build and Test

```bash
npm run build
npm test
npm pack  # Test package creation
```

### Step 3: Publish to npm

```bash
# Login to npm
npm login

# Publish
npm publish --access public
```

### Step 4: Version Management

```bash
# Patch version (1.0.0 -> 1.0.1)
npm version patch

# Minor version (1.0.0 -> 1.1.0)
npm version minor

# Major version (1.0.0 -> 2.0.0)
npm version major

# Push tags
git push --tags
```

---

## Plugin Naming Conventions

**Follow Kenx naming conventions:**
- Prefix with `kenx-`: `@myorg/kenx-express`, `kenx-mysql`
- Use kebab-case: `kenx-my-plugin`
- Be descriptive: `kenx-socketio`, `kenx-mongodb`

**Package scope:**
- Official plugins: `@ckenx/kenx-*`
- Community plugins: `@yourorg/kenx-*` or `kenx-*`

---

## Best Practices

1. **Type Safety** - Use TypeScript for better DX
2. **Error Handling** - Handle errors gracefully
3. **Configuration Validation** - Validate config options
4. **Documentation** - Document all config options
5. **Testing** - Write comprehensive tests
6. **Semantic Versioning** - Follow semver
7. **Peer Dependencies** - Declare Kenx as peer dependency
8. **Minimal Dependencies** - Keep dependencies minimal
9. **TypeScript Definitions** - Export types
10. **Examples** - Provide usage examples

---

## Plugin Development Checklist

- [ ] Plugin class implemented
- [ ] Configuration validated
- [ ] TypeScript types defined
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] README.md created
- [ ] package.json configured
- [ ] Build script working
- [ ] Tested with real Kenx app
- [ ] Documentation complete
- [ ] Published to npm (if public)

---

## Resources

- **[Plugin System Overview](./index.md)** - Plugin concepts
- **[Available Plugins](./available.md)** - Official plugins list
- **[TypeScript Types](https://github.com/ckenx/kenx-js/tree/main/packages/node/src/types)** - Type definitions

---

## Examples

Check the official plugins for reference:
- [`@ckenx/kenx-express`](https://github.com/ckenx/kenx-js/tree/main/packages/plugins/kenx-express)
- [`@ckenx/kenx-fastify`](https://github.com/ckenx/kenx-js/tree/main/packages/plugins/kenx-fastify)
- [`@ckenx/kenx-mysql`](https://github.com/ckenx/kenx-js/tree/main/packages/plugins/kenx-mysql)

---

**Previous:** [← Plugin System](./index.md) | **Next:** [Available Plugins →](./available.md)
