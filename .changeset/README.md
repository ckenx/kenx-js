# Changesets

This directory contains changeset files. When you make changes to packages, run:

```bash
yarn changeset
```

This will guide you through:
1. Selecting which packages changed
2. Choosing the version bump type (major/minor/patch)
3. Writing a changelog entry

## Workflow

1. **Make changes** to one or more packages
2. **Create changeset**: `yarn changeset`
3. **Commit changeset**: `git add .changeset/*.md && git commit`
4. **Push to GitHub**: `git push`
5. **GitHub Action** will create a "Version Packages" PR
6. **Merge PR** to automatically publish to npm

## Changeset Types

- **Major** (breaking): User code needs changes
- **Minor** (feature): New functionality, backward compatible
- **Patch** (fix): Bug fixes, backward compatible

## Examples

**Adding a new feature:**
```bash
yarn changeset
# Select: @ckenx/kenx-vite (minor)
# Message: "Add SSR support for React components"
```

**Fixing a bug:**
```bash
yarn changeset
# Select: @ckenx/kenx-express (patch)
# Message: "Fix CORS middleware configuration"
```

**Breaking change:**
```bash
yarn changeset
# Select: @ckenx/node (major)
# Message: "Remove deprecated ServerPlugin.start() method"
```
