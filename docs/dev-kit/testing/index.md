# Testing

Comprehensive guide to testing Kenx applications, including unit tests, integration tests, and end-to-end testing strategies.

## Overview

Testing Kenx applications follows standard Node.js testing practices with some framework-specific considerations:

- **Unit Testing** - Test individual functions and modules
- **Integration Testing** - Test resource interactions
- **API Testing** - Test HTTP endpoints
- **Database Testing** - Test database operations
- **End-to-End Testing** - Test complete user flows

**Recommended Tools:**
- **Jest** - Test runner and assertions
- **Supertest** - HTTP API testing
- **ts-jest** - TypeScript support for Jest
- **@testing-library** - React/UI testing (if applicable)

---

## Setup

### Installation

```bash
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

### Jest Configuration

**jest.config.js:**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

### TypeScript Configuration for Tests

**tsconfig.test.json:**
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["jest", "node"]
  },
  "include": ["src/**/*", "test/**/*"]
}
```

### Package Scripts

**package.json:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

---

## Unit Testing

### Testing Utility Functions

```typescript
// src/utils/validation.ts
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}
```

```typescript
// test/utils/validation.test.ts
import { validateEmail, sanitizeInput } from '../../src/utils/validation'

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('user@example.com')).toBe(true)
    })
    
    it('should reject invalid email', () => {
      expect(validateEmail('invalid')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
    })
  })
  
  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      expect(sanitizeInput('Hello <script>alert(1)</script>')).toBe('Hello scriptalert(1)/script')
    })
    
    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello')
    })
  })
})
```

### Testing Service Layer

```typescript
// src/services/user-service.ts
export class UserService {
  constructor(private db: any) {}
  
  async getUser(id: number) {
    const [rows] = await this.db.query('SELECT * FROM users WHERE id = ?', [id])
    return rows[0]
  }
  
  async createUser(data: any) {
    const [result] = await this.db.query('INSERT INTO users SET ?', [data])
    return result.insertId
  }
}
```

```typescript
// test/services/user-service.test.ts
import { UserService } from '../../src/services/user-service'

describe('UserService', () => {
  let service: UserService
  let mockDb: any
  
  beforeEach(() => {
    mockDb = {
      query: jest.fn()
    }
    service = new UserService(mockDb)
  })
  
  describe('getUser', () => {
    it('should fetch user by id', async () => {
      const mockUser = { id: 1, name: 'John' }
      mockDb.query.mockResolvedValue([[mockUser]])
      
      const user = await service.getUser(1)
      
      expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?', [1])
      expect(user).toEqual(mockUser)
    })
  })
  
  describe('createUser', () => {
    it('should create new user', async () => {
      const userData = { name: 'Jane', email: 'jane@example.com' }
      mockDb.query.mockResolvedValue([{ insertId: 123 }])
      
      const userId = await service.createUser(userData)
      
      expect(mockDb.query).toHaveBeenCalledWith('INSERT INTO users SET ?', [userData])
      expect(userId).toBe(123)
    })
  })
})
```

---

## Integration Testing

### Testing with Resources

```typescript
// test/integration/app.test.ts
import Core from '@ckenx/node'

describe('Application Integration', () => {
  beforeAll(async () => {
    // Initialize Kenx
    await Core.Setup.dev()
    await Core.autoload()
  })
  
  afterAll(async () => {
    // Cleanup resources
    for (const key in Core.RESOURCES.database) {
      await Core.RESOURCES.database[key].close()
    }
  })
  
  it('should load all resources', () => {
    expect(Core.RESOURCES.http).toBeDefined()
    expect(Core.RESOURCES.database).toBeDefined()
  })
  
  it('should connect to database', async () => {
    const db = Core.RESOURCES.database.default
    const connection = db.getConnection()
    
    const [rows] = await connection.query('SELECT 1 as result')
    expect(rows[0].result).toBe(1)
  })
})
```

---

## API Testing

### Testing HTTP Endpoints

