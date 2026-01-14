#!/bin/bash

# Script to create a new Kenx plugin with tests and configuration
# Usage: ./scripts/create-plugin.sh <plugin-name>

set -e

PLUGIN_NAME=$1

if [ -z "$PLUGIN_NAME" ]; then
  echo "Usage: ./scripts/create-plugin.sh <plugin-name>"
  echo "Example: ./scripts/create-plugin.sh kenx-redis"
  exit 1
fi

PLUGIN_DIR="packages/plugins/$PLUGIN_NAME"

if [ -d "$PLUGIN_DIR" ]; then
  echo "Error: Plugin $PLUGIN_NAME already exists"
  exit 1
fi

echo "Creating plugin: $PLUGIN_NAME"

# Create directory structure
mkdir -p "$PLUGIN_DIR/src"

# Create package.json
cat > "$PLUGIN_DIR/package.json" << EOF
{
  "name": "@ckenx/$PLUGIN_NAME",
  "version": "0.0.1",
  "description": "Kenx $PLUGIN_NAME plugin",
  "main": "dist/index.js",
  "scripts": {
    "compile": "rimraf ./dist && tsc",
    "test": "vitest run",
    "test:watch": "vitest watch",
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix",
    "clean": "rimraf dist",
    "prepack": "yarn compile"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com:ckenx/kenx-js.git",
    "directory": "packages/plugins/$PLUGIN_NAME"
  },
  "publishConfig": {
    "access": "public"
  },
  "keywords": [
    "kenx",
    "plugin",
    "node",
    "deno",
    "bun"
  ],
  "author": "Fabrice Marlboro <fabrice.xyclone@gmail.com>",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/ckenx/kenx-js/issues"
  },
  "homepage": "https://github.com/ckenx/kenx-js#README",
  "devDependencies": {
    "@ckenx/node": "*",
    "rimraf": "^5.0.5",
    "typescript": "^5.3.2",
    "vitest": "^1.2.0"
  },
  "peerDependencies": {
    "@ckenx/node": "*"
  }
}
EOF

# Create tsconfig.json
cat > "$PLUGIN_DIR/tsconfig.json" << EOF
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "allowJs": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "declaration": true,
    "types": ["vitest", "vitest/globals"]
  },
  "exclude": ["vitest.config.ts", "**/*.test.ts", "**/*.spec.ts", "dist", "node_modules"]
}
EOF

# Create vitest.config.ts
cat > "$PLUGIN_DIR/vitest.config.ts" << EOF
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: '@ckenx/$PLUGIN_NAME',
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'dist/**']
    }
  }
})
EOF

# Create initial source file
cat > "$PLUGIN_DIR/src/index.ts" << EOF
import type { ServerPlugin, SetupManager } from '@ckenx/node'

export default class ${PLUGIN_NAME^}Plugin implements ServerPlugin<any> {
  private readonly Setup: SetupManager
  private readonly config: any

  constructor(Setup: SetupManager, config: any) {
    this.Setup = Setup
    this.config = config
  }

  async listen(arg: any): Promise<any> {
    // Implementation
    return null
  }

  async close(): Promise<unknown> {
    // Implementation
    return null
  }

  getInfo(): any {
    return {
      type: '$PLUGIN_NAME'
    }
  }
}
EOF

# Create initial test file
cat > "$PLUGIN_DIR/src/index.test.ts" << EOF
import { describe, it, expect } from 'vitest'
import Plugin from './index'

describe('@ckenx/$PLUGIN_NAME', () => {
  it('should export plugin class', () => {
    expect(Plugin).toBeDefined()
    expect(Plugin.name).toBe('${PLUGIN_NAME^}Plugin')
  })

  it('should create plugin instance', () => {
    const mockSetup = {} as any
    const mockConfig = {}
    const plugin = new Plugin(mockSetup, mockConfig)
    expect(plugin).toBeInstanceOf(Plugin)
  })

  it('should have required methods', () => {
    const mockSetup = {} as any
    const mockConfig = {}
    const plugin = new Plugin(mockSetup, mockConfig)
    
    expect(typeof plugin.listen).toBe('function')
    expect(typeof plugin.close).toBe('function')
    expect(typeof plugin.getInfo).toBe('function')
  })
})
EOF

# Create README.md
cat > "$PLUGIN_DIR/README.md" << EOF
# @ckenx/$PLUGIN_NAME

$PLUGIN_NAME plugin for Kenx framework.

## Installation

\`\`\`bash
npm install @ckenx/$PLUGIN_NAME
\`\`\`

## Usage

\`\`\`yaml
# .config/servers.yml
servers:
  - type: custom
    key: my-service
    plugin: '@ckenx/$PLUGIN_NAME'
    PORT: 3000
    options:
      # Plugin configuration
\`\`\`

## License

MIT
EOF

echo "✅ Plugin created successfully at $PLUGIN_DIR"
echo ""
echo "Next steps:"
echo "  1. cd $PLUGIN_DIR"
echo "  2. Implement your plugin logic in src/index.ts"
echo "  3. Add tests in src/index.test.ts"
echo "  4. Run: yarn test"
echo "  5. Run: yarn compile"
echo "  6. Create changeset: yarn changeset"
