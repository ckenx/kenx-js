# Kenx for JS

⚡ A config-first development framework for Node.js, Deno, and Bun. Build applications faster by declaring resources in YAML instead of writing boilerplate code.

## Features

- **🎯 Config-First** - Define servers, databases, and services in YAML
- **🔌 Plugin System** - Modular architecture with official and community plugins
- **🚀 Multi-Runtime** - Works with Node.js, Deno, and Bun
- **🔄 Framework Agnostic** - Switch between Express, Fastify, or native HTTP
- **💉 Auto-Wiring** - Automatic dependency injection via takeover system
- **📦 TypeScript-First** - Built with TypeScript, works with JavaScript too
- **🛠️ CLI Tools** - Project scaffolding, building, and plugin management

## Quick Start

### Installation

```bash
# Install CLI globally
npm install -g @ckenx/cli

# Create new project
ckenx create my-app

# Navigate to project
cd my-app

# Start development server
npm run dev
```

### Basic Example

**Configuration (.config/index.yml):**
```yaml
typescript: true
directory:
  base: './src'
  pattern: '-'

servers:
  - type: http
    key: api
    plugin: '@ckenx/kenx-express'
    PORT: 8000
```

**Application (src/index.ts):**
```typescript
export const takeover = ['http:api']

export default async (server) => {
  server.app.router('/hello', (req, res) => {
    res.json({ message: 'Hello from Kenx!' })
  })
  
  await server.listen()
}
```

## Documentation

📚 **[Complete Documentation](./docs/index.md)** | 🌐 **[Online Documentation](https://kenx.webmicros.com/kenx-js)**

### Getting Started
- **[Installation & Setup](./docs/getting-started.md)** - Get up and running quickly
- **[Core Concepts](./docs/core-concepts.md)** - Understand Kenx's philosophy
- **[Project Structure](./docs/project/create.md)** - Learn about project organization

### Core Documentation
- **[Configuration System](./docs/configuration/index.md)** - YAML configuration reference
- **[CLI Commands](./docs/project/cli.md)** - Command-line interface guide
- **[Architecture](./docs/project/architecture.md)** - Internal system design
- **[Environment Setup](./docs/environment/index.md)** - TypeScript, runtimes, and tools

### Working with Resources
- **[Services & Resources](./docs/services-and-resources/index.md)** - HTTP servers, databases, and takeover
- **[Plugin System](./docs/plugins/index.md)** - Using and creating plugins
- **[Available Plugins](./docs/plugins/available.md)** - Official plugin catalog
- **[Adapters](./docs/adapters/index.md)** - Express, Fastify, and framework adapters

### Development & Deployment
- **[Testing](./docs/dev-kit/testing/index.md)** - Unit, integration, and API testing
- **[Deployment](./docs/dev-kit/deployment/index.md)** - Docker, CI/CD, and production
- **[Best Practices](./docs/best-practices.md)** - Security, performance, and code quality
- **[Troubleshooting](./docs/troubleshooting.md)** - Common issues and solutions
- **[FAQ](./docs/faq.md)** - Frequently asked questions

## Supported Plugins

**Servers:**
- `@ckenx/kenx-express` - Express.js integration
- `@ckenx/kenx-fastify` - Fastify integration
- `@ckenx/kenx-http` - Native HTTP server

**Databases:**
- `@ckenx/kenx-mysql` - MySQL/MariaDB support
- `@ckenx/kenx-mongodb` - MongoDB integration

**Real-Time:**
- `@ckenx/kenx-socketio` - Socket.io for WebSockets

**Build Tools:**
- `@ckenx/kenx-vite` - Vite build integration

[See all plugins →](./docs/plugins/available.md)

## Examples

Check out example projects in the [`examples/`](./examples) directory:
- **[simple-ts](./examples/simple-ts)** - Basic TypeScript application
- **[simple-js](./examples/simple-js)** - Basic JavaScript application
- **[mvc](./examples/mvc)** - MVC pattern example
- **[react-ssr-ts](./examples/react-ssr-ts)** - React SSR with TypeScript

## Why Kenx?

**Traditional Setup:**
```typescript
// Lots of boilerplate code
import express from 'express'
import mysql from 'mysql2'

const app = express()
const db = mysql.createPool({ /* config */ })

app.use(express.json())
app.get('/users', async (req, res) => {
  // handler
})

app.listen(8000)
```

**Kenx Setup:**
```yaml
# Just configuration
servers:
  - plugin: '@ckenx/kenx-express'
    PORT: 8000

databases:
  - plugin: '@ckenx/kenx-mysql'
    host: localhost
```

```typescript
// Clean application code
export const takeover = ['http', 'database']

export default async (server, db) => {
  server.app.router('/users', handler)
  await server.listen()
}
```

## Feedback

Feedback is always welcome! Please report any issues in our [Issue Tracker](https://github.com/ckenx/kenx-js/issues) and we'll address them promptly.

## Contributing

We welcome contributions! To get started:

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Submit a pull request

Please review our:
- **[Contributing Guidelines](./CONTRIBUTING.md)**
- **[Code of Conduct](./CODE_OF_CONDUCT.md)**
- **[Project Roadmap](./ROADMAP.md)**

## Community

- **GitHub Discussions:** [Ask questions and share ideas](https://github.com/ckenx/kenx-js/discussions)
- **Issues:** [Report bugs or request features](https://github.com/ckenx/kenx-js/issues)

## License

This software is free to use under the MIT license. See the [LICENSE file](https://github.com/ckenx/kenx-js/blob/master/LICENSE) for details.

---

**Made with ❤️ by the Kenx team**
