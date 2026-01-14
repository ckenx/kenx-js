# Services & Resources

Learn how to work with Kenx's resource system, including servers, databases, and custom resources through the takeover mechanism.

## Overview

In Kenx, **resources** are managed instances of servers, databases, and other services that your application needs. The **resource takeover** system provides automatic dependency injection, making these resources available to your application code.

**Key Concepts:**
- **Resources** - Configured instances (HTTP servers, databases, etc.)
- **Takeover** - Dependency injection mechanism
- **RESOURCES Object** - Global storage for all loaded resources
- **Resource Keys** - Unique identifiers for each resource

---

## Understanding Resources

### Resource Types

#### 1. HTTP Servers

Web servers for handling HTTP requests.

**Configuration:**
```yaml
servers:
  - type: http
    key: api
    plugin: '@ckenx/kenx-express'
    PORT: 8000
```

**Access:**
```typescript
export const takeover = ['http:api']

export default (server) => {
  const { app } = server
  app.router('/', (req, res) => {
    res.json({ message: 'Hello!' })
  })
}
```

#### 2. Auxiliary Servers

Socket.io, WebSocket, Vite, and other server types.

**Configuration:**
```yaml
servers:
  - type: socketio
    key: chat
    plugin: '@ckenx/kenx-socketio'
    bindTo: http:api
```

**Access:**
```typescript
export const takeover = ['socketio:chat']

export default (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected')
  })
}
```

#### 3. Databases

Database connections (MySQL, MongoDB, Redis, etc.).

**Configuration:**
```yaml
databases:
  - type: mysql
    key: default
    plugin: '@ckenx/kenx-mysql'
    autoconnect: true
```

**Access:**
```typescript
export const takeover = ['database:default']

export default (db) => {
  const connection = db.getConnection()
  // Use database
}
```

#### 4. Custom Resources

User-defined resources for specific needs.

**Configuration:**
```yaml
custom:
  - type: cache
    key: redis
    plugin: './src/plugins/cache'
```

**Access:**
```typescript
export const takeover = ['custom:redis']

export default (cache) => {
  cache.set('key', 'value')
}
```

---

## Resource Takeover

The **takeover** mechanism is Kenx's approach to dependency injection. You declare which resources you need, and Kenx automatically provides them.

### Basic Syntax

```typescript
export const takeover = [/* resource declarations */]

export default async (...resources) => {
  // Use resources
}
```

### Takeover Patterns

#### 1. Take All of Type

Get all resources of a specific type as an array.

```typescript
export const takeover = ['http']

export default (httpServers) => {
  // httpServers = [server1, server2, ...]
  const mainServer = httpServers[0]
}
```

#### 2. Take Specific Resource

Get a single resource by its key.

```typescript
export const takeover = ['http:api']

export default (apiServer) => {
  // apiServer = the HTTP server with key 'api'
}
```

#### 3. Take All as Object

Get all resources of a type as an object keyed by their identifiers.

```typescript
export const takeover = ['http:*']

export default (httpServers) => {
  // httpServers = { api: server1, admin: server2 }
  const api = httpServers.api
  const admin = httpServers.admin
}
```

#### 4. Multiple Resources

Combine different patterns.

```typescript
export const takeover = [
  'http:api',
  'database:*',
  'socketio'
]

export default (apiServer, databases, socketServers) => {
  // apiServer = specific HTTP server
  // databases = { default: db1, cache: db2 }
  // socketServers = [io1, io2, ...]
}
```

---

## Working with HTTP Servers

### Express Server

```yaml
# .config/servers.yml
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

**Usage:**
```typescript
import type { ServerPlugin } from '@ckenx/node/types'
import type http from 'http'

export const takeover = ['http:api']

export default async (server: ServerPlugin<http.Server>) => {
  const { app, server: httpServer } = server
  
  // Define routes
  app.router('/api/users', async (req, res) => {
    res.json({ users: [] })
  })
  
  app.router('/api/posts', {
    method: 'POST',
    handler: async (req, res) => {
      res.json({ post: req.body })
    }
  })
  
  // Start listening
  await server.listen()
}
```

### Fastify Server

```yaml
servers:
  - type: http
    key: api
    plugin: '@ckenx/kenx-fastify'
    application:
      type: fastify
      plugin: '@ckenx/kenx-fastify'
```

**Usage:**
```typescript
export const takeover = ['http:api']

export default async (server) => {
  const { app } = server
  
  app.router('/api/users', {
    method: 'GET',
    handler: async (request, reply) => {
      reply.send({ users: [] })
    }
  })
  
  await server.listen()
}
```

### Multiple HTTP Servers

```yaml
servers:
  - type: http
    key: api
    PORT: 8000
    
  - type: http
    key: admin
    PORT: 8001
```

**Usage:**
```typescript
export const takeover = ['http:*']

