# Plugin System

Kenx's plugin system enables modular, extensible applications. Plugins provide servers, databases, frameworks, and custom functionality.

## Overview

Plugins are the building blocks of Kenx applications. They provide implementations for:
- HTTP servers (Express, Fastify, native HTTP)
- Databases (MySQL, MongoDB, Redis)
- Real-time servers (Socket.io, WebSocket)
- Build tools (Vite)
- Custom functionality

**Key Features:**
- **Auto-installation** - Missing plugins install automatically in development
- **Configuration-driven** - Declare plugins in YAML
- **Type-safe** - Full TypeScript support
- **Modular** - Use only what you need

---

## Official Plugins

### Server Plugins

#### Express Plugin

HTTP server with Express framework.

**Package:** `@ckenx/kenx-express`

**Configuration:**
```yaml
servers:
  - type: http
    plugin: '@ckenx/kenx-express'
    application:
      type: express
      plugin: '@ckenx/kenx-express'
```

**Features:**
- Express routing
- Middleware support
- Static file serving
- Session management

#### Fastify Plugin

High-performance HTTP server with Fastify.

**Package:** `@ckenx/kenx-fastify`

**Configuration:**
```yaml
servers:
  - type: http
    plugin: '@ckenx/kenx-fastify'
    application:
      type: fastify
      plugin: '@ckenx/kenx-fastify'
```

**Features:**
- Fast routing
- JSON schema validation
- Built-in logging
- Plugin ecosystem

#### HTTP Plugin

Native Node.js HTTP server.

**Package:** `@ckenx/kenx-http`

**Configuration:**
```yaml
servers:
  - type: http
    plugin: '@ckenx/kenx-http'
```

**Features:**
- Minimal overhead
- Direct HTTP control
- WebSocket support

### Real-Time Plugins

#### Socket.io Plugin

Real-time bidirectional communication.

**Package:** `@ckenx/kenx-socketio`

**Configuration:**
```yaml
servers:
  - type: socketio
    plugin: '@ckenx/kenx-socketio'
    bindTo: http:api
```

**Features:**
- Real-time events
- Room support
- Broadcasting
- Reconnection handling

### Database Plugins

#### MySQL Plugin

MySQL and MariaDB database support.

**Package:** `@ckenx/kenx-mysql`

**Configuration:**
```yaml
databases:
  - type: mysql
    plugin: '@ckenx/kenx-mysql'
    autoconnect: true
    options:
      host: localhost
      database: myapp
```

**Features:**
- Connection pooling
- Prepared statements
- Transaction support
- Promise-based API

#### MongoDB Plugin

MongoDB NoSQL database support.

**Package:** `@ckenx/kenx-mongodb`

**Configuration:**
```yaml
databases:
  - type: mongodb
    plugin: '@ckenx/kenx-mongodb'
    autoconnect: true
    uri: mongodb://localhost:27017/myapp
```

**Features:**
- Native driver
- Collection operations
- Aggregation support
- Change streams

### Build Tool Plugins

#### Vite Plugin

Frontend build tool integration.

**Package:** `@ckenx/kenx-vite`

**Configuration:**
```yaml
servers:
  - type: vite
    plugin: '@ckenx/kenx-vite'
    build: true
    options:
      root: './src/client'
      outDir: './public/dist'
```

**Features:**
- Fast HMR
- TypeScript support
- Framework integration
- Production builds

### Enhancement Plugins

#### Express Assets Plugin

Static asset serving for Express.

**Package:** `@ckenx/kenx-express-assets`

**Configuration:**
```yaml
assets:
  static:
    - path: '/public'
      directory: './public'
```

#### Express Session Plugin

Session management for Express.

**Package:** `@ckenx/kenx-express-session`

**Configuration:**
```yaml
sessions:
  - type: local
    secret: [env]:SESSION_SECRET
```

---

## Using Plugins

### Installation

Plugins can be installed via CLI or package manager.

**Via CLI:**
```bash
ckenx install @ckenx/kenx-express
ckenx install @ckenx/kenx-mysql
```

**Via npm:**
```bash
npm install @ckenx/kenx-express
npm install @ckenx/kenx-mysql
```

**Auto-Installation (Development):**

In development mode, plugins referenced in configuration are automatically installed:

```yaml
# .config/servers.yml
servers:
  - plugin: '@ckenx/kenx-express'  # Auto-installed if missing
```

