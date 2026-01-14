# Best Practices

Recommended patterns, conventions, and practices for building robust Kenx applications.

## Overview

This guide covers:
- Project structure and organization
- Configuration management
- Code quality and maintainability
- Security best practices
- Performance optimization
- Error handling
- Testing strategies
- Development workflow

---

## Project Structure

### Recommended Directory Layout

**Singleton Pattern:**
```
myapp/
├── .config/              # Configuration files
│   ├── index.yml
│   ├── servers.yml
│   ├── databases.yml
│   └── security.yml
├── src/
│   ├── index.ts         # Main entry point
│   ├── routes/          # Route handlers
│   ├── services/        # Business logic
│   ├── models/          # Data models
│   ├── utils/           # Helper functions
│   ├── middleware/      # Custom middleware
│   └── types/           # TypeScript types
├── test/                # Test files
├── public/              # Static assets
├── .env.local           # Development environment
├── .env.production      # Production environment (not in git)
├── package.json
└── tsconfig.json
```

**MVC Pattern:**
```
myapp/
├── .config/
├── src/
│   ├── models/
│   │   └── index.ts     # Model layer
│   ├── views/
│   │   └── index.ts     # View layer
│   ├── controllers/
│   │   └── index.ts     # Controller layer
│   ├── services/        # Business logic
│   ├── middleware/
│   └── utils/
├── test/
├── public/
└── package.json
```

### File Naming Conventions

- **Use kebab-case** for file names: `user-service.ts`, `auth-middleware.ts`
- **Use PascalCase** for class files: `UserService.ts`, `AuthController.ts`
- **Use camelCase** for utility files: `validateEmail.ts`, `formatDate.ts`
- **Test files**: `*.test.ts` or `*.spec.ts`

---

## Configuration Management

### Organize Configuration Files

Split configuration logically:

**.config/index.yml:**
```yaml
typescript: true
directory:
  base: './src'
  pattern: '-'
autowire: true

__extends__:
  - servers
  - databases
  - security
```

**.config/servers.yml:**
```yaml
servers:
  - type: http
    key: api
    plugin: '@ckenx/kenx-express'
    HOST: [env]:HTTP_HOST
    PORT: [env]:HTTP_PORT
```

**.config/databases.yml:**
```yaml
databases:
  - type: mysql
    key: default
    plugin: '@ckenx/kenx-mysql'
    autoconnect: true
    options:
      host: [env]:DB_HOST
      database: [env]:DB_NAME
```

### Environment Variables Best Practices

1. **Never commit secrets** - Use `.gitignore` for `.env.*`
2. **Use environment references** - `[env]:VAR_NAME` in config
3. **Provide defaults** - Handle missing variables gracefully
4. **Document variables** - Create `.env.example`

**.env.example:**
```bash
# Server Configuration
HTTP_HOST=localhost
HTTP_PORT=8000

# Database Configuration
DB_HOST=localhost
DB_NAME=myapp_dev
DB_USER=root
DB_PASSWORD=

# Session
SESSION_SECRET=change_this_in_production
```

---

## Code Quality

### TypeScript Usage

**Enable strict mode:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**Define proper types:**
```typescript
// Good
interface User {
  id: number
  name: string
  email: string
  createdAt: Date
}

async function getUser(id: number): Promise<User | null> {
  // Implementation
}

// Bad
async function getUser(id: any): Promise<any> {
  // Implementation
}
```

### Resource Takeover Patterns

**Use specific types:**
```typescript
import type { ServerPlugin, DatabasePlugin } from '@ckenx/node/types'

export const takeover = ['http:api', 'database:default']

export default async (
  server: ServerPlugin,
  db: DatabasePlugin
) => {
  // Type-safe resource usage
}
```

**Be explicit with keys:**
```typescript
// Good - clear what resource you need
export const takeover = ['http:api', 'database:primary']

// Bad - ambiguous
export const takeover = ['http', 'database']
```

### Service Layer Pattern

Encapsulate business logic in services:

```typescript
// src/services/user-service.ts
export class UserService {
  constructor(private db: any) {}
  
  async findById(id: number) {
    const [rows] = await this.db.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    )
    return rows[0] || null
  }
  
  async create(data: CreateUserDto) {
    this.validate(data)
    
    const [result] = await this.db.query(
      'INSERT INTO users SET ?',
      [data]
    )
    
    return result.insertId
  }
  
  private validate(data: CreateUserDto) {
    if (!data.email || !data.name) {
      throw new Error('Email and name are required')
    }
  }
}
```

