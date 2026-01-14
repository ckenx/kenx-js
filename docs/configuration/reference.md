# Configuration Reference

Complete reference for all Kenx configuration options.

## Root Configuration

### `typescript`

**Type:** `boolean`  
**Default:** `false`

Enable TypeScript compilation.

```yaml
typescript: true
```

When enabled:
- Automatic compilation on dev start
- Uses `tsc-prog` for builds
- Resolves path aliases with `tsc-alias`
- Watches for TypeScript changes

---

### `directory`

**Type:** `object`

Project directory configuration.

```yaml
directory:
  base: './src'
  pattern: '-'
```

#### `directory.base`

**Type:** `string`  
**Default:** `'./src'`

Base directory for source code.

#### `directory.pattern`

**Type:** `string`  
**Default:** `'-'`  
**Options:** `'-'` | `'mvc'`

Directory structure pattern:
- `'-'` - Singleton pattern (single entry point)
- `'mvc'` - Model-View-Controller pattern

---

### `autowire`

**Type:** `boolean`  
**Default:** `false`

Enable automatic dependency injection via takeover.

```yaml
autowire: true
```

---

### `__extends__`

**Type:** `array<string>`

List of configuration files to extend.

```yaml
__extends__: [
  'servers',
  'databases',
  'security'
]
```

Files are loaded from `.config/` directory and merged into main configuration.

---

## Server Configuration

### `servers`

**Type:** `array<ServerConfig>`

Array of server configurations.

```yaml
servers:
  - type: http
    key: default
    plugin: '@ckenx/kenx-express'
    HOST: '0.0.0.0'
    PORT: 8000
```

### ServerConfig Properties

#### `type`

**Type:** `string`  
**Required:** `true`

Server type. Options:
- `http` - HTTP/HTTPS server
- `socketio` - Socket.io server
- `websocket` - WebSocket server
- `vite` - Vite build server

#### `key`

**Type:** `string`  
**Default:** `'default'`

Unique identifier for this server. Used in takeover: `http:key`

#### `plugin`

**Type:** `string`  
**Required:** `true`

Plugin package name. Auto-installed if missing in development.

Examples:
- `@ckenx/kenx-express`
- `@ckenx/kenx-fastify`
- `@ckenx/kenx-http`
- `@ckenx/kenx-socketio`

#### `HOST`

**Type:** `string`  
**Default:** `'0.0.0.0'`

Server host address.

#### `PORT`

**Type:** `number`  
**Default:** `8000`

Server port number.

#### `application`

**Type:** `object`

Application configuration (for HTTP servers).

```yaml
application:
  type: express
  plugin: '@ckenx/kenx-express'
```

##### `application.type`

Application framework type: `express` | `fastify`

##### `application.plugin`

Application plugin package name.

#### `bindTo`

**Type:** `string`

Bind this server to an existing server. Format: `type:key`

```yaml
servers:
  - type: http
    key: api
    
  - type: socketio
    bindTo: http:api
```

#### `build`

**Type:** `boolean`  
**Default:** `false`

Run build during production build process.

```yaml
servers:
  - type: vite
    plugin: '@ckenx/kenx-vite'
    build: true
```

#### `options`

**Type:** `object`

Server-specific options passed to the plugin.

```yaml
servers:
  - type: vite
    options:
      root: './src/client'
      outDir: './public/dist'
```

---

## Database Configuration

### `databases`

**Type:** `array<DatabaseConfig>`

Array of database configurations.

```yaml
databases:
  - type: mysql
    key: default
    plugin: '@ckenx/kenx-mysql'
    autoconnect: true
    uri: 'mysql://user:pass@localhost/db'
```

### DatabaseConfig Properties

#### `type`

**Type:** `string`  
**Required:** `true`

Database type. Options:
- `mysql` - MySQL/MariaDB
- `mongodb` - MongoDB
- `redis` - Redis
- Custom types via plugins

#### `key`

**Type:** `string`  
**Default:** `'default'`

Unique identifier. Used in takeover: `database:key`

#### `plugin`

**Type:** `string`  
**Required:** `true`

Database plugin package name.

Examples:
- `@ckenx/kenx-mysql`
- `@ckenx/kenx-mongodb`
- `@ckenx/kenx-redis`

#### `autoconnect`

**Type:** `boolean`  
**Default:** `false`

Automatically connect to database on startup.

#### `uri`

**Type:** `string`

Connection URI string.

```yaml
uri: 'mysql://user:pass@localhost:3306/database'
uri: 'mongodb://localhost:27017/mydb'
uri: 'redis://localhost:6379'
```

#### `options`

**Type:** `object`

Database-specific connection options.

**MySQL:**
```yaml
options:
  host: localhost
  port: 3306
  database: myapp
  user: root
  password: secret
  connectionLimit: 10
  waitForConnections: true
```

**MongoDB:**
```yaml
options:
  host: localhost
  port: 27017
  database: myapp
  useNewUrlParser: true
  useUnifiedTopology: true
```

**Redis:**
```yaml
options:
  host: localhost
  port: 6379
  password: secret
  db: 0
```

---

## Security Configuration

### `security`

**Type:** `object`

Security middleware configuration.

```yaml
security:
  cors:
    enabled: true
  helmet:
    enabled: true
  xss:
    enabled: true
```

### Security Properties

#### `security.cors`

Cross-Origin Resource Sharing configuration.

```yaml
cors:
  enabled: true
  origin: '*'
  methods: ['GET', 'POST', 'PUT', 'DELETE']
  credentials: true
  maxAge: 86400
```

