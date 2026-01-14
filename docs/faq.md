# Frequently Asked Questions

Common questions about Kenx and answers to help you get started.

## General Questions

### What is Kenx?

Kenx is a config-first development framework for Node.js, Deno, and Bun. It emphasizes configuration over code, allowing you to build applications by declaring resources in YAML files rather than writing boilerplate.

### Why use Kenx over other frameworks?

**Kenx advantages:**
- **Config-first approach** - Less boilerplate, more productivity
- **Multi-runtime support** - Works with Node.js, Deno, and Bun
- **Plugin system** - Modular and extensible
- **Framework agnostic** - Switch between Express, Fastify, etc.
- **Auto-wiring** - Automatic dependency injection
- **TypeScript-first** - Built with TypeScript in mind

**Compared to NestJS:**
- Lighter weight and simpler
- Configuration-driven vs decorator-driven
- Faster setup for simple applications

**Compared to AdonisJS:**
- More flexible architecture
- Better multi-runtime support
- Simpler learning curve

### Is Kenx production-ready?

Kenx is actively developed and used in production applications. However:
- Current version is `0.0.x` (pre-1.0)
- API may change between releases
- Test thoroughly before deploying critical applications
- Monitor the [roadmap](../ROADMAP.md) for stability updates

### What's the learning curve?

**Beginner-friendly if you know:**
- Basic Node.js and npm
- YAML syntax
- Basic TypeScript (optional but recommended)

**Time to first app:** 15-30 minutes

**Time to proficiency:** 1-2 weeks with regular use

### Where can I get help?