**Use in application:**
```typescript
import { UserService } from './services/user-service'

export const takeover = ['http', 'database:default']

export default async (server, db) => {
  const userService = new UserService(db.getConnection())
  
  server.app.router('/users/:id', async (req, res) => {
    const user = await userService.findById(req.params.id)
    res.json(user)
  })
  
  await server.listen()
}
```

---

## Security Best Practices

### Input Validation

**Validate all inputs:**
```typescript
import { z } from 'zod'

const CreateUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  age: z.number().int().min(18).max(120)
})

app.router('/users', {
  method: 'POST',
  handler: async (req, res) => {
    try {
      const data = CreateUserSchema.parse(req.body)
      const userId = await userService.create(data)
      res.json({ id: userId })
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  }
})
```

### SQL Injection Prevention

**Always use prepared statements:**
```typescript
// Good - parameterized query
const [users] = await db.query(
  'SELECT * FROM users WHERE email = ?',
  [email]
)

// Bad - string concatenation
const [users] = await db.query(
  `SELECT * FROM users WHERE email = '${email}'`
)
```

### Authentication & Authorization

**Implement proper authentication:**
```typescript
import jwt from 'jsonwebtoken'

// Middleware
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Protected route
app.router('/api/protected', authenticate, (req, res) => {
  res.json({ data: 'Protected data', user: req.user })
})
```

### Security Headers

**Use helmet middleware:**
```typescript
import helmet from 'helmet'

export const takeover = ['http']

export default async (server) => {
  const { framework } = server
  
  // Apply security headers
  framework.use(helmet())
  
  // Custom CSP
  framework.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }))
  
  await server.listen()
}
```

### Rate Limiting

**Prevent abuse:**
```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests'
})

// Apply to all routes
framework.use(limiter)

// Or specific routes
app.router('/api/login', limiter, loginHandler)
```

### CORS Configuration

**Configure CORS properly:**
```typescript
import cors from 'cors'

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}

framework.use(cors(corsOptions))
```

---

## Error Handling

### Centralized Error Handler

```typescript
// src/middleware/error-handler.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal server error'
  
  // Log error
  console.error(err)
  
  // Send response
  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  })
}
```

**Use in application:**
```typescript
import { errorHandler, AppError } from './middleware/error-handler'

export const takeover = ['http']

export default async (server) => {
  const { app, framework } = server
  
  // Routes
  app.router('/users/:id', async (req, res) => {
    const user = await userService.findById(req.params.id)
    
    if (!user) {
      throw new AppError(404, 'User not found')
    }
    
    res.json(user)
  })
  
  // Error handler (must be last)
  framework.use(errorHandler)
  
  await server.listen()
}
```

### Async Error Handling

**Wrap async routes:**
```typescript
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Use wrapper
app.router('/users', asyncHandler(async (req, res) => {
  const users = await userService.getAll()
  res.json(users)
}))
```

---

## Performance Optimization

### Database Connection Pooling

```yaml
# .config/databases.yml
databases:
  - type: mysql
    key: default
    autoconnect: true
    options:
      connectionLimit: 10      # Pool size
      queueLimit: 0
      waitForConnections: true
      connectTimeout: 10000
```

### Caching Strategy

**Implement caching:**
```typescript
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

async function getUser(id: number) {
  // Check cache
  const cached = await redis.get(`user:${id}`)
  if (cached) {
    return JSON.parse(cached)
  }
  
  // Query database
  const user = await db.query('SELECT * FROM users WHERE id = ?', [id])
  
  // Cache result
  await redis.setex(`user:${id}`, 3600, JSON.stringify(user))
  
  return user
}
```

### Query Optimization

**Use indexes:**
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_user_id ON posts(user_id);
```

**Limit results:**
```typescript
const [users] = await db.query(
  'SELECT * FROM users LIMIT ? OFFSET ?',
  [limit, offset]
)
```

### Response Compression

```typescript
import compression from 'compression'