```typescript
// test/api/users.test.ts
import request from 'supertest'
import Core from '@ckenx/node'

describe('User API', () => {
  let app: any
  
  beforeAll(async () => {
    await Core.Setup.dev()
    await Core.autoload()
    await Core.dispatch()
    
    // Get Express/Fastify app
    app = Core.RESOURCES.http.api.server
  })
  
  afterAll(async () => {
    // Close server
    await Core.RESOURCES.http.api.close?.()
  })
  
  describe('GET /api/users', () => {
    it('should return list of users', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200)
      
      expect(response.body).toHaveProperty('users')
      expect(Array.isArray(response.body.users)).toBe(true)
    })
  })
  
  describe('POST /api/users', () => {
    it('should create new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com'
      }
      
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201)
      
      expect(response.body).toHaveProperty('id')
      expect(response.body.name).toBe(userData.name)
    })
    
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ name: 'John' })
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })
  })
  
  describe('GET /api/users/:id', () => {
    it('should return user by id', async () => {
      const response = await request(app)
        .get('/api/users/1')
        .expect(200)
      
      expect(response.body).toHaveProperty('id', 1)
      expect(response.body).toHaveProperty('name')
    })
    
    it('should return 404 for non-existent user', async () => {
      await request(app)
        .get('/api/users/99999')
        .expect(404)
    })
  })
  
  describe('PUT /api/users/:id', () => {
    it('should update user', async () => {
      const updates = { name: 'Jane Doe' }
      
      const response = await request(app)
        .put('/api/users/1')
        .send(updates)
        .expect(200)
      
      expect(response.body.name).toBe(updates.name)
    })
  })
  
  describe('DELETE /api/users/:id', () => {
    it('should delete user', async () => {
      await request(app)
        .delete('/api/users/1')
        .expect(204)
    })
  })
})
```

### Testing Authentication

```typescript
// test/api/auth.test.ts
import request from 'supertest'

describe('Authentication', () => {
  let app: any
  let token: string
  
  beforeAll(async () => {
    // Setup app
  })
  
  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'user@example.com',
          password: 'password123'
        })
        .expect(200)
      
      expect(response.body).toHaveProperty('token')
      token = response.body.token
    })
    
    it('should reject invalid credentials', async () => {
      await request(app)
        .post('/auth/login')
        .send({
          email: 'user@example.com',
          password: 'wrong'
        })
        .expect(401)
    })
  })
  
  describe('Protected Routes', () => {
    it('should allow access with valid token', async () => {
      await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
    })
    
    it('should deny access without token', async () => {
      await request(app)
        .get('/api/protected')
        .expect(401)
    })
  })
})
```

---

## Database Testing

### Test Database Setup

```typescript
// test/setup.ts
import mysql from 'mysql2/promise'

export async function setupTestDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.TEST_DB_HOST || 'localhost',
    user: process.env.TEST_DB_USER || 'root',
    password: process.env.TEST_DB_PASSWORD || '',
    database: process.env.TEST_DB_NAME || 'test_db'
  })
  
  // Run migrations
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  return connection
}

export async function cleanupTestDatabase(connection: any) {
  await connection.query('TRUNCATE TABLE users')
  await connection.end()
}
```

### Database Tests

```typescript
// test/database/users.test.ts
import { setupTestDatabase, cleanupTestDatabase } from '../setup'

describe('User Database Operations', () => {
  let connection: any
  
  beforeAll(async () => {
    connection = await setupTestDatabase()
  })
  
  afterAll(async () => {
    await cleanupTestDatabase(connection)
  })
  
  beforeEach(async () => {
    await connection.query('TRUNCATE TABLE users')
  })
  
  it('should insert user', async () => {
    const [result] = await connection.query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      ['John Doe', 'john@example.com']
    )
    
    expect(result.insertId).toBeGreaterThan(0)
  })
  
  it('should fetch user by id', async () => {
    await connection.query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      ['John Doe', 'john@example.com']
    )
    
    const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [1])
    expect(rows[0].name).toBe('John Doe')
  })
  
  it('should enforce unique email', async () => {
    await connection.query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      ['John', 'john@example.com']
    )
    
    await expect(
      connection.query(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        ['Jane', 'john@example.com']
      )
    ).rejects.toThrow()
  })
})
```

---

## Mocking Resources

### Mock Database

```typescript
// test/mocks/database.ts
export function createMockDatabase() {
  return {
    getConnection: jest.fn().mockReturnValue({
      query: jest.fn(),
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn()
    }),
    connect: jest.fn(),
    close: jest.fn()
  }
}
```

