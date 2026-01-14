# Environment Setup

Configure your Kenx application's runtime environment, TypeScript settings, and development tools.

## Environment Variables

Kenx uses environment variables for configuration values that change between environments.

### Environment Files

#### `.env.local` (Development)

Used automatically when `NODE_ENV=development`. This file should be **gitignored** and contain local development settings.

```env
NODE_ENV=development

# Server
HTTP_HOST=0.0.0.0
HTTP_PORT=8000

# Database
DB_HOST=localhost
DB_NAME=myapp_dev
DB_USER=root
DB_PASSWORD=dev123

# Session
SESSION_SECRET=dev-secret-key

# Debug
DEBUG=kenx:*
```

#### `.env` (Production)

Used in production environments. Commit this with **placeholder values only**.

```env
NODE_ENV=production

# Server
HTTP_HOST=0.0.0.0
HTTP_PORT=3000

# Database
DB_HOST=YOUR_DB_HOST
DB_NAME=YOUR_DB_NAME
DB_USER=YOUR_DB_USER
DB_PASSWORD=YOUR_DB_PASSWORD

# Session
SESSION_SECRET=YOUR_SESSION_SECRET
```

### Loading Strategy

Kenx automatically loads the correct environment file based on `NODE_ENV`:

```
Development:  NODE_ENV=development → .env.local
Production:   NODE_ENV=production  → .env
```

### Accessing Environment Variables

In configuration files, use the `[env]:` reference syntax:

```yaml
# .config/servers.yml
servers:
  - HOST: [env]:HTTP_HOST
    PORT: [env]:HTTP_PORT
```

In code, access via `process.env`:

```typescript
const port = process.env.HTTP_PORT || 8000
const dbHost = process.env.DB_HOST
```

### Environment Variable Best Practices

1. **Never commit secrets** - Add `.env.local` to `.gitignore`
2. **Use descriptive names** - `DB_HOST` not `HOST`
3. **Provide defaults** - Handle missing variables gracefully
4. **Document required variables** - List them in README

### Common Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` \| `production` |
| `HTTP_HOST` | Server host | `0.0.0.0` |
| `HTTP_PORT` | Server port | `8000` |
| `DB_HOST` | Database host | `localhost` |
| `DB_NAME` | Database name | `myapp` |
| `DB_USER` | Database user | `root` |
| `DB_PASSWORD` | Database password | `secret` |
| `SESSION_SECRET` | Session signing key | `random-string` |
| `LOG_LEVEL` | Logging level | `debug` \| `info` \| `error` |

---

## TypeScript Configuration

Kenx provides first-class TypeScript support with automatic compilation.

### Enabling TypeScript

In `.config/index.yml`:

```yaml
typescript: true
```

### TypeScript Configuration File

Create `tsconfig.json` in your project root:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "rootDir": "./src",
    "outDir": "./dist",
    "baseUrl": "./",
    "paths": {
      "#routes/*": ["src/routes/*"],
      "#services/*": ["src/services/*"],
      "#models/*": ["src/models/*"],
      "#types/*": ["src/types/*"]
    },
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

### Path Aliases

Path aliases make imports cleaner and more maintainable:

**Without aliases:**
```typescript
import { User } from '../../../models/User'
import { authMiddleware } from '../../middleware/auth'
```

**With aliases:**
```typescript
import { User } from '#models/User'
import { authMiddleware } from '#middleware/auth'
```

**Setup:**

1. Configure in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "#models/*": ["src/models/*"],
      "#middleware/*": ["src/middleware/*"]
    }
  }
}
```

2. Kenx automatically resolves aliases using `tsc-alias`

### Automatic Compilation

When `typescript: true` is enabled:

**Development Mode:**
- Compiles TypeScript on startup
- Watches for changes
- Provides source maps for debugging

**Production Mode:**
- Compiles during `ckenx build`
- Optimizes output
- Generates declaration files

### TypeScript Types

Kenx provides TypeScript types for core functionality:

```typescript
import type {
  ServerPlugin,
  DatabasePlugin,
  ApplicationPlugin,
  SetupConfig
} from '@ckenx/node/types'
```

**Example:**

```typescript
import type { ServerPlugin } from '@ckenx/node/types'
import type http from 'http'

export const takeover = ['http']

export default async (httpServer: ServerPlugin<http.Server>) => {
  const { app } = httpServer
  // TypeScript knows about app methods
  app.router('/', (req, res) => {
    res.json({ message: 'Typed!' })
  })
}
```

---

## Runtime Support

Kenx supports multiple JavaScript runtimes.

### Node.js

**Minimum Version:** v16.x

**Installation:**
```bash
# Using nvm
nvm install 16
nvm use 16

# Verify
node --version
```

**Create Node.js project:**
```bash
ckenx create my-app --node
```

### Deno

**Minimum Version:** v1.x

**Installation:**
```bash
# macOS/Linux
curl -fsSL https://deno.land/install.sh | sh

