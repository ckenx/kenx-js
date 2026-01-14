# Configuration Examples

Real-world configuration examples for common use cases.

## Basic REST API

Simple REST API with Express and MySQL.

### Project Structure
```
my-api/
├── .config/
│   ├── index.yml
│   ├── servers.yml
│   └── databases.yml
├── src/
│   ├── index.ts
│   └── routes/
└── .env.local
```

### `.config/index.yml`
```yaml
typescript: true

directory:
  base: './src'
  pattern: '-'

autowire: true

__extends__: ['servers', 'databases']
```

### `.config/servers.yml`
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

### `.config/databases.yml`
```yaml
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

### `.env.local`
```bash
HTTP_HOST=0.0.0.0
HTTP_PORT=8000

DB_HOST=localhost
DB_NAME=myapi_dev
DB_USER=root
DB_PASSWORD=dev123
```

---

## Full-Stack Application

Express API + Vite frontend with MongoDB.

### `.config/index.yml`
```yaml
typescript: true

directory:
  base: './src'
  pattern: '-'

__extends__: [
  'servers',
  'databases',
  'security',
  'assets'
]
```

### `.config/servers.yml`
```yaml
servers:
  # Backend API
  - type: http
    key: api
    plugin: '@ckenx/kenx-express'
    HOST: [env]:API_HOST
    PORT: [env]:API_PORT
    application:
      type: express
      plugin: '@ckenx/kenx-express'
  
  # Frontend bundler
  - type: vite
    key: frontend
    plugin: '@ckenx/kenx-vite'
    build: true
    options:
      root: './src/client'
      outDir: './public/dist'
      server:
        port: [env]:VITE_PORT
```

### `.config/databases.yml`
```yaml
databases:
  - type: mongodb
    key: default
    plugin: '@ckenx/kenx-mongodb'
    autoconnect: true
    uri: [env]:MONGODB_URI
```

### `.config/security.yml`
```yaml
security:
  cors:
    enabled: true
    origin: [env]:FRONTEND_URL
    credentials: true
  
  helmet:
    enabled: true
    contentSecurityPolicy:
      directives:
        defaultSrc: ["'self'"]
        scriptSrc: ["'self'", "'unsafe-inline'"]
```

### `.env.local`
```bash
API_HOST=0.0.0.0
API_PORT=8000
VITE_PORT=3000

FRONTEND_URL=http://localhost:3000

MONGODB_URI=mongodb://localhost:27017/myapp_dev
```

---

## Real-Time Chat Application

Express + Socket.io with Redis sessions.

### `.config/servers.yml`
```yaml
servers:
  # HTTP server
  - type: http
    key: web
    plugin: '@ckenx/kenx-express'
    HOST: [env]:HTTP_HOST
    PORT: [env]:HTTP_PORT
    application:
      type: express
      plugin: '@ckenx/kenx-express'
  
  # Socket.io server (bound to HTTP)
  - type: socketio
    key: chat
    plugin: '@ckenx/kenx-socketio'
    bindTo: http:web
    options:
      cors:
        origin: '*'
        methods: ['GET', 'POST']
```

### `.config/databases.yml`
```yaml
databases:
  # Redis for sessions and pub/sub
  - type: redis
    key: default
    plugin: '@ckenx/kenx-redis'
    autoconnect: true
    options:
      host: [env]:REDIS_HOST
      port: [env]:REDIS_PORT
      password: [env]:REDIS_PASSWORD
```

### `.config/sessions.yml`
```yaml
sessions:
  - type: store
    key: default
    store: redis
    secret: [env]:SESSION_SECRET
    cookie:
      maxAge: 86400000
      httpOnly: true
      secure: false
```

### `.env.local`
```bash
HTTP_HOST=0.0.0.0
HTTP_PORT=8000

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

SESSION_SECRET=dev-secret-key
```

---

## Microservices Architecture

Multiple services with shared configurations.

### User Service

**`.config/servers.yml`**
```yaml
servers:
  - type: http
    key: users
    plugin: '@ckenx/kenx-fastify'
    HOST: [env]:SERVICE_HOST
    PORT: [env]:USER_SERVICE_PORT
    application:
      type: fastify
      plugin: '@ckenx/kenx-fastify'
