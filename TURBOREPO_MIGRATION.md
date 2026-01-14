# Turborepo Migration Guide

## Overview

This guide walks you through migrating from Lerna to Turborepo with automated versioning via Changesets and comprehensive test infrastructure with Vitest.

## Prerequisites

- Node.js 20+
- Yarn 1.22+
- npm account with access to `@ckenx` scope

## Migration Steps

### Step 1: Install Dependencies

```bash
# Add Turborepo
yarn add -D -W turbo

# Add Changesets for versioning
yarn add -D -W @changesets/cli @changesets/changelog-github

# Add Vitest for testing
yarn add -D -W vitest @vitest/coverage-v8

# Add to each plugin package
yarn workspace @ckenx/kenx-vite add -D vitest

# Initialize changesets
yarn changeset init
```

### Step 2: Update Root Package.json

Replace Lerna scripts with Turborepo + Changesets:

```json
{
  "scripts": {
    "build": "turbo run compile",
    "dev": "turbo run compile --watch",
    "test": "turbo run test",
    "test:plugin": "turbo run test --filter=",
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint:fix",
    "clean": "turbo run clean && rm -rf node_modules/.cache/turbo",
    
    "changeset": "changeset",
    "version": "changeset version",
    "release": "turbo run compile && changeset publish",
    
    "test:unit": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage"
  }
}
```

### Step 3: Add Test Scripts to Each Plugin

For each plugin in `packages/plugins/kenx-*`, update `package.json`:

```json
{
  "scripts": {
    "compile": "rimraf ./dist && tsc",
    "test": "vitest run",
    "test:watch": "vitest watch",
    "clean": "rimraf dist",
    "prepack": "yarn compile"
  },
  "devDependencies": {
    "vitest": "^1.2.0"
  }
}
```

### Step 4: Create Vitest Config for Each Plugin

Copy `packages/plugins/kenx-vite/vitest.config.ts` to other plugins and adjust the name.

### Step 5: Remove Lerna (Optional)

```bash
# Remove lerna
yarn remove -W lerna

# Delete lerna.json
rm lerna.json

# Keep yarn workspaces in package.json
```

## Automated Workflows

### 1. Version Bump & Publishing

**Developer workflow:**

```bash
# After making changes, create a changeset
yarn changeset

# Select packages to version
# Choose version bump type (major/minor/patch)
# Write changelog description

# Commit the changeset
git add .changeset/*.md
git commit -m "chore: add changeset for feature X"

# Push to GitHub
git push
```

**Automated process:**
- GitHub Action detects changeset files
- Creates/updates a "Version Packages" PR
- When merged, automatically publishes to npm

### 2. Running Tests

```bash
# Test all packages in parallel
yarn test

# Test specific plugin
yarn test:plugin --filter=@ckenx/kenx-vite

# Watch mode for development
yarn test:watch

# Generate coverage report
yarn test:coverage

# Test specific plugin in watch mode
yarn workspace @ckenx/kenx-vite test:watch
```

### 3. Turborepo Benefits

**Caching:**
```bash
# First run (slower)
yarn build

# Second run (instant - uses cache)
yarn build

# Clear cache if needed
yarn clean
```

**Parallel execution:**
```bash
# Runs all compilations in parallel
# Respects dependency graph
yarn build
```

**Filtered execution:**
```bash
# Only build changed packages
turbo run compile --filter=[HEAD^1]

# Build specific package and dependencies
turbo run compile --filter=@ckenx/kenx-vite...
```

## Creating New Plugin with Tests

```bash
# 1. Create plugin structure
mkdir -p packages/plugins/kenx-newplugin/src

# 2. Create package.json
cat > packages/plugins/kenx-newplugin/package.json << 'EOF'
{
  "name": "@ckenx/kenx-newplugin",
  "version": "0.0.1",
  "main": "dist/index.js",
  "scripts": {
    "compile": "rimraf ./dist && tsc",
    "test": "vitest run",
    "test:watch": "vitest watch",
    "clean": "rimraf dist"
  },
  "devDependencies": {
    "@ckenx/node": "*",
    "vitest": "^1.2.0",
    "typescript": "^5.3.2"
  }
}
EOF

# 3. Copy vitest.config.ts and tsconfig.json from another plugin
cp packages/plugins/kenx-vite/vitest.config.ts packages/plugins/kenx-newplugin/
cp packages/plugins/kenx-vite/tsconfig.json packages/plugins/kenx-newplugin/

# 4. Create initial test
cat > packages/plugins/kenx-newplugin/src/index.test.ts << 'EOF'
import { describe, it, expect } from 'vitest'
import Plugin from './index'

describe('@ckenx/kenx-newplugin', () => {
  it('should export plugin', () => {
    expect(Plugin).toBeDefined()
  })
})
EOF

# 5. Install dependencies
yarn install

# 6. Run tests
yarn workspace @ckenx/kenx-newplugin test
```

## Migration Checklist

- [ ] Install Turborepo, Changesets, and Vitest
- [ ] Copy `turbo.json` configuration
- [ ] Copy `.changeset/config.json`
- [ ] Copy GitHub workflows (ci.yml, release.yml)
- [ ] Update root package.json scripts
- [ ] Add vitest.config.ts to all plugins
- [ ] Add test scripts to all plugin package.json files
- [ ] Create initial tests for each plugin
- [ ] Test the build: `yarn build`
- [ ] Test the tests: `yarn test`
- [ ] Create first changeset: `yarn changeset`
- [ ] Set NPM_TOKEN secret in GitHub repository settings
- [ ] Remove lerna (optional)
- [ ] Update documentation

## NPM Token Setup

1. Generate token at https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Add to GitHub repo: Settings > Secrets > Actions > New secret
3. Name: `NPM_TOKEN`
4. Value: Your npm token

## Troubleshooting

**Issue: Build cache not working**
```bash
# Clear Turborepo cache
rm -rf node_modules/.cache/turbo
```

**Issue: Tests failing with module not found**
```bash
# Rebuild packages first
yarn build
yarn test
```

**Issue: Changeset not detecting changes**
```bash
# Manually specify packages
yarn changeset
# Then select packages manually
```

## Performance Comparison

**Before (Lerna):**
- Full build: ~45-60 seconds
- Incremental build: ~30-45 seconds
- No caching between CI runs

**After (Turborepo):**
- Full build (cold): ~30-40 seconds
- Incremental build: ~5-10 seconds (cached: instant)
- Remote caching in CI (optional): ~70% faster CI

## Next Steps

1. Complete migration following checklist
2. Run `yarn build` to verify everything compiles
3. Create first changeset for "Migration to Turborepo"
4. Set up npm token in GitHub
5. Test the release workflow on a test branch
6. Document plugin-specific test requirements
