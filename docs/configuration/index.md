# Configuration System

Kenx uses a powerful YAML-based configuration system that makes setting up applications declarative, maintainable, and version-controllable.

## Overview

The configuration system is the heart of Kenx's **config-first architecture**. Instead of writing code to set up servers, databases, and middleware, you define everything in YAML files located in the `.config/` directory.

## Configuration Directory

```
.config/
├── index.yml          # Main configuration
├── servers.yml        # Server configurations
├── databases.yml      # Database configurations
├── security.yml       # Security settings
├── sessions.yml       # Session management
├── assets.yml         # Static assets
└── frameworks.yml     # Framework-specific configs
```

## Basic Structure

### Main Configuration (`index.yml`)

```yaml
# Enable TypeScript compilation
typescript: true

# Project directory structure
directory:
  base: './src'
  pattern: '-'  # '-' for singleton, 'mvc' for MVC pattern

# Automatic dependency injection
autowire: true

# Extend with additional configuration files
__extends__: [
  'servers',
  'databases',
  'security',
  'sessions',
  'assets'
]
```

## Key Features

### 1. Cross-File Extension

Split your configuration into multiple files for better organization:

```yaml
# .config/index.yml
__extends__: [
  'servers',
  'databases',
  'security'
]
```

Kenx automatically merges configurations from extended files.

### 2. Reference Resolution

Reference values from other configuration sections or environment variables:

```yaml
servers:
  - type: http
    HOST: [env]:HTTP_HOST      # Reference environment variable
    PORT: [env]:HTTP_PORT
    
databases:
  - type: mysql
    host: [env]:DB_HOST
    database: [env]:DB_NAME
```

**Reference Syntax:**
- `[env]:VARIABLE_NAME` - Environment variable
- `[servers]:default` - Server configuration
- `[databases]:primary` - Database configuration

### 3. Auto-Plugin Collection

Plugins referenced in configuration are automatically collected and installed:

```yaml
servers:
  - plugin: '@ckenx/kenx-express'  # Auto-installed if missing
```

## Configuration Options

### TypeScript Support

Enable TypeScript compilation:

```yaml
typescript: true
```

When enabled:
- Automatic compilation on startup
- Source maps support
- Path alias resolution
- Type checking

### Directory Structure

Define your project's directory structure:

```yaml
directory:
  base: './src'          # Source code directory
  pattern: '-'           # Directory pattern
```

**Patterns:**
- `'-'` - Singleton pattern (default)
- `'mvc'` - Model-View-Controller pattern

### Autowire

Enable automatic dependency injection:

```yaml
autowire: true
```

When enabled, resources are automatically injected based on the `takeover` array.

## Server Configuration

Define HTTP servers, WebSocket servers, and more:

```yaml
servers:
  - type: http
    key: default           # Unique identifier
    plugin: '@ckenx/kenx-express'
    HOST: [env]:HTTP_HOST
    PORT: [env]:HTTP_PORT
    application:
      type: express
      plugin: '@ckenx/kenx-express'
```

**Server Types:**
- `http` - HTTP/HTTPS servers
- `socketio` - Socket.io servers
- `websocket` - WebSocket servers
- `vite` - Vite build server

### Multiple Servers

Run multiple servers simultaneously:

```yaml
servers:
  - type: http
    key: api
    PORT: 8000
    
  - type: socketio
    key: chat
    PORT: 8001
    bindTo: http:api  # Bind to existing HTTP server
```

## Database Configuration

Configure database connections:

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

**Database Types:**
- `mysql` - MySQL/MariaDB
- `mongodb` - MongoDB
- `redis` - Redis
- `postgres` - PostgreSQL (via custom plugin)

### Multiple Databases

Connect to multiple databases:

```yaml
databases:
  - type: mysql
    key: primary
    autoconnect: true
    
  - type: mongodb
    key: cache
    autoconnect: true
    
  - type: redis
    key: session
    autoconnect: false  # Connect manually
```

## Security Configuration

Built-in security features:

```yaml
security:
  cors:
    enabled: true
    origin: '*'
    credentials: true
    
  helmet:
    enabled: true
    contentSecurityPolicy: false
    
  xss:
    enabled: true
    
  frameGuard:
    enabled: true
    action: 'deny'
```

## Session Configuration

