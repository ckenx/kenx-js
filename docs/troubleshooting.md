# Troubleshooting

Common issues and solutions when working with Kenx applications.

## Overview

This guide covers:
- Installation and setup issues
- Configuration problems
- Plugin-related errors
- TypeScript compilation issues
- Runtime errors
- Database connection problems
- Performance issues

---

## Installation Issues

### Node.js Version Mismatch

**Error:**
```
The engine "node" is incompatible with this module
```

**Solution:**
```bash
# Check your Node.js version
node --version

# Update to Node.js 16 or higher
nvm install 18
nvm use 18

# Or download from nodejs.org
```

### Package Installation Failures

**Error:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall with legacy peer deps
npm install --legacy-peer-deps

# Or use force flag
npm install --force
```

### Permission Errors (Unix/Mac)

**Error:**
```
EACCES: permission denied
```

**Solution:**
```bash
# Don't use sudo with npm
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Then reinstall packages
npm install
```

---

## Configuration Issues

### Configuration File Not Found

**Error:**
```
Setup configuration not found
```

**Solution:**
1. Ensure `.config/index.yml` exists
2. Check file name is exactly `index.yml` (not `index.yaml`)
3. Verify working directory

```bash
# Check current directory
pwd

# List config files
ls -la .config/

# Create if missing
mkdir -p .config
touch .config/index.yml
```

### YAML Syntax Errors

**Error:**
```
YAMLException: bad indentation
```

**Solution:**
```yaml
# Bad - mixed tabs and spaces
servers:
	- type: http  # tab used
  key: api      # spaces used

# Good - consistent spaces (2 or 4)
servers:
  - type: http
    key: api
```

**Validate YAML:**
```bash
# Install yamllint
npm install -g yaml-lint

# Validate file
yamllint .config/index.yml
```

### Environment Variable Not Resolved

**Error:**
```
Reference [env]:DB_HOST not resolved
```

**Solution:**

1. **Check .env file exists:**
```bash
ls -la .env.local .env
```

2. **Verify variable is defined:**
```bash
# .env.local
DB_HOST=localhost
DB_NAME=myapp
```

3. **Check dotenv is loaded:**
```typescript
// Ensure dotenv is loaded before importing Kenx
import 'dotenv/config'
import Core from '@ckenx/node'
```

4. **Verify reference syntax:**
```yaml
# Correct
HOST: [env]:DB_HOST

# Wrong
HOST: [env]DB_HOST
HOST: ${DB_HOST}
```

### Configuration Reference Not Found

**Error:**
```
Reference [servers]:api not found
```

**Solution:**

1. **Verify resource exists:**
```yaml
servers:
  - type: http
    key: api  # Must match reference key
```

2. **Check __extends__ order:**
```yaml
# servers.yml must be loaded before it's referenced
__extends__:
  - servers  # Load first
  - databases
```

---

## Plugin Issues

### Plugin Not Found

**Error:**
```
<@ckenx/kenx-express> plugin not found
```

**Solution:**

1. **Install the plugin:**
```bash
# Via npm
npm install @ckenx/kenx-express

# Via Kenx CLI
ckenx install @ckenx/kenx-express
```

2. **Check package.json:**
```json
{
  "dependencies": {
    "@ckenx/kenx-express": "^0.0.16"
  }
}
```

3. **Verify node_modules:**
```bash
ls node_modules/@ckenx/
```

4. **Clear and reinstall:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Plugin Auto-Installation Failed

**Error:**
```
Failed to auto-install plugin @ckenx/kenx-mysql
```

**Solution:**

1. **Check npm registry access:**
```bash
npm ping
```

2. **Install manually:**
```bash
npm install @ckenx/kenx-mysql
```

3. **Check network/proxy settings:**
```bash
npm config get proxy
npm config get https-proxy
```

4. **Disable auto-install (production):**
```yaml
# Set NODE_ENV to disable auto-install
NODE_ENV=production
```

### Plugin Version Conflict

**Error:**
```
Conflicting versions of @ckenx/kenx-express
```

**Solution:**

1. **Check installed versions:**
```bash
npm ls @ckenx/kenx-express
```

2. **Dedupe dependencies:**
```bash
npm dedupe
```

3. **Force specific version:**
```json
{
  "dependencies": {
    "@ckenx/kenx-express": "0.0.16"
  }
}
```

---

## TypeScript Issues

### Compilation Errors

**Error:**
```
Cannot find module '@ckenx/node/types'
```

**Solution:**

1. **Install type definitions:**
```bash
npm install --save-dev @types/node
```

2. **Check tsconfig.json:**
```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "types": ["node"]
  }
}
```

### Path Alias Not Resolved

**Error:**
```
Cannot find module '@/services/user-service'
```

**Solution:**

1. **Configure path aliases in tsconfig.json:**
```json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"],
      "@services/*": ["./services/*"],
      "@models/*": ["./models/*"]
    }
  }
}
```

2. **Install tsc-alias:**
```bash
npm install --save-dev tsc-alias
```

3. **Build with alias resolution:**
```bash
tsc && tsc-alias
```

### Module Import Errors

**Error:**
```
SyntaxError: Cannot use import statement outside a module
```

**Solution:**

1. **Use ES modules in package.json:**
```json
{
  "type": "module"
}
```

Or use CommonJS:
```json
{
  "type": "commonjs"
}
```

2. **Match tsconfig.json:**
```json
{
  "compilerOptions": {
    "module": "commonjs",  // or "ES2020"
    "target": "ES2020"
  }
}
```

---

## Runtime Errors

### Port Already in Use

**Error:**
```
EADDRINUSE: address already in use :::8000
```

**Solution:**

1. **Find and kill process:**
```bash
# On Mac/Linux
lsof -ti:8000 | xargs kill -9

