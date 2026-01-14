# Core System

The Core System orchestrates the application lifecycle, managing resource loading, dispatching application logic, and coordinating between components.

## Overview

The Core System (`Core` class) is the runtime engine of Kenx. It works with the Setup Manager to create a complete application execution environment.

**Location:** `packages/node/src/index.ts`

**Key Responsibilities:**
- Resource autoloading and management
- Application pattern dispatch (Singleton/MVC)
- Server lifecycle management
- Build process coordination
- Resource takeover (dependency injection)

---

## Architecture

```
┌─────────────────────────────────────────────┐
│           Application Entry Point           │
│         node -r @ckenx/node                 │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│            Setup Manager                    │
│  • Load configuration                       │
│  • Install plugins                          │
│  • Compile TypeScript                       │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│              Core System                    │
│  • Autoload resources                       │
│  • Dispatch application                     │
│  • Manage lifecycle                         │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴──────────┐
        ▼                    ▼
┌──────────────┐    ┌──────────────┐
│  Singleton   │    │     MVC      │
│   Pattern    │    │   Pattern    │
└──────────────┘    └──────────────┘
```

---

## Application Lifecycle

### 1. Initialization

```typescript
import Core from '@ckenx/node'

// Core automatically initializes on import
```

**Steps:**
1. Create Setup Manager instance
2. Load environment variables
3. Parse configuration files
4. Install missing plugins (development)
5. Compile TypeScript (if enabled)

### 2. Autoload Phase

```typescript
await Core.autoload()
```

**Resource Loading Order:**
1. **HTTP Servers** - Web servers and applications
2. **Auxiliary Servers** - WebSocket, Socket.io, Vite, etc.
3. **Databases** - Database connections
4. **Custom Resources** - User-defined resources

**Example:**

```yaml
# .config/index.yml
servers:
  - type: http
    key: api
    plugin: '@ckenx/kenx-express'

databases:
  - type: mysql
    key: default
    plugin: '@ckenx/kenx-mysql'
```

Core will:
1. Create HTTP server → Store as `RESOURCES.http.api`
2. Create MySQL connection → Store as `RESOURCES.database.default`

### 3. Dispatch Phase

```typescript
await Core.dispatch()
```

Executes application logic based on configured pattern:

**Singleton Pattern (`pattern: '-'`):**
```typescript
// src/index.ts
export const takeover = ['http']

export default async (httpServer) => {
  const { app } = httpServer
  app.router('/', (req, res) => {
    res.json({ message: 'Hello!' })
  })
  await httpServer.listen()
}
```

**MVC Pattern (`pattern: 'mvc'`):**
```typescript
// src/models/index.ts
export const takeover = ['database:*']
export default (databases) => ({ /* models */ })

// src/controllers/index.ts
export const takeover = ['http:*']
export default (http, models, views) => { /* routes */ }
```

### 4. Execution Phase

Application runs according to dispatched logic. Servers listen, routes respond, databases query.

### 5. Build Phase (Production)

```typescript
await Core.build()
```

**Steps:**
1. Compile TypeScript
2. Build frontend assets (Vite, etc.)
3. Generate production artifacts
4. Clean and organize output

---

## Resource Management

### RESOURCES Object

Core maintains a global `RESOURCES` object storing all loaded resources:

```typescript
RESOURCES = {
  http: {
    api: ServerPlugin,
    admin: ServerPlugin
  },
  database: {
    default: DatabasePlugin,
    cache: DatabasePlugin
  },
  socketio: {
    chat: ServerPlugin
  }
}
```

### Resource Takeover

The **takeover** mechanism is Kenx's dependency injection system.

**Declaration:**
```typescript
export const takeover = ['http', 'database:default']
```

**Syntax:**
- `'type'` - Take all resources of type (e.g., `'http'` → all HTTP servers)
- `'type:key'` - Take specific resource (e.g., `'http:api'`)
- `'type:*'` - Take all as object (e.g., `'database:*'` → `{ default, cache }`)

**Resolution:**
```typescript
// takeover = ['http', 'database:default']
// ↓
async function(http, database) {
  // http = all HTTP servers as array
  // database = specific 'default' database
}
```

### Creating Resources

#### HTTP Servers

```typescript
async createHTTPServer(config: ServerConfig): Promise<ServerPlugin>
```

**Process:**
1. Import server plugin
2. Import application plugin (Express/Fastify)
3. Create server instance
4. Store in `RESOURCES.http[key]`

**Example:**
```yaml
servers:
  - type: http
    key: api
    plugin: '@ckenx/kenx-express'
    PORT: 8000
    application:
      type: express
      plugin: '@ckenx/kenx-express'
```

#### Auxiliary Servers

```typescript
async createAuxServer(config: ServerConfig): Promise<ServerPlugin>
```