Configure session management:

```yaml
sessions:
  - type: local
    key: default
    secret: [env]:SESSION_SECRET
    cookie:
      maxAge: 86400000
      httpOnly: true
      secure: false
      
  - type: store
    key: redis
    store: redis
    secret: [env]:SESSION_SECRET
```

## Asset Configuration

Static file serving and storage:

```yaml
assets:
  static:
    - path: '/public'
      directory: './public'
      
  storage:
    type: local
    root: './uploads'
    
  upload:
    maxFileSize: 10485760  # 10MB
    allowedTypes: ['image/*', 'application/pdf']
```

## Environment Variables

Configuration works seamlessly with environment variables:

**`.env.local` (Development):**
```bash
NODE_ENV=development
HTTP_HOST=0.0.0.0
HTTP_PORT=8000

DB_HOST=localhost
DB_NAME=myapp_dev
DB_USER=root
DB_PASSWORD=dev123

SESSION_SECRET=dev-secret-key
```

**`.env` (Production):**
```bash
NODE_ENV=production
HTTP_HOST=0.0.0.0
HTTP_PORT=3000

DB_HOST=prod-db.example.com
DB_NAME=myapp
DB_USER=produser
DB_PASSWORD=***

SESSION_SECRET=***
```

## Configuration Loading Process

1. **Parse Main Config** - Load `.config/index.yml`
2. **Process Extensions** - Load files listed in `__extends__`
3. **Merge Configurations** - Combine all configurations
4. **Resolve References** - Replace `[section]:key` references
5. **Collect Plugins** - Gather all plugin dependencies
6. **Validate** - Check for required fields

## Best Practices

### 1. Use Environment Variables for Secrets

```yaml
# Good
database:
  password: [env]:DB_PASSWORD

# Bad - Never hardcode secrets
database:
  password: 'mysecret123'
```

### 2. Organize with Multiple Files

```yaml
# .config/index.yml
__extends__: [
  'servers',
  'databases',
  'security',
  'sessions'
]
```

Split related configurations into separate files for maintainability.

### 3. Use Meaningful Keys

```yaml
servers:
  - key: api      # Clear purpose
  - key: admin    # Clear purpose
  
# Not recommended
servers:
  - key: server1
  - key: server2
```

### 4. Document Complex Configurations

```yaml
servers:
  - type: http
    key: api
    # API server for public endpoints
    PORT: 8000
    
  - type: socketio
    key: chat
    # Real-time chat server
    bindTo: http:api
```

### 5. Version Control Configuration

- ✅ Commit `.config/` directory
- ✅ Commit `.env` (with placeholder values)
- ❌ Never commit `.env.local` (add to `.gitignore`)

## Common Patterns

### Development vs Production

Use environment-specific configurations:

```yaml
# .config/servers.yml
servers:
  - type: http
    HOST: [env]:HTTP_HOST
    PORT: [env]:HTTP_PORT
    # Different ports in .env vs .env.local
```

### Multi-Environment Setup

```yaml
# .config/databases.yml
databases:
  - type: mysql
    host: [env]:DB_HOST        # localhost in dev, prod URL in prod
    database: [env]:DB_NAME    # myapp_dev vs myapp
```

### Feature Flags

```yaml
# .config/index.yml
features:
  analytics: [env]:ENABLE_ANALYTICS
  beta: [env]:ENABLE_BETA_FEATURES
```

## Troubleshooting

### Configuration Not Found

Ensure `.config/index.yml` exists in project root:

```bash
ls -la .config/
```

### Reference Not Resolved

Check that the referenced section and key exist:

```yaml
servers:
  - HOST: [env]:HTTP_HOST  # Ensure HTTP_HOST is in .env.local
```

### Plugin Not Found

Verify plugin name in configuration matches the package:

```bash
npm install @ckenx/kenx-express
```

### Syntax Errors

Validate YAML syntax:

```bash
# Use online YAML validator or
yamllint .config/index.yml
```

## Next Steps

- **[Configuration Reference](./reference.md)** - Complete configuration schema
- **[Configuration Examples](./examples.md)** - Real-world examples
- **[Environment Setup](../environment/index.md)** - Environment variables guide

---

**Previous:** [← Create Applications](../project/create.md) | **Next:** [Configuration Reference →](./reference.md)