# On Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

2. **Change port:**
```bash
# .env.local
HTTP_PORT=8001
```

3. **Use dynamic port:**
```yaml
servers:
  - PORT: 0  # Auto-assign available port
```

### Resource Not Found in Takeover

**Error:**
```
Resource not found for takeover: http:api
```

**Solution:**

1. **Check resource key matches:**
```yaml
servers:
  - type: http
    key: api  # Must match takeover
```

```typescript
export const takeover = ['http:api']  // Must match config
```

2. **Verify resource type:**
```typescript
// Correct
export const takeover = ['http:api']

// Wrong type
export const takeover = ['server:api']
```

3. **Check configuration loaded:**
```typescript
import Core from '@ckenx/node'

console.log(Core.RESOURCES) // Inspect loaded resources
```

### Application Not Starting

**Error:**
```
Application hangs or doesn't start
```

**Solution:**

1. **Check for syntax errors:**
```bash
tsc --noEmit
```

2. **Enable debug logging:**
```bash
DEBUG=kenx:* node -r @ckenx/node
```

3. **Check for missing await:**
```typescript
// Bad - missing await
export default async (server) => {
  server.listen()  // Not awaited!
}

// Good
export default async (server) => {
  await server.listen()
}
```

4. **Check for unhandled promises:**
```typescript
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason)
})
```

---

## Database Issues

### Connection Failed

**Error:**
```
ER_ACCESS_DENIED_ERROR: Access denied for user
```

**Solution:**

1. **Verify credentials:**
```bash
# Test connection manually
mysql -h localhost -u myuser -p myapp
```

2. **Check environment variables:**
```bash
# .env.local
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=myapp
```

3. **Grant permissions (MySQL):**
```sql
GRANT ALL PRIVILEGES ON myapp.* TO 'myuser'@'localhost';
FLUSH PRIVILEGES;
```

### Connection Timeout

**Error:**
```
ETIMEDOUT: Connection timeout
```

**Solution:**

1. **Check database is running:**
```bash
# MySQL
systemctl status mysql

# Check if listening
netstat -an | grep 3306
```

2. **Increase timeout:**
```yaml
databases:
  - type: mysql
    options:
      connectTimeout: 30000  # 30 seconds
```

3. **Check firewall:**
```bash
# Allow MySQL port
sudo ufw allow 3306
```

### Too Many Connections

**Error:**
```
ER_TOO_MANY_CONNECTIONS
```

**Solution:**

1. **Configure connection pool:**
```yaml
databases:
  - type: mysql
    options:
      connectionLimit: 10
      queueLimit: 0
```

2. **Increase MySQL max_connections:**
```sql
SET GLOBAL max_connections = 200;
```

3. **Close connections properly:**
```typescript
// Always close after use
try {
  const result = await db.query(...)
} finally {
  await db.close()  // If not pooled
}
```

---

## Performance Issues

### Slow Response Times

**Symptoms:**
- API endpoints taking too long
- Database queries slow
- High memory usage

**Solutions:**

1. **Enable query logging:**
```typescript
const [rows] = await db.query({
  sql: 'SELECT * FROM users',
  timeout: 5000
})
console.time('query')
// ... query
console.timeEnd('query')
```

2. **Add database indexes:**
```sql
CREATE INDEX idx_email ON users(email);
EXPLAIN SELECT * FROM users WHERE email = ?;
```

3. **Use connection pooling:**
```yaml
databases:
  - options:
      connectionLimit: 10
```

4. **Enable caching:**
```typescript
import Redis from 'ioredis'
const redis = new Redis()

// Cache results
const cached = await redis.get(key)
if (cached) return JSON.parse(cached)
```

5. **Profile with Node.js profiler:**
```bash
node --prof -r @ckenx/node
node --prof-process isolate-*-v8.log
```

### Memory Leaks

**Symptoms:**
- Increasing memory usage over time
- Application crashes with OOM

