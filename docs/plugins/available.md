# Available Plugins

Complete reference of official and community Kenx plugins.

## Overview

Kenx plugins extend the framework with support for various technologies. This page lists all available plugins organized by category.

**Official Plugins:**
- Maintained by the Kenx core team
- Published under `@ckenx/*` scope
- Fully tested and documented

**Community Plugins:**
- Created by the community
- Various quality and maintenance levels
- Check individual repositories for support

---

## Server Plugins

### HTTP Server Plugins

#### @ckenx/kenx-express

**Express.js integration**

```bash
npm install @ckenx/kenx-express
```

**Configuration:**
```yaml
servers:
  - type: http
    key: api
    plugin: '@ckenx/kenx-express'
    HOST: [env]:HTTP_HOST
    PORT: [env]:HTTP_PORT
```

**Features:**
- Express middleware support
- Unified router API
- Static file serving
- View engine support

**Version:** ^0.0.16  
**Repository:** [kenx-js/packages/plugins/kenx-express](https://github.com/codewithdark/kenx-js/tree/main/packages/plugins/kenx-express)

---

#### @ckenx/kenx-fastify

**Fastify integration**

```bash
npm install @ckenx/kenx-fastify
```

**Configuration:**
```yaml
servers:
  - type: http
    key: api
    plugin: '@ckenx/kenx-fastify'
    HOST: [env]:HTTP_HOST
    PORT: [env]:HTTP_PORT
```

**Features:**
- High-performance routing
- JSON schema validation
- Plugin system
- Lifecycle hooks

**Version:** ^0.0.16  
**Repository:** [kenx-js/packages/plugins/kenx-fastify](https://github.com/codewithdark/kenx-js/tree/main/packages/plugins/kenx-fastify)

---

#### @ckenx/kenx-http

**Native Node.js HTTP server**

```bash
npm install @ckenx/kenx-http
```

**Configuration:**
```yaml
servers:
  - type: http
    key: api
    plugin: '@ckenx/kenx-http'
    PORT: [env]:HTTP_PORT
```

**Features:**
- Minimal overhead
- Direct HTTP control
- WebSocket support
- Custom request handling

**Version:** ^0.0.16  
**Repository:** [kenx-js/packages/plugins/kenx-http](https://github.com/codewithdark/kenx-js/tree/main/packages/plugins/kenx-http)

---

## Database Plugins

### SQL Databases

#### @ckenx/kenx-mysql

**MySQL/MariaDB database integration**

```bash
npm install @ckenx/kenx-mysql
```

**Configuration:**
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
      port: 3306
      connectionLimit: 10
```

**Features:**
- Connection pooling
- Prepared statements
- Transaction support
- Promise-based API

**Version:** ^0.0.16  
**Repository:** [kenx-js/packages/plugins/kenx-mysql](https://github.com/codewithdark/kenx-js/tree/main/packages/plugins/kenx-mysql)

---

### NoSQL Databases

#### @ckenx/kenx-mongodb

**MongoDB database integration**

```bash
npm install @ckenx/kenx-mongodb
```

**Configuration:**
```yaml
databases:
  - type: mongodb
    key: default
    plugin: '@ckenx/kenx-mongodb'
    autoconnect: true
    options:
      url: [env]:MONGODB_URL
      dbName: [env]:DB_NAME
```

**Features:**
- Native MongoDB driver
- Connection pooling
- GridFS support
- Change streams

**Version:** ^0.0.16  
**Repository:** [kenx-js/packages/plugins/kenx-mongodb](https://github.com/codewithdark/kenx-js/tree/main/packages/plugins/kenx-mongodb)

---

## Real-Time Plugins

#### @ckenx/kenx-socketio

**Socket.io integration for real-time communication**

```bash
npm install @ckenx/kenx-socketio
```

**Configuration:**
```yaml
auxiliaries:
  - type: socketio
    key: io
    plugin: '@ckenx/kenx-socketio'
    attachTo: [servers]:api
```

**Features:**
- WebSocket communication
- Room/namespace support
- Event-based messaging
- Auto-reconnection

**Version:** ^0.0.16  
**Repository:** [kenx-js/packages/plugins/kenx-socketio](https://github.com/codewithdark/kenx-js/tree/main/packages/plugins/kenx-socketio)

---

## Middleware Plugins

### Express Middleware

#### @ckenx/kenx-express-session

**Session management for Express**

```bash
npm install @ckenx/kenx-express-session
```

**Configuration:**
```yaml
servers:
  - plugin: '@ckenx/kenx-express'
    middleware:
      - plugin: '@ckenx/kenx-express-session'
        options:
          secret: [env]:SESSION_SECRET
          resave: false
          saveUninitialized: false
```

**Features:**
- Session storage
- Cookie-based sessions
- Multiple store support
- Secure cookies

**Version:** ^0.0.16  
**Repository:** [kenx-js/packages/plugins/kenx-express-session](https://github.com/codewithdark/kenx-js/tree/main/packages/plugins/kenx-express-session)

---

#### @ckenx/kenx-express-assets

**Static asset serving for Express**

```bash
npm install @ckenx/kenx-express-assets
```

**Configuration:**
```yaml
servers:
  - plugin: '@ckenx/kenx-express'
    middleware:
      - plugin: '@ckenx/kenx-express-assets'
        options:
          root: './public'
          maxAge: '1d'
```

**Features:**
- Static file serving
- Cache control
- Compression support
- Directory listing

**Version:** ^0.0.16  
**Repository:** [kenx-js/packages/plugins/kenx-express-assets](https://github.com/codewithdark/kenx-js/tree/main/packages/plugins/kenx-express-assets)

---

### Fastify Middleware

#### @ckenx/kenx-fastify-session

**Session management for Fastify**

```bash
npm install @ckenx/kenx-fastify-session
```

**Configuration:**
```yaml
servers:
  - plugin: '@ckenx/kenx-fastify'
    middleware:
      - plugin: '@ckenx/kenx-fastify-session'
        options:
          secret: [env]:SESSION_SECRET
```

**Features:**
- Fastify-optimized sessions
- Multiple store backends
- Secure cookie handling

**Version:** ^0.0.16  
**Repository:** [kenx-js/packages/plugins/kenx-fastify-session](https://github.com/codewithdark/kenx-js/tree/main/packages/plugins/kenx-fastify-session)

---

#### @ckenx/kenx-fastify-assets

**Static asset serving for Fastify**

```bash
npm install @ckenx/kenx-fastify-assets
```

**Configuration:**
```yaml
servers:
  - plugin: '@ckenx/kenx-fastify'
    middleware:
      - plugin: '@ckenx/kenx-fastify-assets'
        options:
          root: './public'
```

**Features:**
- Fast static file serving
- Compression
- Cache headers

**Version:** ^0.0.16  
**Repository:** [kenx-js/packages/plugins/kenx-fastify-assets](https://github.com/codewithdark/kenx-js/tree/main/packages/plugins/kenx-fastify-assets)

---

## Routing Plugins

#### @ckenx/kenx-routing

**Advanced routing capabilities**

```bash
npm install @ckenx/kenx-routing
```

**Configuration:**
```yaml
servers:
  - plugin: '@ckenx/kenx-express'
    routing:
      plugin: '@ckenx/kenx-routing'
      options:
        autoLoad: true
        directory: './routes'
```

**Features:**
- Auto-load routes
- Route grouping
- Middleware chaining
- Route validation

**Version:** ^0.0.16  
**Repository:** [kenx-js/packages/plugins/kenx-routing](https://github.com/codewithdark/kenx-js/tree/main/packages/plugins/kenx-routing)

---

## Build Tool Plugins

#### @ckenx/kenx-vite

**Vite integration for modern frontend builds**

```bash
npm install @ckenx/kenx-vite
```

**Configuration:**
```yaml
build:
  - plugin: '@ckenx/kenx-vite'
    options:
      root: './client'
      outDir: './public/dist'
```

**Features:**
- Fast HMR
- Build optimization
- SSR support
- Plugin ecosystem

**Version:** ^0.0.16  
**Repository:** [kenx-js/packages/plugins/kenx-vite](https://github.com/codewithdark/kenx-js/tree/main/packages/plugins/kenx-vite)

---

## Event Plugins

#### @ckenx/kenx-mongodb-events

**MongoDB change stream integration**

```bash
npm install @ckenx/kenx-mongodb-events
```

**Configuration:**
```yaml
databases:
  - type: mongodb
    plugin: '@ckenx/kenx-mongodb'
    events:
      plugin: '@ckenx/kenx-mongodb-events'
      watch: ['users', 'posts']
```

**Features:**
- Real-time change detection
- Collection watching
- Event filtering
- Custom handlers

**Version:** ^0.0.16  
**Repository:** [kenx-js/packages/plugins/kenx-mongodb-events](https://github.com/codewithdark/kenx-js/tree/main/packages/plugins/kenx-mongodb-events)

---

## Plugin Compatibility Matrix

| Plugin | Node.js 16 | Node.js 18 | Node.js 20 | Deno | Bun |
|--------|-----------|-----------|-----------|------|-----|
| kenx-express | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| kenx-fastify | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| kenx-http | ✅ | ✅ | ✅ | ✅ | ✅ |
| kenx-mysql | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| kenx-mongodb | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| kenx-socketio | ✅ | ✅ | ✅ | ❌ | ⚠️ |
| kenx-vite | ✅ | ✅ | ✅ | ⚠️ | ✅ |

**Legend:**
- ✅ Fully supported
- ⚠️ Experimental/limited support
- ❌ Not supported

---

## Plugin Installation

### Via CLI

```bash
# Install single plugin
ckenx install @ckenx/kenx-express

# Install multiple plugins
ckenx install @ckenx/kenx-express @ckenx/kenx-mysql
```

### Via npm

```bash
npm install @ckenx/kenx-express @ckenx/kenx-mysql
```

### Auto-installation

Plugins referenced in config are auto-installed in development mode:

```yaml
# Simply reference - auto-installed in dev
servers:
  - plugin: '@ckenx/kenx-express'
```

---

## Community Plugins

### Contributing Your Plugin

To add your plugin to this list:

1. **Follow naming conventions** - Use `kenx-*` prefix
2. **Document thoroughly** - Include README with examples
3. **Add keywords** - Include `kenx`, `kenx-plugin` in package.json
4. **Submit PR** - Add to this documentation
5. **Maintain actively** - Keep plugin updated

### Finding Community Plugins

**npm search:**
```bash
npm search kenx-plugin
```

**GitHub search:**
```
topic:kenx-plugin
```

---

## Plugin Development

Interested in creating your own plugin? See:
- **[Creating Plugins Guide](./creating.md)** - Detailed development guide
- **[Plugin System Overview](./index.md)** - Architecture and concepts
- **[Example Plugins](https://github.com/codewithdark/kenx-js/tree/main/packages/plugins)** - Official plugin source code

---

## Plugin Support

### Getting Help

- **Documentation:** Check plugin README
- **Issues:** Report on plugin's GitHub repository
- **Community:** Ask in GitHub Discussions

### Reporting Issues

When reporting plugin issues, include:
1. Plugin name and version
2. Kenx version
3. Node.js/runtime version
4. Configuration (sanitized)
5. Error message and stack trace

---

## Upcoming Plugins

**Planned Official Plugins:**
- `@ckenx/kenx-postgresql` - PostgreSQL support
- `@ckenx/kenx-redis` - Redis caching
- `@ckenx/kenx-graphql` - GraphQL server
- `@ckenx/kenx-auth` - Authentication utilities
- `@ckenx/kenx-email` - Email sending
- `@ckenx/kenx-queue` - Job queue system

Check the [roadmap](../../ROADMAP.md) for updates.

---

## Plugin Statistics

**Official Plugins:** 12+  
**Total Downloads:** Growing  
**Active Maintainers:** Core team + community

---

## Resources

- **[Plugin System](./index.md)** - Plugin concepts and usage
- **[Creating Plugins](./creating.md)** - Development guide
- **[GitHub Repository](https://github.com/codewithdark/kenx-js)** - Source code
- **[npm Registry](https://www.npmjs.com/search?q=keywords:kenx-plugin)** - Browse all plugins

---

**Previous:** [← Creating Plugins](./creating.md) | **Next:** [Adapters →](../adapters/index.md)