Handles:
- Socket.io servers
- WebSocket servers
- Vite build servers
- Custom server types

**Binding to HTTP:**
```yaml
servers:
  - type: socketio
    key: chat
    bindTo: http:api  # Bind to existing HTTP server
```

#### Databases

```typescript
async createResource(config: DatabaseConfig): Promise<DatabasePlugin>
```

**Autoconnect:**
```yaml
databases:
  - type: mysql
    key: default
    autoconnect: true  # Connects during autoload
```

**Manual Connect:**
```typescript
const db = RESOURCES.database.default
await db.connect()
```

---

## API Reference

### Core Class

#### Properties

##### `Setup`

Setup Manager instance.

```typescript
public Setup: SetupManager
```

##### `RESOURCES`

Global resources storage.

```typescript
public RESOURCES: {
  http: Record<string, ServerPlugin>
  database: Record<string, DatabasePlugin>
  [key: string]: any
}
```

##### `context`

Logger context.

```typescript
public context: Context
```

#### Methods

##### `autoload()`

Load and initialize all configured resources.

```typescript
async autoload(): Promise<void>
```

**Returns:** Promise resolving when all resources are loaded

**Throws:** Error if resource creation fails

##### `dispatch()`

Execute application logic based on pattern.

```typescript
async dispatch(): Promise<void>
```

**Singleton Pattern:**
- Imports `src/index.ts`
- Resolves takeover dependencies
- Executes default export

**MVC Pattern:**
- Imports `src/models/index.ts`
- Imports `src/views/index.ts`
- Imports `src/controllers/index.ts`
- Resolves dependencies in order
- Executes controllers

##### `build()`

Build application for production.

```typescript
async build(): Promise<void>
```

**Steps:**
1. Load configuration via Setup
2. Autoload resources
3. Execute build servers (Vite, etc.)
4. Exit process

##### `createHTTPServer(config)`

Create HTTP server resource.

```typescript
async createHTTPServer(config: ServerConfig): Promise<ServerPlugin>
```

**Parameters:**
- `config` - Server configuration object

**Returns:** Server plugin instance

##### `createAuxServer(config)`

Create auxiliary server resource.

```typescript
async createAuxServer(config: ServerConfig): Promise<ServerPlugin>
```

**Parameters:**
- `config` - Server configuration object

**Returns:** Server plugin instance

##### `createResource(config)`

Create database or custom resource.

```typescript
async createResource(config: ResourceConfig): Promise<any>
```

**Parameters:**
- `config` - Resource configuration object

**Returns:** Resource plugin instance

##### `getTakeoverResources(takeover)`

Resolve takeover array to actual resources.

```typescript
getTakeoverResources(takeover: string[]): any[]
```

**Parameters:**
- `takeover` - Array of takeover declarations

**Returns:** Array of resolved resources in order

---

## Execution Patterns

### Singleton Pattern

Single entry point with full control over application flow.

**Configuration:**
```yaml
directory:
  pattern: '-'
```

**Entry Point:** `src/index.ts`

**Structure:**
```typescript
import type { ServerPlugin } from '@ckenx/node/types'

export const takeover = ['http']

export default async (httpServer: ServerPlugin) => {
  const { app } = httpServer
  
  // Define routes
  app.router('/api/users', async (req, res) => {
    res.json({ users: [] })
  })
  
  // Start server
  await httpServer.listen()
}
```

**Best For:**
- Small to medium applications
- APIs and microservices
- Custom application structures
- Full control scenarios

### MVC Pattern

Structured approach with separation of concerns.

**Configuration:**
```yaml
directory:
  pattern: 'mvc'
```

**Entry Points:**
- `src/models/index.ts` - Data models
- `src/views/index.ts` - View templates
- `src/controllers/index.ts` - Request handlers

**Models:**
```typescript
// src/models/index.ts
export const takeover = ['database:*']

export default (databases: any) => {
  const db = databases.default.getConnection()
  
  return {
    User: {
      async findAll() {
        const [rows] = await db.query('SELECT * FROM users')
        return rows
      }
    }
  }
}
```

**Views:**
```typescript
// src/views/index.ts
export const takeover = []

export default () => ({
  userList: (users) => ({
    title: 'Users',
    users: users
  })
})
```

**Controllers:**
```typescript
// src/controllers/index.ts
export const takeover = ['http:*']

export default (http: any, models: any, views: any) => {
  const { app } = http.default
  
  app.router('/users', async (req, res) => {
    const users = await models.User.findAll()
    const view = views.userList(users)
    res.json(view)
  })
}
```

**Best For:**
- Large applications
- Team projects
- Complex business logic
- Structured development

---

## Resource Takeover Examples

### Taking Single Resource