export default async (servers) => {
  const { api, admin } = servers
  
  // API routes
  api.app.router('/api/data', (req, res) => {
    res.json({ data: [] })
  })
  
  // Admin routes
  admin.app.router('/admin/dashboard', (req, res) => {
    res.json({ stats: {} })
  })
  
  // Start both servers
  await api.listen()
  await admin.listen()
}
```

---

## Working with Databases

### MySQL Database

```yaml
# .config/databases.yml
databases:
  - type: mysql
    key: default
    plugin: '@ckenx/kenx-mysql'
    autoconnect: true
    options:
      host: [env]:DB_HOST
      database: [env]:DB_NAME
      user: [env]:DB_USER
      password: [env]:DB_PASSWORD
      connectionLimit: 10
```

**Usage:**
```typescript
export const takeover = ['database:default']

export default async (db) => {
  const connection = db.getConnection()
  
  // Query
  const [rows] = await connection.query(
    'SELECT * FROM users WHERE id = ?',
    [userId]
  )
  
  // Insert
  const [result] = await connection.query(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    ['John', 'john@example.com']
  )
  
  // Update
  await connection.query(
    'UPDATE users SET name = ? WHERE id = ?',
    ['Jane', userId]
  )
}
```

### MongoDB Database

```yaml
databases:
  - type: mongodb
    key: default
    plugin: '@ckenx/kenx-mongodb'
    autoconnect: true
    uri: [env]:MONGODB_URI
```

**Usage:**
```typescript
export const takeover = ['database:default']

export default async (db) => {
  const connection = db.getConnection()
  
  // Find documents
  const users = await connection.collection('users').find({}).toArray()
  
  // Insert document
  await connection.collection('users').insertOne({
    name: 'John',
    email: 'john@example.com'
  })
  
  // Update document
  await connection.collection('users').updateOne(
    { _id: userId },
    { $set: { name: 'Jane' } }
  )
}
```

### Multiple Databases

```yaml
databases:
  - type: mysql
    key: primary
    autoconnect: true
    
  - type: mongodb
    key: analytics
    autoconnect: true
    
  - type: redis
    key: cache
    autoconnect: true
```

**Usage:**
```typescript
export const takeover = ['database:*']

export default async (databases) => {
  const { primary, analytics, cache } = databases
  
  // MySQL query
  const [users] = await primary.getConnection().query('SELECT * FROM users')
  
  // MongoDB log
  await analytics.getConnection().collection('events').insertOne({
    type: 'user_query',
    timestamp: new Date()
  })
  
  // Redis cache
  await cache.getConnection().set('users', JSON.stringify(users))
}
```

---

## Working with Socket.io

```yaml
# .config/servers.yml
servers:
  - type: http
    key: web
    PORT: 8000
    
  - type: socketio
    key: chat
    plugin: '@ckenx/kenx-socketio'
    bindTo: http:web
```

**Usage:**
```typescript
export const takeover = ['socketio:chat']

export default (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)
    
    socket.on('message', (data) => {
      // Broadcast to all clients
      io.emit('message', data)
    })
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })
}
```

---

## Resource Lifecycle

### Autoconnect

Databases with `autoconnect: true` connect automatically during the autoload phase.

```yaml
databases:
  - type: mysql
    key: default
    autoconnect: true
```

### Manual Connection

Without autoconnect, you must connect manually.

```yaml
databases:
  - type: mysql
    key: default
    autoconnect: false
```

```typescript
export const takeover = ['database:default']

export default async (db) => {
  // Connect manually
  await db.connect()
  
  // Use database
  const connection = db.getConnection()
  
  // Close when done
  await db.close()
}
```

### Server Listening

HTTP servers must be started explicitly.

```typescript
export const takeover = ['http']

export default async (server) => {
  // Setup routes first
  server.app.router('/', (req, res) => {
    res.json({ status: 'ok' })
  })
  
  // Then start listening
  await server.listen()
}
```

---

## Advanced Patterns

### Resource Factory Pattern

Create reusable resource factories.

```typescript
// src/factories/database.ts
export const createRepository = (db) => ({
  users: {
    async findById(id: number) {
      const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id])
      return rows[0]
    },
    async create(data: any) {
      const [result] = await db.query('INSERT INTO users SET ?', [data])
      return result.insertId
    }
  }
})
```

```typescript
// src/index.ts
import { createRepository } from './factories/database'

export const takeover = ['http', 'database:default']

export default async (server, db) => {
  const repo = createRepository(db.getConnection())
  
  server.app.router('/users/:id', async (req, res) => {
    const user = await repo.users.findById(req.params.id)
    res.json(user)
  })
  
  await server.listen()
}
```

### Middleware Pattern

Share resources across route handlers.

```typescript
export const takeover = ['http', 'database:*']

export default async (server, databases) => {
  const { app } = server
  
  // Attach databases to request
  app.use((req, res, next) => {
    req.db = databases
    next()
  })
  
  // Use in routes
  app.router('/users', async (req, res) => {
    const [users] = await req.db.primary.getConnection().query('SELECT * FROM users')
    res.json(users)
  })
  
  await server.listen()
}
```

### Service Layer Pattern

Encapsulate business logic in services.

```typescript
// src/services/user-service.ts
export class UserService {
  constructor(private db: any) {}
  