### Mock HTTP Server

```typescript
// test/mocks/server.ts
export function createMockServer() {
  return {
    app: {
      router: jest.fn()
    },
    server: {},
    listen: jest.fn().mockResolvedValue({}),
    close: jest.fn().mockResolvedValue(undefined)
  }
}
```

### Using Mocks

```typescript
// test/with-mocks.test.ts
import { createMockDatabase, createMockServer } from './mocks'

describe('With Mocked Resources', () => {
  let mockDb: any
  let mockServer: any
  
  beforeEach(() => {
    mockDb = createMockDatabase()
    mockServer = createMockServer()
  })
  
  it('should handle database operations', async () => {
    const connection = mockDb.getConnection()
    connection.query.mockResolvedValue([[{ id: 1, name: 'Test' }]])
    
    const [rows] = await connection.query('SELECT * FROM users')
    
    expect(rows).toHaveLength(1)
    expect(rows[0].name).toBe('Test')
  })
})
```

---

## Test Patterns

### AAA Pattern (Arrange-Act-Assert)

```typescript
describe('User Service', () => {
  it('should create user', async () => {
    // Arrange
    const service = new UserService(mockDb)
    const userData = { name: 'John', email: 'john@example.com' }
    mockDb.query.mockResolvedValue([{ insertId: 1 }])
    
    // Act
    const userId = await service.createUser(userData)
    
    // Assert
    expect(userId).toBe(1)
    expect(mockDb.query).toHaveBeenCalledWith(
      'INSERT INTO users SET ?',
      [userData]
    )
  })
})
```

### Test Fixtures

```typescript
// test/fixtures/users.ts
export const testUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
]

export function createTestUser(overrides = {}) {
  return {
    name: 'Test User',
    email: 'test@example.com',
    ...overrides
  }
}
```

```typescript
// test/users.test.ts
import { testUsers, createTestUser } from './fixtures/users'

describe('Users', () => {
  it('should work with test fixtures', () => {
    expect(testUsers).toHaveLength(3)
    expect(testUsers[0].name).toBe('John Doe')
  })
  
  it('should create custom test user', () => {
    const user = createTestUser({ name: 'Custom' })
    expect(user.name).toBe('Custom')
  })
})
```

---

## Coverage

### Running Coverage

```bash
npm run test:coverage
```

### Coverage Reports

```bash
# Terminal output
jest --coverage

# HTML report
jest --coverage --coverageReporters=html
open coverage/index.html

# CI-friendly output
jest --coverage --coverageReporters=text-lcov | coveralls
```

### Coverage Thresholds

**jest.config.js:**
```javascript
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/services/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
}
```

---

## CI/CD Integration

### GitHub Actions

**.github/workflows/test.yml:**
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: test_db
        ports:
          - 3306:3306
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
        env:
          TEST_DB_HOST: 127.0.0.1
          TEST_DB_USER: root
          TEST_DB_PASSWORD: password
          TEST_DB_NAME: test_db
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Best Practices

1. **Isolate Tests** - Each test should be independent
2. **Mock External Dependencies** - Mock databases, APIs, etc.
3. **Use Descriptive Names** - Test names should explain what they test
4. **Test Edge Cases** - Test error conditions and boundaries
5. **Keep Tests Fast** - Use mocks to speed up tests
6. **Clean Up** - Always clean up resources in `afterEach`/`afterAll`
7. **Maintain Coverage** - Aim for 80%+ code coverage
8. **Test Behavior** - Test what code does, not how it does it

---

## Troubleshooting

### Tests Timeout

Increase timeout:
```typescript
jest.setTimeout(10000) // 10 seconds
```

### Database Connection Issues

Ensure test database is running and accessible.

### Port Already in Use

Use random ports in tests or ensure cleanup.

### Async Issues

Always use `async/await` or return promises.

---

## Next Steps

- **[Debugging](../debugging/index.md)** - Debugging Kenx applications
- **[Performance](../performance/index.md)** - Performance optimization
- **[Deployment](../../deployment/index.md)** - Deploying to production

---

**Previous:** [← Adapters](../../adapters/index.md) | **Next:** [Deployment →](../../deployment/index.md)