- **Documentation:** This documentation site
- **GitHub Issues:** [Report bugs or request features](https://github.com/ckenx/kenx-js/issues)
- **GitHub Discussions:** [Ask questions](https://github.com/ckenx/kenx-js/discussions)
- **Examples:** Check the `examples/` directory

---

## Installation & Setup

### What are the system requirements?

- **Node.js:** 16.x or higher (18.x recommended)
- **npm:** 7.x or higher
- **OS:** Windows, macOS, or Linux

### Can I use Kenx with JavaScript instead of TypeScript?

Yes! Kenx works with both:

**TypeScript:**
```yaml
typescript: true
```

**JavaScript:**
```yaml
typescript: false
```

However, TypeScript is recommended for better developer experience and type safety.

### Do I need to install Kenx globally?

No. Install locally per project:

```bash
npm install @ckenx/node
npm install -g @ckenx/cli  # Optional, for CLI commands
```

### Can I use Kenx with an existing project?

Yes, but it's easier to start fresh. To add to existing project:

1. Install Kenx packages
2. Create `.config/` directory
3. Add configuration files
4. Refactor entry point to use Kenx

See [Migration Guide](./migration/from-express.md) for details.

---

## Configuration

### Where do configuration files go?

All configuration files go in the `.config/` directory at the project root:

```
myapp/
├── .config/
│   ├── index.yml
│   ├── servers.yml
│   └── databases.yml
```

### Can I use JSON instead of YAML?

Currently, only YAML is supported for configuration files. JSON support may be added in future versions.

### How do I use different configs for dev/prod?

Use environment variables with references:

```yaml
# .config/servers.yml
servers:
  - HOST: [env]:HTTP_HOST
    PORT: [env]:HTTP_PORT
```

Then set different values in `.env.local` (dev) and `.env.production`.

### Can I split configuration into multiple files?

Yes! Use the `__extends__` property:

```yaml
# .config/index.yml
__extends__:
  - servers
  - databases
  - security
```

This loads and merges `servers.yml`, `databases.yml`, and `security.yml`.

### How do I validate my configuration?

1. **YAML syntax:**
   ```bash
   npm install -g yaml-lint
   yamllint .config/index.yml
   ```

2. **Kenx validation:**
   Run your app - Kenx will report configuration errors

---

## Plugins

### What plugins are available?

**Official plugins:**
- `@ckenx/kenx-express` - Express.js
- `@ckenx/kenx-fastify` - Fastify
- `@ckenx/kenx-mysql` - MySQL/MariaDB
- `@ckenx/kenx-mongodb` - MongoDB
- `@ckenx/kenx-socketio` - Socket.io
- `@ckenx/kenx-vite` - Vite build tool

See [Plugins](./plugins/index.md) for complete list.

### How do I install plugins?

**Via CLI:**
```bash
ckenx install @ckenx/kenx-express
```

**Via npm:**
```bash
npm install @ckenx/kenx-express
```

**Auto-install (development):**
Plugins referenced in config are auto-installed in development mode.

### Can I create custom plugins?

Yes! See [Creating Plugins](./plugins/creating.md) guide.

Basic structure:
```typescript
export default class MyPlugin {
  constructor(Setup, config) {
    // Initialize plugin
  }
  
  // Plugin methods
}
```

### Do plugins need to be published to npm?

No. You can use local plugins:

```yaml
servers:
  - plugin: './src/plugins/my-plugin'
```

---

## Development

### How do I run my app in development?

```bash
# Default
node -r @ckenx/node

# With nodemon (auto-reload)
nodemon --exec 'node -r @ckenx/node'

# With package.json script
npm run dev
```

### How do I debug my Kenx app?

**Enable debug logs:**
```bash
DEBUG=kenx:* node -r @ckenx/node
```

**Use Node.js inspector:**
```bash
node --inspect -r @ckenx/node
# Then open chrome://inspect
```

**Add breakpoints:**
```typescript
export default async (server) => {
  debugger  // Breakpoint here
  await server.listen()
}
```

### Can I use hot reload?

Yes, use `nodemon`:

```bash
npm install --save-dev nodemon
```

**nodemon.json:**
```json
{
  "watch": ["src", ".config"],
  "ext": "ts,js,yml",
  "exec": "node -r @ckenx/node"
}
```

### How do I test my Kenx app?

Use standard testing tools like Jest:

```typescript
import Core from '@ckenx/node'

describe('App', () => {
  beforeAll(async () => {
    await Core.Setup.dev()
    await Core.autoload()
  })
  
  it('should load resources', () => {
    expect(Core.RESOURCES.http).toBeDefined()
  })
})
```

See [Testing Guide](./dev-kit/testing/index.md).

---

## Patterns & Architecture

### What's the difference between Singleton and MVC patterns?

**Singleton (`pattern: '-'`):**
- Single entry point (`src/index.ts`)
- Full control over application flow
- Good for small to medium apps

**MVC (`pattern: 'mvc'`):**
- Separate models, views, controllers
- Structured approach
- Good for large, team-based apps

See [Core Concepts](./core-concepts.md#project-patterns).

### Can I use my own architecture?

Yes! The Singleton pattern gives you full control. Organize code however you prefer within `src/`.

### What is the "takeover" mechanism?

Takeover is Kenx's dependency injection system. You declare which resources you need, and Kenx provides them:

```typescript
export const takeover = ['http:api', 'database:default']

export default async (server, database) => {
  // Use resources
}
```

See [Services & Resources](./services-and-resources/index.md).

### Can I access resources without takeover?

Yes, but not recommended:

```typescript
import Core from '@ckenx/node'

const server = Core.RESOURCES.http.api
const db = Core.RESOURCES.database.default
```

Takeover is preferred for testability and clarity.

---

## Database

### What databases are supported?

**Via official plugins:**
- MySQL / MariaDB
- MongoDB
- PostgreSQL (planned)
- Redis (as custom resource)

**Via custom plugins:**
- Any database with a Node.js driver

### How do I run migrations?

Kenx doesn't include a migration system. Use external tools:

**MySQL:**
```bash
npm install -g mysql-migrations
mysql-migrations up
```

**MongoDB:**
```bash
npm install migrate-mongo
migrate-mongo up
```

Or use ORM migrations (Prisma, TypeORM, etc.)

### Can I use multiple databases?

Yes! Configure multiple databases:

```yaml
databases:
  - key: primary
    type: mysql
  - key: analytics
    type: mongodb
```

Access via takeover:
```typescript
export const takeover = ['database:*']

export default (databases) => {
  const { primary, analytics } = databases
}
```

### How do I handle database transactions?

**MySQL:**
```typescript
const connection = db.getConnection()

await connection.beginTransaction()
try {
  await connection.query('INSERT ...')
  await connection.query('UPDATE ...')
  await connection.commit()
} catch (error) {
  await connection.rollback()
  throw error
}
```

**MongoDB:**
```typescript
const session = db.getConnection().startSession()

await session.withTransaction(async () => {
  await collection.insertOne(doc, { session })
  await collection.updateOne(filter, update, { session })
})
```

---

## Deployment

### How do I deploy a Kenx app?

1. **Build:**
   ```bash
   npm run build
   ```

2. **Set environment variables**

3. **Deploy to platform:**
   - Docker
   - Heroku
   - Railway
   - VPS with PM2

See [Deployment Guide](./dev-kit/deployment/index.md).

### Can I deploy to serverless?

Limited support. Kenx is designed for long-running processes. For serverless, consider:
- Using Kenx for API layer only
- Deploying to platforms with long-running container support
- Adapting the architecture for serverless constraints

### Do I need to compile TypeScript before deploying?

Yes, for production:

```bash
npm run build
```

This creates the `dist/` directory with compiled JavaScript.

### How do I use PM2 with Kenx?

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'myapp',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
```

```bash
pm2 start ecosystem.config.js
```

---

## Performance

### Is Kenx fast?

Performance depends on chosen plugins:
- **Express:** Good performance
- **Fastify:** 2-3x faster than Express
- **Native HTTP:** Maximum performance

Kenx adds minimal overhead (~5-10ms) for configuration loading and resource management.

### How do I optimize performance?

1. **Use connection pooling:**
   ```yaml
   databases:
     - options:
         connectionLimit: 10
   ```

2. **Enable clustering (PM2):**
   ```javascript
   {
     instances: 'max',
     exec_mode: 'cluster'
   }
   ```

3. **Add caching (Redis)**

4. **Use Fastify** instead of Express

5. **Enable compression**

See [Best Practices](./best-practices.md#performance-optimization).

### Can Kenx handle high traffic?

Yes, with proper configuration:
- Use Fastify for better throughput
- Enable PM2 clustering
- Use load balancer (Nginx)
- Add caching layer
- Optimize database queries

---

## Troubleshooting

### My app won't start

Common causes:
1. **Configuration error** - Check YAML syntax
2. **Missing plugin** - Install required plugins
3. **Port in use** - Change port or kill process
4. **TypeScript error** - Run `tsc --noEmit`

See [Troubleshooting](./troubleshooting.md).

### Plugins aren't auto-installing

Auto-install only works in development:

```bash
NODE_ENV=development node -r @ckenx/node
```

In production, install manually:
```bash
npm install @ckenx/kenx-express
```

### TypeScript compilation fails

1. **Check tsconfig.json** is valid
2. **Fix TypeScript errors:**
   ```bash
   tsc --noEmit
   ```
3. **Clear and rebuild:**
   ```bash
   rm -rf dist/
   npm run build
   ```

### Database connection fails

1. **Verify credentials** in `.env`
2. **Check database is running**
3. **Test connection manually:**
   ```bash
   mysql -h localhost -u user -p database
   ```
4. **Check firewall/network**

---

## Contributing

### How can I contribute to Kenx?

- **Report bugs:** [GitHub Issues](https://github.com/ckenx/kenx-js/issues)
- **Suggest features:** [GitHub Discussions](https://github.com/ckenx/kenx-js/discussions)
- **Submit PRs:** Fork and submit pull requests
- **Improve docs:** Documentation PRs welcome
- **Create plugins:** Share your plugins with the community

### Where is the source code?

GitHub repository: [codewithdark/kenx-js](https://github.com/ckenx/kenx-js)

### What's the license?

Kenx is open source under the MIT License.

---

## Comparison with Other Frameworks

### Kenx vs Express

**Express:**
- Manual setup and configuration
- Middleware-based
- Flexible but verbose

**Kenx:**
- Config-driven setup
- Automatic resource management
- Can use Express as underlying framework

**When to use Kenx:** When you want faster setup with less boilerplate

### Kenx vs NestJS

**NestJS:**
- Angular-inspired architecture
- Decorator-based
- Full-featured framework
- Steeper learning curve

**Kenx:**
- Simpler, config-driven
- Less opinionated
- Faster for simple apps
- Easier to learn

**When to use Kenx:** Smaller projects, teams preferring configuration over decorators

### Kenx vs AdonisJS

**AdonisJS:**
- Full-stack MVC framework
- Includes ORM, templating, auth
- Opinionated structure

**Kenx:**
- More flexible
- Bring your own tools
- Multi-runtime support
- Lighter weight

**When to use Kenx:** When you want flexibility and control

---

## Future of Kenx

### What's on the roadmap?

Check the [ROADMAP.md](../ROADMAP.md) for planned features.

Highlights:
- More database plugins
- Built-in testing utilities
- GraphQL support
- Improved CLI tools
- Better documentation

### When will Kenx reach 1.0?

No specific timeline yet. Version 1.0 will be released when:
- API is stable
- Core features complete
- Production-tested
- Documentation comprehensive

### How can I stay updated?

- **Watch GitHub repo** for releases
- **Follow discussions** on GitHub
- **Check changelog** for updates

---

## Still Have Questions?

- **Documentation:** Explore the full documentation
- **GitHub Issues:** [Search existing issues](https://github.com/ckenx/kenx-js/issues)
- **GitHub Discussions:** [Ask the community](https://github.com/ckenx/kenx-js/discussions)
- **Examples:** Check `examples/` directory in the repo

---

**Previous:** [← Troubleshooting](./troubleshooting.md) | **Next:** [Core Concepts →](./core-concepts.md)
