# Getting Started with Kenx

This guide will help you install Kenx, create your first application, and understand the basics of the framework.

## Prerequisites

Before you begin, ensure you have one of the following JavaScript runtimes installed:

- **Node.js** v16.x or higher ([Download](https://nodejs.org/))
- **Deno** v1.x or higher ([Download](https://deno.land/))
- **Bun** v1.x or higher ([Download](https://bun.sh/))

## Installation

### Install Kenx CLI

Install the Kenx command-line interface globally:

```bash
npm install -g ckenx
```

Verify the installation:

```bash
ckenx -v
```

## Creating Your First Project

### 1. Create a New Application

Use the `create` command to scaffold a new Kenx project:

```bash
ckenx create my-app
```

You'll be prompted to choose:
- **Runtime**: Node.js, Deno, or Bun
- **Language**: JavaScript or TypeScript
- **Template**: Basic or MVC pattern

Or specify options directly:

```bash
# Create a Node.js project
ckenx create my-app --node

# Create a Deno project
ckenx create my-app --deno

# Create a Bun project
ckenx create my-app --bun
```

### 2. Navigate to Your Project

```bash
cd my-app
```

### 3. Install Dependencies

```bash
npm install
# or
yarn install
```

## Project Structure

After creation, your project will have the following structure:

```
my-app/
├── .config/              # Configuration files
│   ├── index.yml         # Main configuration
│   ├── servers.yml       # Server configurations
│   ├── databases.yml     # Database configurations
│   └── security.yml      # Security settings
├── src/                  # Source code
│   ├── index.ts          # Application entry point
│   └── routes/           # Route definitions
├── public/               # Static assets
├── .env                  # Environment variables (production)
├── .env.local            # Environment variables (development)
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
└── autorun               # Development start script
```

## Understanding the Configuration

Kenx uses a **config-first approach**. Your application is defined in YAML files located in the `.config` directory.

### Basic Configuration (`/.config/index.yml`)

```yaml
# Enable TypeScript
typescript: true

# Project directory structure
directory:
  base: './src'
  pattern: '-'  # Single entrypoint pattern

# Automatic dependency injection
autowire: true

# Extend with additional configuration files
__extends__: [
  'servers',
  'databases',
  'security'
]
```

### Server Configuration (`/.config/servers.yml`)

```yaml
servers:
  - type: http
    key: default
    plugin: '@ckenx/kenx-express'
    HOST: 0.0.0.0
    PORT: 8000
    application:
      type: express
      plugin: '@ckenx/kenx-express'
```

## Your First Application

### Singleton Pattern (Default)

The default entry point is `src/index.ts`:

```typescript
import type { ServerPlugin } from '@ckenx/node/types'
import type http from 'http'

// Export takeover array to specify which resources to inject
export const takeover = ['http']

// Main application function receives injected resources
export default async (httpServer: ServerPlugin<http.Server>) => {
  const { app } = httpServer
  
  // Define routes
  app.router('/', (req, res) => {
    res.send({ message: 'Hello, Kenx!' })
  })
  
  // Start server
  await httpServer.listen(true)
}
```

### Key Concepts

**Takeover Array**: Specifies which resources your application needs. Kenx automatically injects them.

```typescript
export const takeover = ['http', 'database', 'socketio']
```

**Resource Injection**: Resources are injected in the order specified in the takeover array.

## Running Your Application

### Development Mode

Start the development server with automatic recompilation:

```bash
npm run dev
# or use the autorun script
./autorun
```

Your application will be available at `http://localhost:8000`.

### Production Mode

Build and run your application for production:

```bash
# Build the application
ckenx build

# Run in production mode
ckenx run --prod
```

## Adding Routes

Create a route file in `src/routes/`:

**`src/routes/users.ts`**

```typescript
import type { Router } from 'express'

export default (router: Router) => {
  router.get('/users', (req, res) => {
    res.json({ users: [] })
  })
  
  router.post('/users', (req, res) => {
    res.json({ message: 'User created' })
  })
}
```

**Import in `src/index.ts`**

```typescript
import userRoutes from './routes/users'

export default async (httpServer: ServerPlugin<http.Server>) => {
  const { app } = httpServer
  
  // Register routes
  app.router('/api', userRoutes)
  
  await httpServer.listen(true)
}
```

## Environment Variables

Configure environment-specific values in `.env` files:

**`.env.local`** (Development)

```env
NODE_ENV=development
HTTP_HOST=0.0.0.0
HTTP_PORT=8000
DB_HOST=localhost
DB_NAME=myapp_dev
```

**`.env`** (Production)

```env
NODE_ENV=production
HTTP_HOST=0.0.0.0
HTTP_PORT=3000
DB_HOST=db.production.com
DB_NAME=myapp_prod
```

Access in your configuration using references:

```yaml
servers:
  - type: http
    HOST: [env]:HTTP_HOST
    PORT: [env]:HTTP_PORT
```

## Common Operations

### Install a Plugin

```bash
ckenx install @ckenx/kenx-mysql
```

### Uninstall a Plugin

```bash
ckenx uninstall @ckenx/kenx-mysql
```

### Build TypeScript Project

```bash
ckenx build
```

## Next Steps

Now that you have your first Kenx application running, explore these topics:

- **[Core Concepts](./core-concepts.md)** - Understand Kenx's architecture and philosophy
- **[Configuration System](./configuration/index.md)** - Deep dive into YAML configuration
- **[Plugins](./plugins/index.md)** - Explore available plugins and create your own
- **[Services & Resources](./services-and-resources/index.md)** - Work with databases, servers, and more

## Troubleshooting

### Port Already in Use

If you see an error about port 8000 being in use, change the port in `.env.local`:

```env
HTTP_PORT=8001
```

### TypeScript Compilation Errors

Ensure your `tsconfig.json` is properly configured. Kenx provides sensible defaults, but you can customize:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true
  }
}
```

### Plugin Not Found

If Kenx cannot find a plugin, ensure it's installed:

```bash
npm install @ckenx/kenx-express
```

## Getting Help

- 📖 [Full Documentation](./index.md)
- 🐛 [Report Issues](https://github.com/ckenx/kenx-js/issues)
- 💬 [Community Discussions](https://github.com/ckenx/kenx-js/discussions)

---

**Next:** [Core Concepts →](./core-concepts.md)
