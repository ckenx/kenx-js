# Command Line Interface (CLI)

The Kenx CLI (`ckenx`) provides tools for creating, building, and managing Kenx applications.

## Installation

```bash
npm install -g ckenx
```

Verify installation:

```bash
ckenx -v
```

## Commands

### `create`

Create a new Kenx project from a template.

#### Syntax

```bash
ckenx create <directory> [options]
```

#### Arguments

- `<directory>` - Name of the directory to create (required)

#### Options

- `--node` - Create a Node.js project
- `--deno` - Create a Deno project
- `--bun` - Create a Bun project

#### Examples

```bash
# Create project with interactive prompts
ckenx create my-app

# Create Node.js project
ckenx create my-app --node

# Create Deno project
ckenx create my-deno-app --deno

# Create Bun project
ckenx create my-bun-app --bun
```

#### What It Does

1. Prompts for project configuration (if no runtime specified)
2. Creates project directory structure
3. Copies template files
4. Initializes git repository
5. Installs dependencies
6. Creates configuration files

**Output Structure:**

```
my-app/
├── .config/
│   ├── index.yml
│   ├── servers.yml
│   ├── databases.yml
│   └── security.yml
├── src/
│   └── index.ts
├── public/
├── .env
├── .env.local
├── package.json
├── tsconfig.json
└── autorun
```

---

### `run`

Run the Kenx application in development or production mode.

#### Syntax

```bash
ckenx run [options]
```

#### Options

- `--prod` - Run in production mode (default: development)
- `--dev` - Run in development mode (explicit)

#### Examples

```bash
# Development mode (default)
ckenx run

# Development mode (explicit)
ckenx run --dev

# Production mode
ckenx run --prod
```

#### Development Mode

- Loads `.env.local` environment variables
- Auto-installs missing plugins
- Compiles TypeScript on-the-fly
- Enables debug logging

#### Production Mode

- Loads `.env` environment variables
- Uses pre-built assets from `dist/`
- No auto-installation
- Optimized for performance

---

### `build`

Build the application for production deployment.

#### Syntax

```bash
ckenx build
```

#### What It Does

1. Cleans the `dist/` directory
2. Compiles TypeScript to JavaScript
3. Resolves TypeScript path aliases
4. Runs configured build tools (Vite, Webpack, etc.)
5. Generates production-ready assets

#### Output

```
dist/
├── index.js
├── setup.js
├── lib/
└── types/
```

#### Usage Pattern

```bash
# Build for production
ckenx build

# Run production build
ckenx run --prod
```

---

### `install`

Install a Kenx plugin and add it to project dependencies.

#### Syntax

```bash
ckenx install <plugin>
```

#### Arguments

- `<plugin>` - Name of the plugin to install (required)

#### Examples

```bash
# Install Express plugin
ckenx install @ckenx/kenx-express

# Install MySQL plugin
ckenx install @ckenx/kenx-mysql

# Install Socket.io plugin
ckenx install @ckenx/kenx-socketio
```

#### What It Does

1. Validates plugin name
2. Installs via npm/yarn
3. Updates `package.json`
4. Updates plugin dependencies

---

### `uninstall`

Remove a Kenx plugin from project dependencies.

#### Syntax

```bash
ckenx uninstall <plugin>
```

#### Arguments

- `<plugin>` - Name of the plugin to uninstall (required)

#### Examples

```bash
# Uninstall Express plugin
ckenx uninstall @ckenx/kenx-express

# Uninstall MySQL plugin
ckenx uninstall @ckenx/kenx-mysql
```

---

### Help & Version

#### Display Help

```bash
ckenx -h
ckenx --help
```

Shows available commands and options.

#### Display Version

```bash
ckenx -v
ckenx --version
```

Shows CLI version number.

---

## Development Scripts

### `autorun`

Most projects include an `autorun` script for quick development startup:

```bash
./autorun
```

This script typically:
1. Loads environment variables
2. Compiles TypeScript
3. Starts the application
4. Watches for changes

**Example `autorun` script:**

```bash
#!/bin/bash
NODE_ENV=development node -r @ckenx/node
```

Make it executable:

```bash
chmod +x autorun
```

---

## Common Workflows

### Starting a New Project

```bash
# Create project
ckenx create my-app --node

# Navigate to project
cd my-app

# Install dependencies
npm install

# Run development server
./autorun
```

### Development Workflow

```bash
# Run in development mode
ckenx run

# Or use the autorun script
./autorun
```

### Production Deployment

```bash
# Build the application
ckenx build

# Test production build locally
ckenx run --prod

# Deploy dist/ directory to server
```

### Adding Plugins

```bash
# Install plugin
ckenx install @ckenx/kenx-mysql

# Configure in .config/databases.yml
# servers:
#   - type: mysql
#     plugin: '@ckenx/kenx-mysql'

# Restart application
./autorun
```

---

## Environment Variables

The CLI respects these environment variables:

### `NODE_ENV`

- `development` - Development mode (default)
- `production` - Production mode

```bash
NODE_ENV=production ckenx run
```

### `HTTP_HOST`

Override default HTTP host:

```bash
HTTP_HOST=127.0.0.1 ckenx run
```

### `HTTP_PORT`

Override default HTTP port:

```bash
HTTP_PORT=3000 ckenx run
```

---

## Advanced Usage

### Custom TypeScript Configuration

Kenx uses your project's `tsconfig.json` if present:

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
      "#services/*": ["src/services/*"]
    }
  }
}
```

### Custom Build Configuration

Configure build tools in `.config/index.yml`:

```yaml
servers:
  - type: vite
    plugin: '@ckenx/kenx-vite'
    build: true
    options:
      root: './src/client'
      outDir: './public/dist'
```

---

## Troubleshooting

### Command Not Found

If `ckenx` is not recognized:

```bash
# Reinstall globally
npm install -g ckenx

# Or use npx
npx ckenx create my-app
```

### Permission Denied

If you get permission errors on Unix systems:

```bash
# Make autorun executable
chmod +x autorun

# Or run with node directly
node -r @ckenx/node
```

### Port Already in Use

Change the port in `.env.local`:

```bash
HTTP_PORT=8001
```

### TypeScript Compilation Errors

Ensure TypeScript is installed:

```bash
npm install --save-dev typescript
```

Check your `tsconfig.json` configuration.

---

## Next Steps

- **[Creating Applications](./create.md)** - Deep dive into project creation
- **[Architecture](./architecture.md)** - Understand CLI internals
- **[Configuration](../configuration/index.md)** - Configure your project

---

**Previous:** [← Architecture](./architecture.md) | **Next:** [Create Applications →](./create.md)