**Solutions:**

1. **Monitor memory:**
```typescript
setInterval(() => {
  const usage = process.memoryUsage()
  console.log('Memory:', usage.heapUsed / 1024 / 1024, 'MB')
}, 10000)
```

2. **Use heap snapshot:**
```bash
node --inspect -r @ckenx/node
# Open chrome://inspect
# Take heap snapshots
```

3. **Check for unclosed connections:**
```typescript
// Close database connections
await db.close()

// Clear timers
clearInterval(timer)
```

4. **Limit PM2 memory:**
```javascript
{
  max_memory_restart: '500M'
}
```

---

## Development Issues

### Hot Reload Not Working

**Error:**
Application doesn't restart on file changes

**Solution:**

1. **Use nodemon:**
```bash
npm install --save-dev nodemon
```

```json
{
  "scripts": {
    "dev": "nodemon --exec 'node -r @ckenx/node'"
  }
}
```

**nodemon.json:**
```json
{
  "watch": ["src", ".config"],
  "ext": "ts,js,yml",
  "ignore": ["dist", "test"],
  "exec": "node -r @ckenx/node"
}
```

2. **Check file permissions:**
```bash
ls -la src/
```

### Build Errors

**Error:**
```
Build failed with errors
```

**Solution:**

1. **Clean build:**
```bash
rm -rf dist/
npm run build
```

2. **Check TypeScript errors:**
```bash
tsc --noEmit
```

3. **Verify tsconfig.json:**
```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

---

## Testing Issues

### Tests Failing

**Error:**
Tests that worked before now fail

**Solution:**

1. **Clear Jest cache:**
```bash
npx jest --clearCache
```

2. **Check test isolation:**
```typescript
beforeEach(() => {
  // Reset state
})

afterEach(() => {
  // Cleanup
})
```

3. **Fix async issues:**
```typescript
// Bad
it('should work', () => {
  someAsyncFunction()
  expect(result).toBe(true)
})

// Good
it('should work', async () => {
  await someAsyncFunction()
  expect(result).toBe(true)
})
```

### Database Tests Failing

**Error:**
```
Connection refused during tests
```

**Solution:**

1. **Use test database:**
```bash
# .env.test
TEST_DB_NAME=myapp_test
```

2. **Setup test database:**
```typescript
beforeAll(async () => {
  await setupTestDatabase()
})

afterAll(async () => {
  await cleanupTestDatabase()
})
```

3. **Mock database in unit tests:**
```typescript
jest.mock('../database')
```

---

## Debugging Tips

### Enable Debug Mode

```bash
# Enable all Kenx debug logs
DEBUG=kenx:* node -r @ckenx/node

# Enable specific module
DEBUG=kenx:setup node -r @ckenx/node

# Multiple modules
DEBUG=kenx:setup,kenx:core node -r @ckenx/node
```

### Use Node.js Inspector

```bash
# Start with inspector
node --inspect -r @ckenx/node

# Open chrome://inspect in Chrome
# Set breakpoints and debug
```

### Add Strategic Logging

```typescript
export const takeover = ['http', 'database']

export default async (server, db) => {
  console.log('Resources loaded:', { server, db })
  
  // Add logging to track flow
  server.app.router('/test', (req, res) => {
    console.log('Route hit:', req.path)
    res.json({ ok: true })
  })
  
  await server.listen()
  console.log('Server listening')
}
```

---

## Getting Help

### Before Asking for Help

1. **Check this troubleshooting guide**
2. **Search existing issues:** [GitHub Issues](https://github.com/ckenx/kenx-js/issues)
3. **Enable debug mode** and check logs
4. **Create minimal reproduction** of the issue
5. **Check your versions:**
   ```bash
   node --version
   npm --version
   npm list @ckenx/node
   ```

### Reporting Issues

Include this information:

1. **Environment:**
   - Node.js version
   - OS and version
   - Kenx version

2. **Configuration:**
   - `.config/index.yml` (sanitized)
   - Relevant environment variables

3. **Error message:**
   - Full error stack trace
   - Debug logs

4. **Reproduction:**
   - Minimal code to reproduce
   - Steps to reproduce

### Community Resources

- **GitHub Discussions:** [kenx-js/discussions](https://github.com/ckenx/kenx-js/discussions)
- **Discord:** (if available)
- **Stack Overflow:** Tag with `kenx-js`

---

## Quick Reference

### Common Commands

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Check TypeScript
tsc --noEmit

# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json

# Debug mode
DEBUG=kenx:* npm run dev
```

### Common File Locations

```
.config/index.yml       # Main configuration
.env.local              # Development environment
src/index.ts            # Application entry
dist/                   # Compiled output
node_modules/@ckenx/    # Kenx packages
```

---

**Previous:** [← Best Practices](./best-practices.md) | **Next:** [FAQ →](./faq.md)