```

**`.config/databases.yml`**
```yaml
databases:
  - type: mysql
    key: users
    plugin: '@ckenx/kenx-mysql'
    autoconnect: true
    options:
      host: [env]:DB_HOST
      database: users_db
      user: [env]:DB_USER
      password: [env]:DB_PASSWORD
```

### Order Service

**`.config/servers.yml`**
```yaml
servers:
  - type: http
    key: orders
    plugin: '@ckenx/kenx-fastify'
    HOST: [env]:SERVICE_HOST
    PORT: [env]:ORDER_SERVICE_PORT
    application:
      type: fastify
      plugin: '@ckenx/kenx-fastify'
```

**`.config/databases.yml`**
```yaml
databases:
  - type: mongodb
    key: orders
    plugin: '@ckenx/kenx-mongodb'
    autoconnect: true
    uri: [env]:ORDERS_MONGODB_URI
```

### Shared `.env.local`
```bash
SERVICE_HOST=0.0.0.0

USER_SERVICE_PORT=8001
ORDER_SERVICE_PORT=8002
GATEWAY_SERVICE_PORT=8000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=dev123

ORDERS_MONGODB_URI=mongodb://localhost:27017/orders_dev
```

---

## MVC Pattern Application

Structured application with models, views, and controllers.

### `.config/index.yml`
```yaml
typescript: true

directory:
  base: './src'
  pattern: 'mvc'  # Enable MVC pattern

autowire: true

__extends__: [
  'servers',
  'databases',
  'security',
  'sessions'
]
```

### Project Structure
```
my-mvc-app/
├── .config/
├── src/
│   ├── models/
│   │   └── index.ts      # Models factory
│   ├── views/
│   │   └── index.ts      # Views factory
│   └── controllers/
│       └── index.ts      # Controllers factory
└── .env.local
```

### `src/models/index.ts`
```typescript
export const takeover = ['database:*']

export default (databases: any) => {
  const db = databases.default.getConnection()
  
  return {
    User: {
      async findById(id: number) {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id])
        return rows[0]
      }
    },
    Post: {
      async findAll() {
        const [rows] = await db.query('SELECT * FROM posts')
        return rows
      }
    }
  }
}
```

### `src/controllers/index.ts`
```typescript
export const takeover = ['http:*']

export default (http: any, models: any, views: any) => {
  const { app } = http.default
  
  app.router('/api/users/:id', async (req, res) => {
    const user = await models.User.findById(req.params.id)
    res.json(user)
  })
  
  app.router('/api/posts', async (req, res) => {
    const posts = await models.Post.findAll()
    res.json(posts)
  })
}
```

---

## Multi-Database Setup

Application using multiple databases for different purposes.

### `.config/databases.yml`
```yaml
databases:
  # Primary database (MySQL)
  - type: mysql
    key: primary
    plugin: '@ckenx/kenx-mysql'
    autoconnect: true
    options:
      host: [env]:MYSQL_HOST
      database: [env]:MYSQL_DATABASE
      user: [env]:MYSQL_USER
      password: [env]:MYSQL_PASSWORD
      connectionLimit: 10
  
  # Cache database (Redis)
  - type: redis
    key: cache
    plugin: '@ckenx/kenx-redis'
    autoconnect: true
    options:
      host: [env]:REDIS_HOST
      port: [env]:REDIS_PORT
      db: 0
  
  # Analytics database (MongoDB)
  - type: mongodb
    key: analytics
    plugin: '@ckenx/kenx-mongodb'
    autoconnect: true
    uri: [env]:MONGODB_URI
```

### `src/index.ts`
```typescript
export const takeover = ['http', 'database:*']

