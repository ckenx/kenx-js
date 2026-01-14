# @ckenx/kenx-vite

Vite development server and build tool plugin for Kenx.

## Features

- **Development Server** - Hot Module Replacement (HMR) with Vite
- **Middleware Mode** - Attach to Express/Fastify applications
- **SSR Support** - Optional server-side rendering
- **Production Builds** - Optimized builds with code splitting
- **Config-Driven** - Full Vite configuration via YAML

## Installation

```bash
npm install @ckenx/kenx-vite
```

## Usage

### Standalone Mode

```yaml
# .config/servers.yml
servers:
  - type: vite
    key: frontend
    plugin: '@ckenx/kenx-vite'
    PORT: 5173
    options:
      root: './src/client'
      base: '/'
```

### Middleware Mode (with Express/Fastify)

```yaml
servers:
  - type: http
    key: api
    plugin: '@ckenx/kenx-express'
    PORT: 8000
  
  - type: vite
    key: frontend
    plugin: '@ckenx/kenx-vite'
    bindTo: http:api
    options:
      root: './src/client'
      base: '/static/'
```

### With SSR Support

```yaml
servers:
  - type: vite
    plugin: '@ckenx/kenx-vite'
    bindTo: http:api
    options:
      root: './src/client'
    ssr:
      enabled: true
      entry: './src/client/entry-server'
      template: './src/client/index.html'
```

### With Vite Plugins (Config-Driven)

You can define Vite plugins directly in YAML:

```yaml
servers:
  - type: vite
    plugin: '@ckenx/kenx-vite'
    options:
      root: './src/client'
      plugins:
        # Legacy browser support
        - imports:
            legacy: '@vitejs/plugin-legacy'
          script: |
            legacy({
              targets: ['defaults', 'not IE 11']
            })
        
        # Enforce plugin order
        - imports:
            image: '@rollup/plugin-image'
          script: |
            {
              ...image(),
              enforce: 'pre'
            }
        
        # Conditional application
        - imports:
            typescript2: 'rollup-plugin-typescript2'
          script: |
            {
              ...typescript2(),
              apply: 'build'
            }
```

**Plugin Definition Fields:**
- `imports` - Map of variable names to npm packages
- `script` - JavaScript code that returns the plugin instance
- `enforce` - (Optional) `'pre'` or `'post'` - Plugin execution order
- `apply` - (Optional) `'build'` or `'serve'` - When to apply plugin

## Configuration

| Option | Type | Description |
|--------|------|-------------|
| `HOST` | string | Server host (default: 0.0.0.0) |
| `PORT` | number | Server port (default: 5173) |
| `bindTo` | string | Bind to existing HTTP server |
| `options` | UserConfig | Vite configuration options |
| `ssr.enabled` | boolean | Enable SSR support |
| `ssr.entry` | string | SSR entry file path |
| `ssr.template` | string | HTML template path |

## License

MIT