### Configuration

Plugins are declared in YAML configuration files.

**Basic Configuration:**
```yaml
servers:
  - type: http
    key: api
    plugin: '@ckenx/kenx-express'
```

**With Options:**
```yaml
databases:
  - type: mysql
    key: default
    plugin: '@ckenx/kenx-mysql'
    autoconnect: true
    options:
      host: [env]:DB_HOST
      database: [env]:DB_NAME
```

### Accessing Plugin Resources

Use the takeover mechanism to access plugin-created resources:

```typescript
export const takeover = ['http:api']

export default async (server) => {
  // server provided by @ckenx/kenx-express
  const { app } = server
  app.router('/', (req, res) => {
    res.json({ message: 'Hello!' })
  })
  await server.listen()
}
```

---

## Creating Custom Plugins

### Plugin Structure

A Kenx plugin is a Node.js module that exports a default class or function.

**Basic Plugin:**
```typescript
// my-plugin/index.ts
export default class MyPlugin {
  constructor(Setup, config) {
    this.Setup = Setup
    this.config = config
  }
  
  async initialize() {
    // Plugin initialization logic
  }
  
  getConnection() {
    // Return connection or resource
  }
}
```

### Plugin Types

#### Server Plugin

Creates HTTP or auxiliary servers.

```typescript
import type { ServerPlugin } from '@ckenx/node/types'
import http from 'http'

export default class MyServerPlugin implements ServerPlugin<http.Server> {
  public server: http.Server
  public app: any
  
  constructor(Setup, config) {
    this.server = http.createServer()
    this.app = this.createApp()
  }
  
  createApp() {
    return {
      router: (path, handler) => {
        // Route registration logic
      }
    }
  }
  
  async listen() {
    const port = this.config.PORT || 8000
    return new Promise((resolve) => {
      this.server.listen(port, () => {
        console.log(`Server listening on port ${port}`)
        resolve(this.server)
      })
    })
  }
}
```

#### Database Plugin

Creates database connections.

```typescript
import type { DatabasePlugin } from '@ckenx/node/types'
import mysql from 'mysql2/promise'

export default class MySQLPlugin implements DatabasePlugin {
  private connection: any
  
  constructor(Setup, config) {
    this.config = config
  }
  
  async connect() {
    this.connection = await mysql.createConnection({
      host: this.config.options.host,
      database: this.config.options.database,
      user: this.config.options.user,
      password: this.config.options.password
    })
  }
  
  getConnection() {
    return this.connection
  }
  
  async close() {
    await this.connection.end()
  }
}
```

### Plugin Configuration Schema

Define what configuration your plugin accepts:

```typescript
interface MyPluginConfig {
  type: string
  key: string
  plugin: string
  options: {
    host: string
    port: number
    timeout?: number
  }
}

export default class MyPlugin {
  constructor(Setup, config: MyPluginConfig) {
    this.validateConfig(config)
    // Initialize plugin
  }
  
  private validateConfig(config: MyPluginConfig) {
    if (!config.options.host) {
      throw new Error('Host is required')
    }
  }
}
```

### Plugin Lifecycle

1. **Import** - Plugin imported by Setup Manager
2. **Instantiate** - Constructor called with Setup and config
3. **Initialize** - `initialize()` or `connect()` called
4. **Use** - Resources accessed via takeover
5. **Cleanup** - `close()` or cleanup methods called on shutdown

---

## Plugin Development Guide

### Setup

Create a new npm package:

```bash
mkdir kenx-myplugin
cd kenx-myplugin
npm init -y
```

**package.json:**
```json
{
  "name": "@myorg/kenx-myplugin",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "prepublish": "npm run build"
  },
  "dependencies": {
    "@ckenx/node": "^0.0.16"
  },
  "devDependencies": {
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
    "esModuleInterop": true
  }
}
```

### Implementation

**src/index.ts:**
```typescript
import type { DatabasePlugin } from '@ckenx/node/types'

export default class MyDatabasePlugin implements DatabasePlugin {
  private connection: any
  private config: any
  
  constructor(Setup: any, config: any) {
    this.config = config
  }
  
  async connect() {
    // Establish connection
    this.connection = await this.createConnection()
  }
  
  private async createConnection() {
    // Connection logic
    return {}
  }
  
  getConnection() {
    return this.connection
  }
  
  async close() {
    // Cleanup
    if (this.connection) {
      await this.connection.close()
    }
  }
}
```