export default async (http: any, databases: any) => {
  const { app } = http
  const mysql = databases.primary.getConnection()
  const redis = databases.cache.getConnection()
  const mongodb = databases.analytics.getConnection()
  
  app.router('/api/data', async (req, res) => {
    // Check cache first
    const cached = await redis.get('data')
    if (cached) return res.json(JSON.parse(cached))
    
    // Query MySQL
    const [data] = await mysql.query('SELECT * FROM data')
    
    // Cache result
    await redis.set('data', JSON.stringify(data), 'EX', 60)
    
    // Log to analytics
    await mongodb.collection('requests').insertOne({
      endpoint: '/api/data',
      timestamp: new Date()
    })
    
    res.json(data)
  })
}
```

---

## Production Configuration

Production-ready configuration with security hardening.

### `.config/security.yml`
```yaml
security:
  # Strict CORS
  cors:
    enabled: true
    origin: [env]:ALLOWED_ORIGINS  # Comma-separated list
    credentials: true
    maxAge: 86400
  
  # Full Helmet configuration
  helmet:
    enabled: true
    contentSecurityPolicy:
      directives:
        defaultSrc: ["'self'"]
        scriptSrc: ["'self'", "'unsafe-inline'"]
        styleSrc: ["'self'", "'unsafe-inline'"]
        imgSrc: ["'self'", 'data:', 'https:']
        connectSrc: ["'self'"]
        fontSrc: ["'self'"]
        objectSrc: ["'none'"]
        mediaSrc: ["'self'"]
        frameSrc: ["'none'"]
    hsts:
      maxAge: 31536000
      includeSubDomains: true
      preload: true
    frameguard:
      action: 'deny'
    hidePoweredBy: true
    noSniff: true
  
  # XSS Protection
  xss:
    enabled: true
  
  # HPP Protection
  hpp:
    enabled: true
```

### `.config/sessions.yml`
```yaml
sessions:
  - type: store
    key: default
    store: redis
    secret: [env]:SESSION_SECRET
    cookie:
      maxAge: 3600000        # 1 hour
      httpOnly: true
      secure: true            # HTTPS only
      sameSite: 'strict'
      domain: [env]:COOKIE_DOMAIN
```

### `.env` (Production)
```bash
NODE_ENV=production

HTTP_HOST=0.0.0.0
HTTP_PORT=3000

ALLOWED_ORIGINS=https://myapp.com,https://www.myapp.com

DB_HOST=prod-db.example.com
DB_NAME=myapp_prod
DB_USER=produser
DB_PASSWORD=***

SESSION_SECRET=***
COOKIE_DOMAIN=.myapp.com

REDIS_HOST=prod-redis.example.com
REDIS_PORT=6379
REDIS_PASSWORD=***
```

---

## Static Site with API

Static frontend with API backend.

### `.config/servers.yml`
```yaml
servers:
  - type: http
    key: api
    plugin: '@ckenx/kenx-express'
    PORT: [env]:API_PORT
    application:
      type: express
      plugin: '@ckenx/kenx-express'
```

### `.config/assets.yml`
```yaml
assets:
  static:
    - path: '/'
      directory: './public'
      options:
        maxAge: 86400000
        index: 'index.html'
        fallthrough: true
    
    - path: '/assets'
      directory: './public/assets'
      options:
        maxAge: 31536000  # 1 year for static assets
        immutable: true
```

---

## File Upload Service

Service handling file uploads with storage.

### `.config/assets.yml`
```yaml
assets:
  storage:
    type: local
    root: './uploads'
  
  upload:
    maxFileSize: 52428800      # 50MB
    maxFiles: 5
    allowedTypes:
      - 'image/*'
      - 'application/pdf'
      - 'application/zip'
    dest: './uploads/temp'
    preservePath: false
    safeFileNames: true
```

### `.config/security.yml`
```yaml
security:
  cors:
    enabled: true
    origin: [env]:FRONTEND_URL
    credentials: true
  
  # Request size limits
  bodyParser:
    json:
      limit: '10mb'
    urlencoded:
      limit: '10mb'
      extended: true
```

---

## Development vs Production

Environment-specific configurations.

### Development (`.env.local`)
```bash
NODE_ENV=development
HTTP_PORT=8000
DB_HOST=localhost
REDIS_HOST=localhost
LOG_LEVEL=debug
```

### Production (`.env`)
```bash
NODE_ENV=production
HTTP_PORT=3000
DB_HOST=prod-db.example.com
REDIS_HOST=prod-redis.example.com
LOG_LEVEL=error
```

### Shared Configuration (`.config/servers.yml`)
```yaml
servers:
  - type: http
    HOST: [env]:HTTP_HOST
    PORT: [env]:HTTP_PORT
    # Same config, different values via env vars
```

---

## Next Steps

- **[Environment Setup](../environment/index.md)** - Configure environment variables
- **[Services & Resources](../services-and-resources/index.md)** - Use configured resources
- **[Plugins](../plugins/index.md)** - Explore available plugins

---

**Previous:** [← Configuration Reference](./reference.md) | **Next:** [Environment Setup →](../environment/index.md)