framework.use(compression({
  threshold: 1024, // Only compress responses larger than 1KB
  level: 6         // Compression level (0-9)
}))
```

---

## Testing Best Practices

### Test Structure

**Follow AAA pattern:**
```typescript
describe('UserService', () => {
  describe('create', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = { name: 'John', email: 'john@example.com' }
      
      // Act
      const userId = await userService.create(userData)
      
      // Assert
      expect(userId).toBeGreaterThan(0)
    })
  })
})
```

### Use Test Fixtures

```typescript
// test/fixtures/users.ts
export function createUser(overrides = {}) {
  return {
    name: 'Test User',
    email: 'test@example.com',
    age: 25,
    ...overrides
  }
}

// In tests
const user = createUser({ name: 'John' })
```

### Mock External Dependencies

```typescript
jest.mock('../services/email-service')

test('should send welcome email', async () => {
  const emailService = require('../services/email-service')
  emailService.send.mockResolvedValue(true)
  
  await userService.create(userData)
  
  expect(emailService.send).toHaveBeenCalledWith(
    userData.email,
    'Welcome!'
  )
})
```

---

## Development Workflow

### Git Workflow

**Branch naming:**
- `feature/user-authentication`
- `fix/database-connection`
- `refactor/user-service`

**Commit messages:**
```
feat: add user authentication
fix: resolve database connection issue
refactor: improve user service
docs: update API documentation
test: add user service tests
```

### Code Review Checklist

- [ ] Code follows project conventions
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] No sensitive data in code
- [ ] Error handling implemented
- [ ] TypeScript types defined
- [ ] Documentation updated
- [ ] No unnecessary dependencies

### Pre-commit Hooks

**Using Husky:**
```json
{
  "scripts": {
    "prepare": "husky install"
  },
  "devDependencies": {
    "husky": "^8.0.0",
    "lint-staged": "^13.0.0"
  }
}
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

## Logging Best Practices

### Structured Logging

```typescript
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

// Use structured logging
logger.info('User created', {
  userId: user.id,
  email: user.email,
  action: 'CREATE_USER'
})
```

### Request Logging

```typescript
import morgan from 'morgan'

// Development
framework.use(morgan('dev'))

// Production
framework.use(morgan('combined'))
```

---

## Documentation

### Code Comments

**Document complex logic:**
```typescript
/**
 * Calculates user reputation score based on activity
 * 
 * @param userId - The user's ID
 * @returns Reputation score between 0-100
 */
async function calculateReputation(userId: number): Promise<number> {
  // Algorithm details...
}
```

**Avoid obvious comments:**
```typescript
// Bad
let x = 5 // Set x to 5

// Good
let maxRetries = 5 // Maximum connection retry attempts
```

### API Documentation

**Document endpoints:**
```typescript
/**
 * GET /api/users/:id
 * 
 * Retrieves a user by ID
 * 
 * @param id - User ID (numeric)
 * @returns User object
 * @throws 404 if user not found
 */
app.router('/api/users/:id', getUserHandler)
```

---

## Common Pitfalls

### Avoid These Mistakes

1. **Hardcoding values**
   ```typescript
   // Bad
   const API_URL = 'https://api.example.com'
   
   // Good
   const API_URL = process.env.API_URL
   ```

2. **Not handling errors**
   ```typescript
   // Bad
   const user = await db.query('SELECT * FROM users')
   
   // Good
   try {
     const user = await db.query('SELECT * FROM users')
   } catch (error) {
     logger.error('Database query failed', error)
     throw new AppError(500, 'Failed to fetch user')
   }
   ```

3. **Blocking the event loop**
   ```typescript
   // Bad
   const result = heavyComputation() // Synchronous
   
   // Good
   const result = await heavyComputationAsync()
   ```

4. **Not validating input**
   ```typescript
   // Bad
   const userId = req.params.id
   const user = await getUser(userId)
   
   // Good
   const userId = parseInt(req.params.id)
   if (isNaN(userId)) {
     throw new AppError(400, 'Invalid user ID')
   }
   const user = await getUser(userId)
   ```

---

## Checklist for Production

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL/TLS certificates installed
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] Error logging set up
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Health checks implemented
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Team trained on deployment

---

## Resources

- **[Security Guide](./security.md)** - Detailed security practices
- **[Performance Guide](./performance.md)** - Performance optimization
- **[Testing Guide](./dev-kit/testing/index.md)** - Testing strategies
- **[Deployment Guide](./dev-kit/deployment/index.md)** - Deployment practices

---

**Previous:** [← Deployment](./dev-kit/deployment/index.md) | **Next:** [Security →](./security.md)
