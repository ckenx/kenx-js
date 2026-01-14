# Creating New Applications

Set up a modern web application by running one command with Kenx CLI.

## Why Kenx for Project Creation?

### 1. Less to Learn
You don't need to learn and configure many build tools. Instant reloads help you focus on development. When it's time to deploy, your bundles are optimized automatically.

### 2. Only One Dependency
Your application only needs one build dependency. We test Kenx to make sure that all of its underlying pieces work together seamlessly – no complicated version mismatches.

### 3. No Lock-In
Under the hood, we use plugins to support other amazing projects to power your application. If you ever want an advanced configuration, you can customize the setup directly through configuration files.

---

## Quick Start

### Create a New Project

```bash
npx ckenx create my-app
```

This will prompt you to choose:
- **Runtime**: Node.js, Deno, or Bun
- **Language**: JavaScript or TypeScript
- **Template**: Basic or MVC pattern

### Using Latest Version

```bash
npx ckenx@latest create my-app
```

### Runtime-Specific Creation

```bash
# Node.js project
ckenx create my-app --node

# Deno project
ckenx create my-app --deno

# Bun project
ckenx create my-app --bun
```

---

## Project Templates

### Basic Template (Singleton Pattern)

Simple, flexible structure with a single entry point.

**Best for:**
- Small to medium applications
- APIs and microservices
- Quick prototypes
- When you prefer full control

**Structure:**
```
my-app/
├── .config/              # Configuration directory
│   ├── index.yml         # Main configuration
│   ├── servers.yml       # Server configurations
│   ├── databases.yml     # Database configurations
│   ├── security.yml      # Security settings
│   ├── sessions.yml      # Session configuration
│   └── assets.yml        # Static assets configuration
├── src/                  # Source code
│   ├── index.ts          # Main entry point
│   ├── routes/           # Route definitions
│   │   └── index.ts
│   ├── services/         # Business logic
│   └── utils/            # Utility functions
├── public/               # Static files
├── .env                  # Production environment
├── .env.local            # Development environment
├── .gitignore
├── package.json
├── tsconfig.json         # TypeScript config
└── autorun               # Development script
```

### MVC Template

Model-View-Controller pattern with separation of concerns.

**Best for:**
- Large applications
- Team collaboration
- Complex business logic
- When structure is important

**Structure:**
```
my-app/
├── .config/              # Configuration directory
├── src/
│   ├── models/           # Data models
│   │   └── index.ts      # Models factory
│   ├── views/            # View templates
│   │   └── index.ts      # Views factory
│   └── controllers/      # Controllers
│       └── index.ts      # Controllers factory
├── public/
├── .env
├── .env.local
├── package.json
└── tsconfig.json
```

---

## Generated Files Explained

### Configuration Files

#### `.config/index.yml`
Main configuration file that orchestrates your application.

```yaml
# Enable TypeScript compilation
typescript: true

# Project directory structure
directory:
  base: './src'
  pattern: '-'  # or 'mvc'

# Automatic dependency injection
autowire: true

# Extend with additional configurations
__extends__: [
  'servers',
  'databases',
  'security',
  'sessions',
  'assets'
]
```

#### `.config/servers.yml`
Server configurations for HTTP, WebSocket, etc.

```yaml
servers:
  - type: http
    key: default
    plugin: '@ckenx/kenx-express'
    HOST: [env]:HTTP_HOST
    PORT: [env]:HTTP_PORT
    application:
      type: express
      plugin: '@ckenx/kenx-express'
```

#### `.config/databases.yml`
Database connection configurations.

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
```

#### `.config/security.yml`
Security features and middleware.

```yaml
security:
  cors:
    enabled: true
    origin: '*'
  helmet:
    enabled: true
  xss:
    enabled: true
```

### Source Files

#### `src/index.ts` (Singleton Pattern)
Main application entry point.

```typescript
import type { ServerPlugin } from '@ckenx/node/types'
import type http from 'http'

// Specify resources to inject
export const takeover = ['http']

// Main application function
export default async (httpServer: ServerPlugin<http.Server>) => {
  const { app } = httpServer
  
  // Define routes
  app.router('/', (req, res) => {
    res.json({ message: 'Hello, Kenx!' })
  })
  
  // Start server
  await httpServer.listen(true)
}
```

#### `src/models/index.ts` (MVC Pattern)
Models factory for database interaction.

```typescript
export const takeover = ['database:*']

