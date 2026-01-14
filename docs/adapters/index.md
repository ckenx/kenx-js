# Adapters

Kenx adapters bridge framework plugins with the core system, providing a unified interface for HTTP servers, databases, and other resources.

## Overview

Adapters are middleware layers that:
- Normalize different framework APIs
- Provide consistent routing interfaces
- Handle plugin lifecycle
- Enable framework interoperability

**Key Features:**
- **Unified API** - Same interface across frameworks
- **Framework Agnostic** - Switch frameworks without changing application code
- **Plugin Integration** - Seamless plugin system integration
- **Type Safety** - Full TypeScript support

---

## Adapter Architecture

```
┌─────────────────────────────────────┐
│     Application Code                │
│  (Uses unified API)                 │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│        Kenx Adapter Layer           │
│  • Normalizes APIs                  │
│  • Provides router()                │
│  • Manages lifecycle                │
└─────────────┬───────────────────────┘
              │
        ┌─────┴──────┐
        ▼            ▼
┌─────────────┐  ┌─────────────┐
│   Express   │  │   Fastify   │
│   Plugin    │  │   Plugin    │
└─────────────┘  └─────────────┘
```

---

## Server Adapters

### Express Adapter

Adapter for Express framework integration.

**Plugin:** `@ckenx/kenx-express`

**Configuration:**
```yaml
servers:
  - type: http
    key: api
    plugin: '@ckenx/kenx-express'
    HOST: [env]:HTTP_HOST
    PORT: [env]:HTTP_PORT
    application:
      type: express
      plugin: '@ckenx/kenx-express'
```

**Features:**
- Express middleware compatibility
- Route registration via `router()`
- Static file serving
- Session management
- Body parsing

**Usage:**
```typescript
import type { ServerPlugin } from '@ckenx/node/types'

export const takeover = ['http:api']

export default async (server: ServerPlugin) => {
  const { app } = server
  
  // Basic route
  app.router('/api/users', (req, res) => {
    res.json({ users: [] })
  })
  
  // Route with method
  app.router('/api/users', {
    method: 'POST',
    handler: (req, res) => {
      res.json({ user: req.body })
    }
  })
  
  // Multiple methods
  app.router('/api/users/:id', {
    GET: (req, res) => {
      res.json({ id: req.params.id })
    },
    PUT: (req, res) => {
      res.json({ updated: true })
    },
    DELETE: (req, res) => {
      res.status(204).send()
    }
  })
  
  await server.listen()
}
```

**Express Middleware:**
```typescript
export const takeover = ['http:api']

export default async (server) => {
  const { app, framework } = server
  
  // Access underlying Express app
  framework.use(express.json())
  framework.use(express.urlencoded({ extended: true }))
  
  // Custom middleware
  framework.use((req, res, next) => {
    req.timestamp = Date.now()
    next()
  })
  
  // Kenx router
  app.router('/api/data', (req, res) => {
    res.json({ timestamp: req.timestamp })
  })
  
  await server.listen()
}
```

### Fastify Adapter

Adapter for Fastify framework integration.

**Plugin:** `@ckenx/kenx-fastify`

**Configuration:**
```yaml
servers:
  - type: http
    key: api
    plugin: '@ckenx/kenx-fastify'
    application:
      type: fastify
      plugin: '@ckenx/kenx-fastify'
```

**Features:**
- High-performance routing
- JSON schema validation
- Built-in serialization
- Plugin system
- Lifecycle hooks

**Usage:**
```typescript
export const takeover = ['http:api']

export default async (server) => {
  const { app } = server
  
  // Basic route
  app.router('/api/users', {
    method: 'GET',
    handler: async (request, reply) => {
      reply.send({ users: [] })
    }
  })
  
  // With schema validation
  app.router('/api/users', {
    method: 'POST',
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' }
        },
        required: ['name', 'email']
      }
    },
    handler: async (request, reply) => {
      reply.send({ user: request.body })
    }
  })
  
  await server.listen()
}
```

**Fastify Plugins:**
```typescript
export const takeover = ['http:api']

export default async (server) => {
  const { app, framework } = server
  
  // Access underlying Fastify instance
  framework.register(require('@fastify/cors'), {
    origin: '*'
  })
  
  framework.register(require('@fastify/helmet'))
  
  // Kenx router
  app.router('/api/data', {
    handler: async (request, reply) => {
      reply.send({ data: [] })
    }
  })
  
  await server.listen()
}
```

### HTTP Adapter

Adapter for native Node.js HTTP server.

**Plugin:** `@ckenx/kenx-http`

**Configuration:**
```yaml
servers:
  - type: http
    key: api
    plugin: '@ckenx/kenx-http'
```

**Features:**
- Minimal overhead
- Direct HTTP control
- Custom request handling
- WebSocket support

