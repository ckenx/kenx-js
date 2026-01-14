# Core Concepts

This guide explains the fundamental concepts and philosophy behind Kenx-JS.

## Framework Philosophy

Kenx is built on the principle of **configuration over code**. Instead of writing boilerplate code to set up servers, databases, and middleware, you define your application's structure in simple YAML files. Kenx handles the heavy lifting of wiring everything together.

### The Three Pillars

1. **Simple Setup** - Minimal boilerplate, maximum productivity
2. **Development Assistance** - Built-in tools and automation
3. **Easy Maintenance** - Clear patterns and clean architecture

## Config-First Architecture

Unlike traditional frameworks where you write code to configure your application, Kenx **inverts this relationship**. You declare what you want in configuration files, and Kenx handles the setup.

### Traditional Approach (Express)

```javascript
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const session = require('express-session')

const app = express()

app.use(cors())
app.use(helmet())
app.use(express.json())
// ... more setup code

app.listen(8000)
```

### Kenx Approach

**`.config/servers.yml`**

```yaml
servers:
  - type: http
    plugin: '@ckenx/kenx-express'
    PORT: 8000
    application:
      type: express
      plugin: '@ckenx/kenx-express'
```

**`src/index.ts`**

```typescript
export const takeover = ['http']
export default async (httpServer) => {
  const { app } = httpServer
  // Your routes here
  await httpServer.listen(true)
}
```

Configuration over code. Clean and maintainable.

## Project Patterns

Kenx supports two architectural patterns:

### 1. Singleton Pattern (Default)

Single entry point with full control over your application structure.

**Structure:**
```
src/
├── index.ts          # Main entry point
├── routes/           # Route definitions
├── services/         # Business logic
└── utils/            # Utilities
```

**Best for:**
- Small to medium applications
- Microservices
- APIs with simple structure
- When you prefer flexibility

### 2. MVC Pattern

Model-View-Controller pattern with automatic dependency injection:

```
src/
├── models/
│   └── index.ts       # Models factory
├── views/
│   └── index.ts        # Views factory (optional)
└── controllers/
    └── index.ts          # Controllers factory
```

**`src/models/index.ts`**

```typescript
export const takeover = ['database:*']

export default (databases: any) => {
  return {
    User: createUserModel(databases.default),
    Post: createPostModel(databases.default)
  }
}
```

**`src/controllers/index.ts`**

```typescript
export const takeover = ['http:*']

export default (http, models, views) => {
  const { app } = http.default
  
  app.router('/', (req, res) => {
    res.json({ message: 'MVC Pattern' })
  })
}
```

This pattern promotes better separation of concerns for larger applications.

## 4. Plugin System

### What Makes Kenx Plugins Special

Plugins in Kenx are **auto-installing** and **self-contained**. When you reference a plugin in your configuration, Kenx automatically installs it if missing.

### Plugin Architecture

```yaml
servers:
  - type: http
    plugin: '@ckenx/kenx-express'  # Auto-installed if missing
    application:
      type: express
      plugin: '@ckenx/kenx-express'
```

**Local Plugins** (`/src/plugins/`)
```
src/
└── plugins/
    └── my-custom-plugin/
        ├── index.ts
        └── package.json
```

**NPM Plugins** (auto-installed)
```yaml
servers:
  - plugin: '@ckenx/kenx-express'  # Automatically installed if missing
```

## Resource Takeover System

The **takeover mechanism** is Kenx's approach to dependency injection. Instead of manually importing and configuring resources, you declare what you need, and Kenx provides it.

### How It Works

**1. Define Resources in Configuration**

```yaml
# .config/servers.yml
servers:
  - type: http
    key: api
    plugin: '@ckenx/kenx-express'
  
  - type: socketio
    key: chat
    plugin: '@ckenx/kenx-socketio'
    bindTo: http:default

databases:
  - type: mysql
    key: default
    plugin: '@ckenx/kenx-mysql'
```

**2. Specify Resources in Takeover Array**

```typescript
// Request specific resources
export const takeover = ['http', 'socketio', 'database']

export default async (http, socketio, database) => {
  // Resources are automatically injected
}
```

**3. Kenx Handles Everything Else**
- Loads configuration
- Installs missing plugins
- Creates resources
- Injects them into your application

## Project Patterns

Kenx supports two project directory patterns:

### Singleton Pattern (Default)

Single entry point at `src/index.ts`:

```typescript
export const takeover = ['http', 'database']

export default async (httpServer, database) => {
  // Your application logic
}
```

**When to use:**
- Small to medium applications
- Microservices
- API servers
- When you prefer full control

### MVC Pattern

Separate concerns into Models, Views, and Controllers:

```
src/
├── models/index.ts      # Data models
├── views/index.ts       # View templates
└── controllers/index.ts # Route controllers
```

Configure in `.config/index.yml`:

```yaml
directory:
  base: './src'
  pattern: 'mvc'
```

**MVC Structure:**

```typescript
// src/models/index.ts
export const takeover = ['database:*']

export default (databases) => {
  return {
    User: createUserModel(databases.default),
    Post: createPostModel(databases.default)
  }
}

// src/controllers/index.ts
export const takeover = ['http:*']

export default (httpServers, models, views) => {
  const { app } = httpServers.default
  
  app.router('/api', (req, res) => {
    res.json({ message: 'API ready' })
  })
}
```

## Next Steps

- **[Configuration System](./configuration/index.md)** - Master YAML configuration
- **[The Project](./project/index.md)** - Learn about CLI and project structure
- **[Plugins](./plugins/index.md)** - Explore available plugins

---

**Previous:** [← Getting Started](./getting-started.md) | **Next:** [The Project →](./project/index.md)