export default (databases: any) => {
  const db = databases.default.getConnection()
  
  return {
    User: createUserModel(db),
    Post: createPostModel(db)
  }
}
```

#### `src/controllers/index.ts` (MVC Pattern)
Controllers for request handling.

```typescript
export const takeover = ['http:*']

export default (httpServers: any, models: any, views: any) => {
  const { app } = httpServers.default
  
  app.router('/api/users', (req, res) => {
    // Use models here
    res.json({ users: [] })
  })
}
```

### Environment Files

#### `.env` (Production)
Production environment variables.

```env
NODE_ENV=production
HTTP_HOST=0.0.0.0
HTTP_PORT=3000

DB_HOST=production.db.com
DB_NAME=myapp
DB_USER=produser
DB_PASSWORD=***
```

#### `.env.local` (Development)
Development environment variables (gitignored).

```env
NODE_ENV=development
HTTP_HOST=0.0.0.0
HTTP_PORT=8000

DB_HOST=localhost
DB_NAME=myapp_dev
DB_USER=root
DB_PASSWORD=dev123
```

### Build Files

#### `package.json`
Node.js dependencies and scripts.

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "node -r @ckenx/node",
    "build": "ckenx build",
    "start": "NODE_ENV=production node -r @ckenx/node"
  },
  "dependencies": {
    "@ckenx/node": "^0.0.16"
  }
}
```

#### `tsconfig.json`
TypeScript compiler configuration.

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    "baseUrl": "./",
    "paths": {
      "#routes/*": ["src/routes/*"],
      "#services/*": ["src/services/*"],
      "#types/*": ["src/types/*"]
    },
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

#### `autorun`
Development convenience script.

```bash
#!/bin/bash
NODE_ENV=development node -r @ckenx/node
```

---

## Post-Creation Steps

### 1. Navigate to Project

```bash
cd my-app
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment

Edit `.env.local` with your development settings:

```env
HTTP_PORT=8000
DB_HOST=localhost
```

### 4. Start Development Server

```bash
./autorun
# or
npm run dev
```

### 5. Test Your Application

Visit `http://localhost:8000` in your browser.

---

## Customization Options

### Change Project Pattern

Edit `.config/index.yml`:

```yaml
directory:
  pattern: 'mvc'  # Switch to MVC pattern
```

### Add More Servers

Edit `.config/servers.yml`:

```yaml
servers:
  - type: http
    key: api
    plugin: '@ckenx/kenx-express'
  
  - type: socketio
    key: chat
    plugin: '@ckenx/kenx-socketio'
    bindTo: http:api
```

### Add Databases

Edit `.config/databases.yml`:

```yaml
databases:
  - type: mysql
    key: default
    plugin: '@ckenx/kenx-mysql'
  
  - type: mongodb
    key: cache
    plugin: '@ckenx/kenx-mongodb'
```

---

## Common Patterns

### REST API Project

```bash
ckenx create my-api --node
cd my-api
```

Add routes in `src/routes/api.ts`:

```typescript
export default (router: any) => {
  router.get('/users', (req, res) => {
    res.json({ users: [] })
  })
  
  router.post('/users', (req, res) => {
    res.json({ message: 'User created' })
  })
}
```

### Full-Stack Application

```bash
ckenx create my-fullstack --node
cd my-fullstack
```

Add Vite for frontend:

```yaml
# .config/servers.yml
servers:
  - type: vite
    plugin: '@ckenx/kenx-vite'
    build: true
```

### Microservices

Create multiple services:

```bash
ckenx create user-service --node
ckenx create order-service --node
ckenx create gateway-service --node
```

---

## Troubleshooting

### Creation Fails

Ensure you have the latest CLI:

```bash
npm install -g ckenx@latest
```

### Permission Issues

On Unix systems:

```bash
chmod +x autorun
```

### Missing Dependencies

Reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

- **[CLI Reference](./cli.md)** - Learn all CLI commands
- **[Architecture](./architecture.md)** - Understand project structure
- **[Configuration](../configuration/index.md)** - Configure your application

---

**Previous:** [← CLI](./cli.md) | **Next:** [Configuration System →](../configuration/index.md)