# Windows
irm https://deno.land/install.ps1 | iex

# Verify
deno --version
```

**Create Deno project:**
```bash
ckenx create my-app --deno
```

### Bun

**Minimum Version:** v1.x

**Installation:**
```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Verify
bun --version
```

**Create Bun project:**
```bash
ckenx create my-app --bun
```

### Runtime-Specific Features

| Feature | Node.js | Deno | Bun |
|---------|---------|------|-----|
| TypeScript | ✅ | ✅ | ✅ |
| ESM | ✅ | ✅ | ✅ |
| CJS | ✅ | ⚠️ | ✅ |
| Native Modules | ✅ | ⚠️ | ✅ |
| Performance | Good | Good | Excellent |

---

## Package Management

### npm (Node.js)

Default package manager for Node.js:

```bash
# Install dependencies
npm install

# Add dependency
npm install express

# Add dev dependency
npm install --save-dev @types/express

# Update dependencies
npm update
```

### Yarn (Node.js)

Alternative package manager:

```bash
# Install dependencies
yarn install

# Add dependency
yarn add express

# Add dev dependency
yarn add -D @types/express

# Update dependencies
yarn upgrade
```

### pnpm (Node.js)

Fast, disk space efficient:

```bash
# Install dependencies
pnpm install

# Add dependency
pnpm add express

# Add dev dependency
pnpm add -D @types/express
```

---

## Development Tools

### Linting

**ESLint** for code quality:

**Installation:**
```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

**.eslintrc.json:**
```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-explicit-any": "off"
  }
}
```

**package.json:**
```json
{
  "scripts": {
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix"
  }
}
```

### Formatting

**Prettier** for code formatting:

**Installation:**
```bash
npm install --save-dev prettier
```

**.prettierrc:**
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

**package.json:**
```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.ts\""
  }
}
```

### Git Hooks

**Husky** for pre-commit hooks:

```bash
npm install --save-dev husky lint-staged
npx husky install
```

**.husky/pre-commit:**
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

**package.json:**
```json
{
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

---

## Debugging

### VS Code

**.vscode/launch.json:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Kenx App",
      "runtimeArgs": ["-r", "@ckenx/node"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Chrome DevTools

Start with inspector:

```bash
node --inspect -r @ckenx/node
```

Open `chrome://inspect` and attach debugger.

### Debug Logging

Enable Kenx debug logs:

```bash
DEBUG=kenx:* node -r @ckenx/node
```

Or in `.env.local`:
```env
DEBUG=kenx:*
```

---

## Hot Reloading

### Development Mode

Kenx automatically recompiles TypeScript on changes:

```bash
./autorun
# or
npm run dev
```

### Watch Mode

For more control, use `nodemon`:

```bash
npm install --save-dev nodemon
```

**nodemon.json:**
```json
{
  "watch": ["src"],
  "ext": "ts,js,json,yml",
  "ignore": ["src/**/*.test.ts"],
  "exec": "node -r @ckenx/node"
}
```

**package.json:**
```json
{
  "scripts": {
    "dev": "nodemon"
  }
}
```

---

## Production Build

### Build Process

```bash
ckenx build
```

This creates optimized production assets:

```
dist/
├── index.js
├── index.js.map
├── setup.js
├── lib/
└── types/
```

### Build Configuration

Customize build in `.config/index.yml`:

```yaml
typescript: true

# TypeScript compiler will use project's tsconfig.json
```

### Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use `.env` file for production secrets
- [ ] Run `ckenx build` to compile
- [ ] Test with `ckenx run --prod`
- [ ] Enable security features in config
- [ ] Configure proper logging
- [ ] Set up monitoring

---

## Environment-Specific Configuration

### Multiple Environments

Create environment-specific files:

```
.env.local          # Local development
.env.development    # Shared development
.env.staging        # Staging environment
.env.production     # Production environment
```

Load based on `NODE_ENV`:

```bash
# Development
NODE_ENV=development node -r @ckenx/node

# Staging
NODE_ENV=staging node -r @ckenx/node

# Production
NODE_ENV=production node -r @ckenx/node
```

---

## Troubleshooting

### TypeScript Compilation Errors

Check `tsconfig.json` exists and is valid:
```bash
npx tsc --showConfig
```

### Module Resolution Issues

Ensure `baseUrl` and `paths` are set correctly in `tsconfig.json`.

### Environment Variables Not Loading

Verify `.env.local` exists and `NODE_ENV` is set correctly.

### Port Already in Use

Change port in `.env.local`:
```env
HTTP_PORT=8001
```

---

## Next Steps

- **[Setup Manager](../setup/index.md)** - Configuration loading internals
- **[Core System](../core/index.md)** - Application lifecycle
- **[Services & Resources](../services-and-resources/index.md)** - Using resources

---

**Previous:** [← Configuration Examples](../configuration/examples.md) | **Next:** [Setup Manager →](../setup/index.md)