**Usage:**
```typescript
export const takeover = ['http:api']

export default async (server) => {
  const { app } = server
  
  // Manual routing
  app.router('/api/users', (req, res) => {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ users: [] }))
    }
  })
  
  await server.listen()
}
```

---

## Router Interface

The Kenx adapter provides a unified `router()` method across all frameworks.

### Basic Routing

```typescript
// Simple route
app.router('/path', handler)

// With method
app.router('/path', {
  method: 'POST',
  handler: handler
})

// Multiple methods
app.router('/path', {
  GET: getHandler,
  POST: postHandler,
  PUT: putHandler,
  DELETE: deleteHandler
})
```

### Handler Signature

```typescript
// Express-style
type Handler = (req: Request, res: Response) => void | Promise<void>

// Fastify-style
type Handler = (request: Request, reply: Reply) => void | Promise<void>
```

### Route Parameters

```typescript
app.router('/users/:id', (req, res) => {
  const userId = req.params.id
  res.json({ userId })
})
```

### Query Parameters

```typescript
app.router('/search', (req, res) => {
  const query = req.query.q
  res.json({ query })
})
```

### Request Body

```typescript
app.router('/users', {
  method: 'POST',
  handler: (req, res) => {
    const user = req.body
    res.json({ created: user })
  }
})
```

---

## Adapter API

### ServerPlugin Interface

```typescript
interface ServerPlugin<T = any> {
  server: T                    // Underlying server instance
  app: ApplicationPlugin       // Application adapter
  framework?: any              // Framework instance (Express/Fastify)
  
  listen(): Promise<T>         // Start server
  close?(): Promise<void>      // Stop server
}
```

### ApplicationPlugin Interface

```typescript
interface ApplicationPlugin {
  router(path: string, handler: Function): void
  router(path: string, options: RouterOptions): void
  
  use?(middleware: Function): void
  
  [key: string]: any           // Framework-specific methods
}
```

### RouterOptions

```typescript
interface RouterOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS'
  handler?: Function
  schema?: object              // For Fastify validation
  
  GET?: Function
  POST?: Function
  PUT?: Function
  DELETE?: Function
  PATCH?: Function
}
```

---

## Middleware Integration

### Express Middleware

```typescript
export const takeover = ['http:api']

export default async (server) => {
  const { app, framework } = server
  
  // Use Express middleware
  framework.use(require('cors')())
  framework.use(require('helmet')())
  framework.use(require('morgan')('dev'))
  
  // Body parsers
  framework.use(express.json())
  framework.use(express.urlencoded({ extended: true }))
  
  // Custom middleware
  framework.use((req, res, next) => {
    req.requestId = Math.random().toString(36)
    next()
  })
  
  // Kenx routes
  app.router('/api/test', (req, res) => {
    res.json({ requestId: req.requestId })
  })
  
  await server.listen()
}
```

### Fastify Plugins

```typescript
export const takeover = ['http:api']

export default async (server) => {
  const { app, framework } = server
  
  // Register Fastify plugins
  await framework.register(require('@fastify/cors'))
  await framework.register(require('@fastify/helmet'))
  await framework.register(require('@fastify/jwt'), {
    secret: process.env.JWT_SECRET
  })
  
  // Add hooks
  framework.addHook('preHandler', async (request, reply) => {
    request.requestId = Math.random().toString(36)
  })
  
  // Kenx routes
  app.router('/api/test', {
    handler: async (request, reply) => {
      reply.send({ requestId: request.requestId })
    }
  })
  
  await server.listen()
}
```

---

## Error Handling

### Express Error Handling

```typescript
export const takeover = ['http:api']

export default async (server) => {
  const { app, framework } = server
  
  // Routes
  app.router('/api/error', (req, res) => {
    throw new Error('Something went wrong')
  })
  
  // Error handler (Express-specific)
  framework.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
      error: err.message
    })
  })
  
  await server.listen()
}
```

### Fastify Error Handling

```typescript
export const takeover = ['http:api']

export default async (server) => {
  const { app, framework } = server
  
  // Set error handler
  framework.setErrorHandler((error, request, reply) => {
    reply.status(500).send({
      error: error.message
    })
  })
  
  // Routes
  app.router('/api/error', {
    handler: async (request, reply) => {
      throw new Error('Something went wrong')
    }
  })
  
  await server.listen()
}
```

---

## Static Files

### Express Static Files

```typescript
export const takeover = ['http:api']

export default async (server) => {
  const { framework } = server
  
  // Serve static files
  framework.use('/public', express.static('public'))
  framework.use('/uploads', express.static('uploads', {
    maxAge: '1d'
  }))
  
  await server.listen()
}
```

### Fastify Static Files

