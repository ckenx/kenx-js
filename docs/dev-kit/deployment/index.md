# Deployment

Guide to deploying Kenx applications to production environments, including build optimization, containerization, and hosting platforms.

## Overview

Deploying a Kenx application involves:
- Building optimized production artifacts
- Setting up environment variables
- Configuring databases and services
- Choosing hosting platform
- Setting up CI/CD pipeline

**Supported Platforms:**
- Docker containers
- Traditional VPS (DigitalOcean, Linode, etc.)
- Platform-as-a-Service (Heroku, Railway, Render)
- Serverless (with limitations)
- Kubernetes clusters

---

## Production Build

### Build Process

```bash
# Build for production
ckenx build

# Output structure
dist/
├── index.js          # Compiled core
├── setup.js          # Setup manager
├── lib/              # Utilities
└── types/            # Type definitions
```

### Build Configuration

**package.json:**
```json
{
  "scripts": {
    "build": "ckenx build",
    "start": "node -r @ckenx/node",
    "start:prod": "NODE_ENV=production node -r @ckenx/node"
  }
}
```

### TypeScript Optimization

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "removeComments": true,
    "sourceMap": false,
    "declaration": false,
    "skipLibCheck": true
  }
}
```

---

## Environment Configuration

### Production Environment Variables

**.env.production:**
```bash
# Server
NODE_ENV=production
HTTP_HOST=0.0.0.0
HTTP_PORT=8000

# Database
DB_HOST=production-db.example.com
DB_NAME=myapp_production
DB_USER=myapp_user
DB_PASSWORD=secure_password_here

# Session
SESSION_SECRET=long_random_string_here

# Security
CORS_ORIGIN=https://myapp.com

# Logging
LOG_LEVEL=error
```

### Environment Management

```typescript
// src/config/env.ts
export const env = {
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  server: {
    host: process.env.HTTP_HOST || '0.0.0.0',
    port: parseInt(process.env.HTTP_PORT || '8000')
  },
  
  database: {
    host: process.env.DB_HOST,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  }
}
```

---

## Docker Deployment

### Dockerfile

**Dockerfile:**
```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 8000

# Set production environment
ENV NODE_ENV=production

# Start application
CMD ["npm", "start"]
```

### Multi-stage Build

**Dockerfile (optimized):**
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.config ./.config

EXPOSE 8000

ENV NODE_ENV=production

CMD ["npm", "start"]
```

### Docker Compose

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - HTTP_HOST=0.0.0.0
      - HTTP_PORT=8000
      - DB_HOST=db
      - DB_NAME=myapp
      - DB_USER=myapp
      - DB_PASSWORD=password
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=myapp
      - MYSQL_USER=myapp
      - MYSQL_PASSWORD=password
    volumes:
      - db_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  db_data:
```

### Running with Docker

```bash
# Build image
docker build -t myapp:latest .

# Run container
docker run -d \
  --name myapp \
  -p 8000:8000 \
  -e NODE_ENV=production \
  -e DB_HOST=host.docker.internal \
  myapp:latest

# Run with Docker Compose
docker-compose up -d

# View logs
docker logs -f myapp

# Stop
docker-compose down
```

---

## Platform Deployments

### Heroku

**Procfile:**
```
web: npm start
```

**app.json:**
```json
{
  "name": "myapp",
  "description": "My Kenx Application",
  "keywords": ["node", "kenx"],
  "buildpacks": [
    {
      "url": "heroku/nodejs"
    }
  ],
  "env": {
    "NODE_ENV": {
      "value": "production"
    },
    "SESSION_SECRET": {
      "generator": "secret"
    }
  },
  "addons": [
    "heroku-postgresql:hobby-dev"
  ]
}
```

**Deploy to Heroku:**
```bash
# Login to Heroku
heroku login

# Create app
heroku create myapp

# Add database
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=$(openssl rand -base64 32)

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Railway

**railway.json:**
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Deploy to Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to project
railway link

# Deploy
railway up

# View logs
railway logs
```

### DigitalOcean App Platform

**app.yaml:**
```yaml
name: myapp
services:
  - name: web
    github:
      repo: username/myapp
      branch: main
      deploy_on_push: true
    build_command: npm run build
    run_command: npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    http_port: 8000
    envs:
      - key: NODE_ENV
        value: production
    routes:
      - path: /
databases:
  - name: db
    engine: MYSQL
    version: "8"
```

### VPS Deployment (Ubuntu)

**Setup script:**
```bash
#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone https://github.com/username/myapp.git
cd myapp

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Create .env file
cat > .env << EOF
NODE_ENV=production
HTTP_HOST=0.0.0.0
HTTP_PORT=8000
EOF

# Start with PM2
pm2 start npm --name "myapp" -- start
pm2 save
pm2 startup
```

---

## Process Management

### PM2 Configuration

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
      NODE_ENV: 'production',
      HTTP_PORT: 8000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
}
```