##### `cors.enabled`

**Type:** `boolean`  
**Default:** `false`

Enable CORS middleware.

##### `cors.origin`

**Type:** `string | array<string>`  
**Default:** `'*'`

Allowed origins.

##### `cors.methods`

**Type:** `array<string>`

Allowed HTTP methods.

##### `cors.credentials`

**Type:** `boolean`  
**Default:** `false`

Allow credentials (cookies, authorization headers).

##### `cors.maxAge`

**Type:** `number`

Preflight cache duration in seconds.

#### `security.helmet`

Helmet.js security headers configuration.

```yaml
helmet:
  enabled: true
  contentSecurityPolicy: false
  dnsPrefetchControl: true
  frameguard:
    action: 'deny'
  hidePoweredBy: true
  hsts:
    maxAge: 31536000
    includeSubDomains: true
```

##### `helmet.enabled`

**Type:** `boolean`  
**Default:** `false`

Enable Helmet middleware.

##### `helmet.contentSecurityPolicy`

**Type:** `boolean | object`

Content Security Policy configuration.

##### `helmet.frameguard`

**Type:** `object`

X-Frame-Options configuration.

#### `security.xss`

XSS protection configuration.

```yaml
xss:
  enabled: true
```

##### `xss.enabled`

**Type:** `boolean`  
**Default:** `false`

Enable XSS protection.

#### `security.hpp`

HTTP Parameter Pollution protection.

```yaml
hpp:
  enabled: true
```

---

## Session Configuration

### `sessions`

**Type:** `array<SessionConfig>`

Session management configuration.

```yaml
sessions:
  - type: local
    key: default
    secret: 'session-secret'
    cookie:
      maxAge: 86400000
```

### SessionConfig Properties

#### `type`

**Type:** `string`  
**Required:** `true`

Session type:
- `local` - Memory-based sessions
- `store` - Persistent store (Redis, etc.)

#### `key`

**Type:** `string`  
**Default:** `'default'`

Session identifier.

#### `secret`

**Type:** `string`  
**Required:** `true`

Session secret for signing cookies. Should be from environment variable.

```yaml
secret: [env]:SESSION_SECRET
```

#### `store`

**Type:** `string`

Store type for persistent sessions: `redis` | `mongodb`

#### `cookie`

**Type:** `object`

Cookie configuration.

```yaml
cookie:
  maxAge: 86400000      # 24 hours in ms
  httpOnly: true
  secure: false          # true for HTTPS
  sameSite: 'lax'
  path: '/'
  domain: '.example.com'
```

##### `cookie.maxAge`

**Type:** `number`

Cookie lifetime in milliseconds.

##### `cookie.httpOnly`

**Type:** `boolean`  
**Default:** `true`

Prevent client-side JavaScript access.

##### `cookie.secure`

**Type:** `boolean`  
**Default:** `false`

Only send over HTTPS.

##### `cookie.sameSite`

**Type:** `string`  
**Options:** `'strict'` | `'lax'` | `'none'`

SameSite cookie attribute.

---

## Assets Configuration

### `assets`

**Type:** `object`

Static file and storage configuration.

```yaml
assets:
  static:
    - path: '/public'
      directory: './public'
  storage:
    type: local
    root: './uploads'
  upload:
    maxFileSize: 10485760
```

### Assets Properties

#### `assets.static`

**Type:** `array<object>`

Static file serving configuration.

```yaml
static:
  - path: '/public'
    directory: './public'
    options:
      maxAge: 86400000
      index: 'index.html'
```

##### `path`

**Type:** `string`

URL path prefix.

##### `directory`

**Type:** `string`

Local directory to serve.

##### `options`

Static serve options (framework-specific).

#### `assets.storage`

**Type:** `object`

File storage configuration.

```yaml
storage:
  type: local
  root: './uploads'
```

##### `storage.type`

**Type:** `string`

Storage type: `local` | `s3` | `azure` | `gcs`

##### `storage.root`

**Type:** `string`

Root directory (for local storage).

#### `assets.upload`

**Type:** `object`

File upload configuration.

```yaml
upload:
  maxFileSize: 10485760      # 10MB
  maxFiles: 10
  allowedTypes: ['image/*', 'application/pdf']
  dest: './uploads/temp'
```

##### `upload.maxFileSize`

**Type:** `number`

Maximum file size in bytes.

##### `upload.maxFiles`

**Type:** `number`

Maximum number of files per upload.

##### `upload.allowedTypes`

**Type:** `array<string>`

Allowed MIME types or patterns.

---

## Reference Syntax

### Environment Variables

```yaml
value: [env]:VARIABLE_NAME
```

References `process.env.VARIABLE_NAME`.

### Configuration References

```yaml
value: [section]:key
```

References another configuration section.

Examples:
```yaml
bindTo: [servers]:default
database: [databases]:primary
```

---

## Complete Example

```yaml
# .config/index.yml
typescript: true

directory:
  base: './src'
  pattern: 'mvc'

autowire: true

__extends__: [
  'servers',
  'databases',
  'security',
  'sessions',
  'assets'
]
```

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
      
  - type: socketio
    key: chat
    plugin: '@ckenx/kenx-socketio'
    bindTo: http:api
```

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
```

---

## Next Steps

- **[Configuration Examples](./examples.md)** - Real-world configuration examples
- **[Environment Setup](../environment/index.md)** - Environment variables guide
- **[Services & Resources](../services-and-resources/index.md)** - Using configured resources

---

**Previous:** [← Configuration System](./index.md) | **Next:** [Configuration Examples →](./examples.md)