```typescript
export const takeover = ['http']

export default async (http: ServerPlugin) => {
  // http = first HTTP server (or only one)
}
```

### Taking Specific Resource

```typescript
export const takeover = ['http:api', 'database:default']

export default async (httpApi: ServerPlugin, dbDefault: DatabasePlugin) => {
  // httpApi = HTTP server with key 'api'
  // dbDefault = Database with key 'default'
}
```

### Taking All of Type

```typescript
export const takeover = ['http:*', 'database:*']

export default async (httpServers: any, databases: any) => {
  // httpServers = { api: ServerPlugin, admin: ServerPlugin }
  // databases = { default: DatabasePlugin, cache: DatabasePlugin }
}
```

### Mixed Takeover

```typescript
export const takeover = ['http', 'database:default', 'socketio:*']

export default async (
  http: ServerPlugin,
  database: DatabasePlugin,
  socketio: any
) => {
  // http = array of all HTTP servers
  // database = specific default database
  // socketio = object of all socketio servers
}
```

---

## Build Process

### Development Build

```bash
ckenx run
```

**Steps:**
1. `Setup.dev()` - Load config, install plugins, compile TS
2. `Core.autoload()` - Load resources
3. `Core.dispatch()` - Execute application

### Production Build

```bash
ckenx build
```

**Steps:**
1. `Setup.build()` - Clean compile TypeScript
2. `Core.autoload()` - Load resources
3. `Core.build()` - Execute build servers
4. Exit process

**Output:**
```
dist/
├── index.js
├── setup.js
├── lib/
├── types/
└── [additional build artifacts]
```

---

## Error Handling

### Resource Creation Errors

```typescript
try {
  await Core.createHTTPServer(config)
} catch (error) {
  Core.context.error(`Failed to create HTTP server: ${error.message}`)
  process.exit(1)
}
```

### Dispatch Errors

```typescript
try {
  await Core.dispatch()
} catch (error) {
  Core.context.error(`Dispatch failed: ${error.message}`)
  process.exit(1)
}
```

### Takeover Resolution Errors

```typescript
if (!resource) {
  throw new Error(`Resource not found for takeover: ${declaration}`)
}
```

---

## Advanced Usage

### Custom Resource Types

Define custom resources in configuration:

```yaml
custom:
  - type: cache
    key: redis
    plugin: './src/plugins/redis-cache'
```

Access via takeover:

```typescript
export const takeover = ['custom:redis']

export default (cache) => {
  // Use custom cache resource
}
```

### Programmatic Resource Access

Access resources directly:

```typescript
import Core from '@ckenx/node'

const httpServer = Core.RESOURCES.http.api
const database = Core.RESOURCES.database.default
```

### Dynamic Resource Loading

Load resources at runtime:

```typescript
export default async (http) => {
  // Load additional database dynamically
  const pgConfig = {
    type: 'postgres',
    key: 'analytics',
    plugin: '@ckenx/kenx-postgres'
  }
  
  const pg = await Core.createResource(pgConfig)
  Core.RESOURCES.database.analytics = pg
}
```

---

## Best Practices

1. **Use Takeover** - Prefer dependency injection over direct RESOURCES access
2. **Async Operations** - Always await Core methods
3. **Error Handling** - Wrap critical operations in try-catch
4. **Resource Cleanup** - Close connections in shutdown handlers
5. **Pattern Consistency** - Stick to one pattern (Singleton or MVC) per project

---

## Performance Considerations

### Resource Loading

Resources load sequentially by type:
1. HTTP servers (parallel within type)
2. Auxiliary servers (parallel)
3. Databases (parallel)

### Memory Management

Core maintains references to all resources. For long-running applications:
- Close unused database connections
- Clear caches periodically
- Monitor resource usage

### TypeScript Compilation

Development mode recompiles on every start. For faster startup:
- Keep TypeScript enabled in production (uses pre-built `dist/`)
- Use `ckenx build` before deploying

---

## Debugging

### Enable Debug Logging

```env
DEBUG=kenx:*
```

```bash
DEBUG=kenx:* node -r @ckenx/node
```

### Inspect Resources

```typescript
export default (http) => {
  console.log('Loaded Resources:', Core.RESOURCES)
}
```

### Trace Lifecycle

```typescript
Core.context.debug('Autoload started')
await Core.autoload()
Core.context.debug('Autoload complete')

Core.context.debug('Dispatch started')
await Core.dispatch()
Core.context.debug('Dispatch complete')
```

---

## Next Steps

- **[Services & Resources](../services-and-resources/index.md)** - Working with resources
- **[Plugins](../plugins/index.md)** - Creating custom plugins
- **[Adapters](../adapters/index.md)** - Framework adapters

---

**Previous:** [← Setup Manager](../setup/index.md) | **Next:** [Services & Resources →](../services-and-resources/index.md)