  async getUsers() {
    const [rows] = await this.db.query('SELECT * FROM users')
    return rows
  }
  
  async createUser(data: any) {
    const [result] = await this.db.query('INSERT INTO users SET ?', [data])
    return result.insertId
  }
}
```

```typescript
// src/index.ts
import { UserService } from './services/user-service'

export const takeover = ['http', 'database:default']

export default async (server, db) => {
  const userService = new UserService(db.getConnection())
  
  server.app.router('/users', async (req, res) => {
    const users = await userService.getUsers()
    res.json(users)
  })
  
  await server.listen()
}
```

---

## MVC Pattern Resources

In MVC pattern, resources cascade through layers.

### Models Layer

```typescript
// src/models/index.ts
export const takeover = ['database:*']

export default (databases) => {
  const db = databases.default.getConnection()
  
  return {
    User: {
      async findAll() {
        const [rows] = await db.query('SELECT * FROM users')
        return rows
      },
      async findById(id: number) {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id])
        return rows[0]
      }
    }
  }
}
```

### Views Layer

```typescript
// src/views/index.ts
export const takeover = []

export default () => ({
  userList: (users) => ({
    title: 'User List',
    users: users.map(u => ({ id: u.id, name: u.name }))
  })
})
```

### Controllers Layer

```typescript
// src/controllers/index.ts
export const takeover = ['http:*']

export default (servers, models, views) => {
  const { app } = servers.default
  
  app.router('/users', async (req, res) => {
    const users = await models.User.findAll()
    const view = views.userList(users)
    res.json(view)
  })
  
  app.router('/users/:id', async (req, res) => {
    const user = await models.User.findById(req.params.id)
    res.json(user)
  })
}
```

---

## Best Practices

1. **Use Takeover** - Always prefer takeover over direct RESOURCES access
2. **Specific Keys** - Use `type:key` for clarity when multiple resources exist
3. **Error Handling** - Wrap database operations in try-catch blocks
4. **Connection Pooling** - Use connection pools for databases
5. **Resource Cleanup** - Close connections in shutdown handlers
6. **Type Safety** - Use TypeScript types for resources
7. **Service Layer** - Encapsulate business logic separate from routes

---

## Common Patterns

### REST API with Database

```typescript
export const takeover = ['http', 'database:default']

export default async (server, db) => {
  const { app } = server
  const conn = db.getConnection()
  
  app.router('/api/users', {
    method: 'GET',
    handler: async (req, res) => {
      const [users] = await conn.query('SELECT * FROM users')
      res.json(users)
    }
  })
  
  app.router('/api/users', {
    method: 'POST',
    handler: async (req, res) => {
      const [result] = await conn.query('INSERT INTO users SET ?', [req.body])
      res.json({ id: result.insertId })
    }
  })
  
  await server.listen()
}
```

### Real-Time Application

```typescript
export const takeover = ['http', 'socketio', 'database:default']

export default async (httpServer, io, db) => {
  const { app } = httpServer
  const conn = db.getConnection()
  
  // REST endpoints
  app.router('/api/messages', async (req, res) => {
    const [messages] = await conn.query('SELECT * FROM messages')
    res.json(messages)
  })
  
  // WebSocket events
  io.on('connection', (socket) => {
    socket.on('message', async (data) => {
      await conn.query('INSERT INTO messages SET ?', [data])
      io.emit('message', data)
    })
  })
  
  await httpServer.listen()
}
```

### Caching Layer

```typescript
export const takeover = ['http', 'database:primary', 'database:cache']

export default async (server, db, redis) => {
  const { app } = server
  const dbConn = db.getConnection()
  const cacheConn = redis.getConnection()
  
  app.router('/api/users', async (req, res) => {
    // Check cache
    const cached = await cacheConn.get('users')
    if (cached) {
      return res.json(JSON.parse(cached))
    }
    
    // Query database
    const [users] = await dbConn.query('SELECT * FROM users')
    
    // Store in cache
    await cacheConn.set('users', JSON.stringify(users), 'EX', 60)
    
    res.json(users)
  })
  
  await server.listen()
}
```

---

## Troubleshooting

### Resource Not Found

**Error:** `Resource not found for takeover: http:api`

**Solution:** Verify resource key in configuration matches takeover declaration.

### Database Connection Failed

**Error:** `Failed to connect to database`

**Solution:** Check environment variables and database credentials.

### Server Already Listening

**Error:** `EADDRINUSE: address already in use`

**Solution:** Change port or stop conflicting process.

### Takeover Order Issues

Resources are injected in the order declared in `takeover` array. Ensure order matches function parameters.

---

## Next Steps

- **[Plugins](../plugins/index.md)** - Creating custom plugins
- **[Adapters](../adapters/index.md)** - Framework adapters
- **[Testing](../dev-kit/testing/index.md)** - Testing resources

---

**Previous:** [← Core System](../core/index.md) | **Next:** [Plugins →](../plugins/index.md)