**PM2 Commands:**
```bash
# Start application
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs myapp

# Reload (zero-downtime)
pm2 reload myapp

# Stop
pm2 stop myapp

# Delete
pm2 delete myapp

# Save process list
pm2 save

# Setup startup script
pm2 startup
```

---

## Nginx Configuration

**nginx.conf:**
```nginx
upstream myapp {
  server 127.0.0.1:8000;
  keepalive 64;
}

server {
  listen 80;
  server_name myapp.com www.myapp.com;

  # Redirect HTTP to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name myapp.com www.myapp.com;

  # SSL certificates
  ssl_certificate /etc/letsencrypt/live/myapp.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/myapp.com/privkey.pem;

  # SSL configuration
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;

  # Security headers
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;

  # Logging
  access_log /var/log/nginx/myapp.access.log;
  error_log /var/log/nginx/myapp.error.log;

  # Static files
  location /public {
    alias /var/www/myapp/public;
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # Proxy to Node.js
  location / {
    proxy_pass http://myapp;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_redirect off;
  }
}
```

---

## CI/CD Pipeline

### GitHub Actions

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

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
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
        env:
          TEST_DB_HOST: 127.0.0.1
          TEST_DB_USER: root
          TEST_DB_PASSWORD: password

  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Download artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist/
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/myapp
            git pull origin main
            npm ci --only=production
            npm run build
            pm2 reload myapp
```

### GitLab CI

**.gitlab-ci.yml:**
```yaml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"

test:
  stage: test
  image: node:${NODE_VERSION}
  services:
    - mysql:8.0
  variables:
    MYSQL_ROOT_PASSWORD: password
    MYSQL_DATABASE: test_db
  script:
    - npm ci
    - npm test

build:
  stage: build
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

deploy:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
  script:
    - ssh $SERVER_USER@$SERVER_HOST "cd /var/www/myapp && git pull && npm ci --only=production && npm run build && pm2 reload myapp"
  only:
    - main
```

---

## Database Migrations

### Migration Strategy

**migrations/001_initial_schema.sql:**
```sql
-- Up migration
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Down migration (rollback)
-- DROP TABLE users;
```

**Run migrations:**
```bash
# Using mysql-migrations or similar tool
npm install -g mysql-migrations

# Run
mysql-migrations up --host $DB_HOST --database $DB_NAME
```

---

## Health Checks

### Health Check Endpoint

```typescript
// src/health.ts
export const takeover = ['http', 'database:*']

export default (server, databases) => {
  server.app.router('/health', async (req, res) => {
    const health = {
      uptime: process.uptime(),
      timestamp: Date.now(),
      status: 'ok',
      checks: {}
    }
    
    // Check databases
    for (const [key, db] of Object.entries(databases)) {
      try {
        await db.getConnection().query('SELECT 1')
        health.checks[`db_${key}`] = 'ok'
      } catch (error) {
        health.checks[`db_${key}`] = 'error'
        health.status = 'degraded'
      }
    }
    
    res.json(health)
  })
}
```

---

## Monitoring

### Application Monitoring

**Using PM2:**
```bash
# Enable monitoring
pm2 install pm2-server-monit

# Web dashboard
pm2 web
```

**Using New Relic:**
```javascript
// Add to application entry
require('newrelic')
import Core from '@ckenx/node'
```

### Logging

**Winston logger:**
```typescript
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

export default logger
```

---

## Security Checklist

- [ ] Use HTTPS/TLS certificates
- [ ] Set secure environment variables
- [ ] Enable CORS properly
- [ ] Use helmet for security headers
- [ ] Implement rate limiting
- [ ] Validate all inputs
- [ ] Use prepared statements for SQL
- [ ] Keep dependencies updated
- [ ] Enable firewall rules
- [ ] Use secrets management
- [ ] Implement authentication
- [ ] Set up monitoring and alerts

---

## Performance Optimization

### Production Optimizations

1. **Enable clustering** - Use PM2 cluster mode
2. **Database connection pooling** - Configure pool size
3. **Caching** - Use Redis for session/data caching
4. **Compression** - Enable gzip compression
5. **CDN** - Use CDN for static assets
6. **Load balancing** - Use Nginx or cloud load balancer

### Resource Limits

**PM2 limits:**
```javascript
{
  max_memory_restart: '1G',
  max_restarts: 10,
  min_uptime: '10s'
}
```

---

## Troubleshooting

### Common Deployment Issues

**Port already in use:**
```bash
# Find and kill process
lsof -ti:8000 | xargs kill -9
```

**Permission denied:**
```bash
# Fix permissions
sudo chown -R $USER:$USER /var/www/myapp
```

**Out of memory:**
```bash
# Increase PM2 memory limit
pm2 restart myapp --max-memory-restart 2G
```

---

## Next Steps

- **[Monitoring](./monitoring.md)** - Application monitoring
- **[Scaling](./scaling.md)** - Horizontal and vertical scaling
- **[Best Practices](../best-practices.md)** - Production best practices

---

**Previous:** [← Testing](../testing/index.md) | **Next:** [Best Practices →](../../best-practices.md)