### Testing

**test/plugin.test.ts:**
```typescript
import MyPlugin from '../src'

describe('MyPlugin', () => {
  let plugin: any
  
  beforeEach(() => {
    const mockSetup = {}
    const config = {
      type: 'mydb',
      key: 'default',
      options: {
        host: 'localhost'
      }
    }
    plugin = new MyPlugin(mockSetup, config)
  })
  
  it('should create instance', () => {
    expect(plugin).toBeDefined()
  })
  
  it('should connect', async () => {
    await plugin.connect()
    expect(plugin.getConnection()).toBeDefined()
  })
})
```

### Publishing

```bash
# Build
npm run build

# Publish to npm
npm publish --access public
```

---

## Plugin Best Practices

1. **Error Handling** - Gracefully handle connection failures
2. **Resource Cleanup** - Implement `close()` methods
3. **Configuration Validation** - Validate config in constructor
4. **Type Safety** - Provide TypeScript definitions
5. **Documentation** - Document configuration options
6. **Testing** - Write unit and integration tests
7. **Logging** - Use consistent logging patterns
8. **Versioning** - Follow semantic versioning

---

## Plugin Examples

### Custom Cache Plugin

```typescript
// kenx-cache/src/index.ts
import Redis from 'ioredis'

export default class CachePlugin {
  private redis: Redis
  
  constructor(Setup, config) {
    this.redis = new Redis(config.options)
  }
  
  async get(key: string) {
    return await this.redis.get(key)
  }
  
  async set(key: string, value: string, ttl?: number) {
    if (ttl) {
      await this.redis.setex(key, ttl, value)
    } else {
      await this.redis.set(key, value)
    }
  }
  
  async del(key: string) {
    await this.redis.del(key)
  }
  
  async close() {
    await this.redis.quit()
  }
}
```

**Configuration:**
```yaml
custom:
  - type: cache
    key: redis
    plugin: '@myorg/kenx-cache'
    options:
      host: localhost
      port: 6379
```

**Usage:**
```typescript
export const takeover = ['custom:redis']

export default (cache) => {
  await cache.set('key', 'value', 300)
  const value = await cache.get('key')
}
```

### Custom Logger Plugin

```typescript
// kenx-logger/src/index.ts
import winston from 'winston'

export default class LoggerPlugin {
  private logger: winston.Logger
  
  constructor(Setup, config) {
    this.logger = winston.createLogger({
      level: config.options.level || 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
      ]
    })
  }
  
  info(message: string, meta?: any) {
    this.logger.info(message, meta)
  }
  
  error(message: string, meta?: any) {
    this.logger.error(message, meta)
  }
  
  warn(message: string, meta?: any) {
    this.logger.warn(message, meta)
  }
}
```

---

## Plugin Registry

### Finding Plugins

**Official Plugins:**
- Browse at `https://github.com/codewithdark/kenx-js/tree/main/packages/plugins`

**Community Plugins:**
- Search npm for `kenx-` prefix
- Check Kenx documentation

### Contributing Plugins

1. Fork the Kenx repository
2. Create plugin in `packages/plugins/`
3. Follow naming convention: `kenx-<name>`
4. Add tests and documentation
5. Submit pull request

---

## Troubleshooting

### Plugin Not Found

**Error:** `<@ckenx/kenx-express> plugin not found`

**Solutions:**
- Install plugin: `npm install @ckenx/kenx-express`
- Check plugin name in configuration
- Verify package.json dependencies

### Plugin Version Conflicts

**Error:** Multiple plugin versions installed

**Solutions:**
- Check `package-lock.json`
- Run `npm dedupe`
- Specify exact versions in `package.json`

### Plugin Initialization Failed

**Error:** Plugin constructor throws error

**Solutions:**
- Check configuration values
- Verify environment variables
- Review plugin documentation

---

## Next Steps

- **[Creating Plugins](./creating.md)** - Detailed plugin development guide
- **[Available Plugins](./available.md)** - Complete plugin catalog
- **[Adapters](../adapters/index.md)** - Framework adapters

---

**Previous:** [← Services & Resources](../services-and-resources/index.md) | **Next:** [Adapters →](../adapters/index.md)