```typescript
export const takeover = ['http:api']

export default async (server) => {
  const { framework } = server
  
  // Register static plugin
  await framework.register(require('@fastify/static'), {
    root: path.join(__dirname, 'public'),
    prefix: '/public/'
  })
  
  await server.listen()
}
```

---

## Advanced Patterns

### Multiple Server Adapters

```typescript
export const takeover = ['http:*']

export default async (servers) => {
  const { api, admin } = servers
  
  // API server (Express)
  api.app.router('/api/users', (req, res) => {
    res.json({ users: [] })
  })
  
  // Admin server (Fastify)
  admin.app.router('/admin/stats', {
    handler: async (request, reply) => {
      reply.send({ stats: {} })
    }
  })
  
  await api.listen()
  await admin.listen()
}
```

### Framework-Specific Features

```typescript
export const takeover = ['http:api']

export default async (server) => {
  const { app, framework } = server
  
  // Detect framework type
  if (server.config.application.type === 'express') {
    // Express-specific
    framework.set('view engine', 'ejs')
    framework.set('views', './views')
  } else if (server.config.application.type === 'fastify') {
    // Fastify-specific
    framework.register(require('@fastify/view'), {
      engine: { ejs: require('ejs') }
    })
  }
  
  // Unified routing
  app.router('/render', (req, res) => {
    res.render('index', { title: 'Home' })
  })
  
  await server.listen()
}
```

### Custom Adapter

Create your own adapter for custom frameworks:

```typescript
// custom-adapter.ts
export default class CustomAdapter {
  public server: any
  public app: any
  
  constructor(Setup, config) {
    this.server = this.createServer()
    this.app = this.createApp()
  }
  
  createServer() {
    return require('http').createServer()
  }
  
  createApp() {
    return {
      router: (path, options) => {
        // Route registration logic
      }
    }
  }
  
  async listen() {
    const port = this.config.PORT || 8000
    return new Promise((resolve) => {
      this.server.listen(port, () => {
        console.log(`Server on ${port}`)
        resolve(this.server)
      })
    })
  }
}
```

---

## Database Adapters

### MySQL Adapter

```typescript
export const takeover = ['database:default']

export default async (db) => {
  const connection = db.getConnection()
  
  // Unified query interface
  const [rows] = await connection.query('SELECT * FROM users')
  
  // Transaction support
  await connection.beginTransaction()
  try {
    await connection.query('INSERT INTO users SET ?', [user])
    await connection.commit()
  } catch (error) {
    await connection.rollback()
  }
}
```

### MongoDB Adapter

```typescript
export const takeover = ['database:default']

export default async (db) => {
  const connection = db.getConnection()
  
  // Unified collection interface
  const users = await connection.collection('users').find({}).toArray()
  
  // Insert
  await connection.collection('users').insertOne(user)
  
  // Update
  await connection.collection('users').updateOne(
    { _id: userId },
    { $set: updates }
  )
}
```

---

## Best Practices

1. **Use Unified API** - Prefer `app.router()` over framework-specific methods
2. **Framework Access** - Access `framework` only when needed
3. **Type Safety** - Use TypeScript interfaces for type checking
4. **Error Handling** - Implement proper error handlers
5. **Middleware Order** - Register middleware before routes
6. **Resource Cleanup** - Close servers gracefully on shutdown

---

## Switching Frameworks

Kenx's unified adapter API makes switching frameworks straightforward.

**From Express:**
```yaml
servers:
  - plugin: '@ckenx/kenx-express'
    application:
      type: express
      plugin: '@ckenx/kenx-express'
```

**To Fastify:**
```yaml
servers:
  - plugin: '@ckenx/kenx-fastify'
    application:
      type: fastify
      plugin: '@ckenx/kenx-fastify'
```

Application code using `app.router()` remains unchanged!

---

## Performance Considerations

### Express
- Good for most applications
- Rich middleware ecosystem
- Moderate performance

### Fastify
- 2-3x faster than Express
- Built-in validation
- Better for high-traffic APIs

### Native HTTP
- Maximum performance
- Minimal overhead
- Requires more manual work

---

## Troubleshooting

### Adapter Not Loading

**Solution:** Verify plugin installation and configuration.

### Route Not Found

**Solution:** Check route path and method match.

### Middleware Not Working

**Solution:** Ensure middleware registered before routes.

### Type Errors

**Solution:** Import correct types from `@ckenx/node/types`.

---

## Next Steps

- **[Express Guide](./express.md)** - Express-specific features
- **[Fastify Guide](./fastify.md)** - Fastify-specific features
- **[Testing](../dev-kit/testing/index.md)** - Testing adapters

---

**Previous:** [← Plugins](../plugins/index.md) | **Next:** [Development Kit →](../dev-kit/index.md)
