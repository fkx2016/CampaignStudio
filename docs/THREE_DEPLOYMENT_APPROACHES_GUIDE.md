# Three Deployment Approaches: Practice Guide

## Overview

This guide walks you through implementing **three different deployment architectures** for CampaignStudio. By practicing all three, you'll develop deep familiarity with modern deployment strategies and understand the tradeoffs between them.

---

## The Three Approaches

### **Approach 1: Desktop Docker (Local Full-Stack)**
- **Environment:** Docker Desktop on your local machine
- **Services:** Frontend + Backend + Database all in Docker containers
- **Purpose:** Local development with production-like environment
- **Complexity:** ⭐⭐ (Medium)

### **Approach 2: Railway Monolith (Cloud Full-Stack)**
- **Environment:** Railway cloud platform
- **Services:** Frontend + Backend + Database all on Railway
- **Purpose:** Single-platform cloud deployment
- **Complexity:** ⭐⭐⭐ (Medium-High)

### **Approach 3: Vercel + Railway Split (Cloud Hybrid)**
- **Environment:** Vercel (Frontend) + Railway (Backend + Database)
- **Services:** Split across two platforms
- **Purpose:** Optimized cloud deployment with specialization
- **Complexity:** ⭐⭐⭐⭐ (High)

---

## Learning Objectives

By completing all three approaches, you will:

✅ Understand Docker containerization deeply  
✅ Master environment variable management across platforms  
✅ Learn CORS configuration for cross-origin deployments  
✅ Experience platform-specific deployment workflows  
✅ Develop troubleshooting skills for each architecture  
✅ Make informed decisions about deployment strategies  

---

## Approach 1: Desktop Docker (Local Full-Stack)

### **Architecture Diagram**

```
┌─────────────────────────────────────────┐
│         Docker Desktop (Local)          │
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────┐ │
│  │ Frontend │  │ Backend  │  │  DB  │ │
│  │ Next.js  │→ │ FastAPI  │→ │ PG   │ │
│  │  :3000   │  │  :8001   │  │ :5432│ │
│  └──────────┘  └──────────┘  └──────┘ │
│                                         │
└─────────────────────────────────────────┘
         ↓
   http://localhost:3000
```

### **Implementation Files**

#### **File 1: `docker-compose.yml`**

Location: `c:\Users\fkurk\OneDrive\Documents\MyProjects\CampaignStudio\docker-compose.yml`

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:15
    container_name: campaignstudio-db
    environment:
      POSTGRES_DB: campaignstudio
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - campaignstudio-network

  # Backend (FastAPI)
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: campaignstudio-backend
    ports:
      - "8001:8001"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/campaignstudio
      ENVIRONMENT: development
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./backend:/app
    command: uvicorn main:app --host 0.0.0.0 --port 8001 --reload
    networks:
      - campaignstudio-network

  # Frontend (Next.js)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: campaignstudio-frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8001
      NODE_ENV: development
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    command: npm run dev
    networks:
      - campaignstudio-network

volumes:
  postgres_data:

networks:
  campaignstudio-network:
    driver: bridge
```

#### **File 2: `start-local.sh` (Mac/Linux)**

Location: `c:\Users\fkurk\OneDrive\Documents\MyProjects\CampaignStudio\start-local.sh`

```bash
#!/bin/bash

echo "🚀 Starting CampaignStudio (Desktop Docker)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Start all services
echo "📦 Starting Docker containers..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to initialize..."
sleep 5

# Health check for backend
echo "🔍 Checking backend health..."
until curl -s http://localhost:8001/health > /dev/null 2>&1; do
  echo "   Waiting for backend..."
  sleep 2
done
echo "✅ Backend is ready!"

# Health check for frontend
echo "🔍 Checking frontend health..."
until curl -s http://localhost:3000 > /dev/null 2>&1; do
  echo "   Waiting for frontend..."
  sleep 2
done
echo "✅ Frontend is ready!"

# Open browser
echo "🌐 Opening browser..."
if command -v open > /dev/null; then
  open http://localhost:3000  # macOS
elif command -v xdg-open > /dev/null; then
  xdg-open http://localhost:3000  # Linux
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ CampaignStudio is running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8001"
echo "   Database: localhost:5432"
echo ""
echo "📋 Useful commands:"
echo "   View logs:    docker-compose logs -f"
echo "   Stop all:     docker-compose down"
echo "   Restart:      docker-compose restart"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

#### **File 3: `start-local.bat` (Windows)**

Location: `c:\Users\fkurk\OneDrive\Documents\MyProjects\CampaignStudio\start-local.bat`

```batch
@echo off
echo.
echo ========================================
echo   Starting CampaignStudio (Desktop Docker)
echo ========================================
echo.

echo [1/4] Starting Docker containers...
docker-compose up -d

echo [2/4] Waiting for services to initialize...
timeout /t 5 /nobreak > nul

echo [3/4] Checking backend health...
:wait_backend
curl -s http://localhost:8001/health > nul 2>&1
if errorlevel 1 (
    echo    Waiting for backend...
    timeout /t 2 /nobreak > nul
    goto wait_backend
)
echo    Backend is ready!

echo [4/4] Checking frontend health...
:wait_frontend
curl -s http://localhost:3000 > nul 2>&1
if errorlevel 1 (
    echo    Waiting for frontend...
    timeout /t 2 /nobreak > nul
    goto wait_frontend
)
echo    Frontend is ready!

echo.
echo ========================================
echo   CampaignStudio is running!
echo ========================================
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8001
echo   Database: localhost:5432
echo.
echo   Opening browser...
start http://localhost:3000
echo.
echo   Useful commands:
echo   - View logs:    docker-compose logs -f
echo   - Stop all:     docker-compose down
echo   - Restart:      docker-compose restart
echo ========================================
```

### **Practice Steps**

1. **Create the files** (docker-compose.yml, start-local.bat)
2. **Make script executable** (if on Mac/Linux): `chmod +x start-local.sh`
3. **Run the startup script**: `./start-local.bat` (Windows) or `./start-local.sh` (Mac/Linux)
4. **Verify all services** are running: `docker-compose ps`
5. **Test the application** in the auto-opened browser
6. **View logs**: `docker-compose logs -f`
7. **Stop services**: `docker-compose down`

### **Troubleshooting**

| Issue | Solution |
|-------|----------|
| Port already in use | Stop conflicting service or change port in docker-compose.yml |
| Database not ready | Increase healthcheck interval |
| Frontend can't reach backend | Check NEXT_PUBLIC_API_URL environment variable |
| Changes not reflecting | Rebuild containers: `docker-compose up --build` |

---

## Approach 2: Railway Monolith (Cloud Full-Stack)

### **Architecture Diagram**

```
┌─────────────────────────────────────────┐
│         Railway Cloud Platform          │
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────┐ │
│  │ Frontend │  │ Backend  │  │  DB  │ │
│  │ Next.js  │→ │ FastAPI  │→ │  PG  │ │
│  │  :3000   │  │  :8001   │  │      │ │
│  └──────────┘  └──────────┘  └──────┘ │
│                                         │
└─────────────────────────────────────────┘
         ↓
   https://campaignstudio.up.railway.app
```

### **Implementation Files**

#### **File 1: `Dockerfile` (Backend)**

Location: `c:\Users\fkurk\OneDrive\Documents\MyProjects\CampaignStudio\backend\Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8001

# Start command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

#### **File 2: `Dockerfile` (Frontend)**

Location: `c:\Users\fkurk\OneDrive\Documents\MyProjects\CampaignStudio\frontend\Dockerfile`

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### **File 3: `railway.json`**

Location: `c:\Users\fkurk\OneDrive\Documents\MyProjects\CampaignStudio\railway.json`

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### **File 4: `start-production.sh`**

Location: `c:\Users\fkurk\OneDrive\Documents\MyProjects\CampaignStudio\start-production.sh`

```bash
#!/bin/sh

echo "🚀 Starting CampaignStudio (Production Mode)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Start Backend (in background)
echo "📡 Starting Backend (FastAPI)..."
cd /app/backend
uvicorn main:app --host 0.0.0.0 --port 8001 &
BACKEND_PID=$!

# Wait for backend to be ready
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Start Frontend (in foreground)
echo "🌐 Starting Frontend (Next.js)..."
cd /app/frontend
npm start

# If frontend exits, kill backend
kill $BACKEND_PID
```

### **Practice Steps**

1. **Create Railway account** at https://railway.app
2. **Create new project** in Railway dashboard
3. **Add PostgreSQL database** from Railway marketplace
4. **Create backend service**:
   - Connect GitHub repo
   - Set root directory to `/backend`
   - Railway auto-detects Dockerfile
   - Add environment variable: `DATABASE_URL` (from PostgreSQL service)
5. **Create frontend service**:
   - Connect same GitHub repo
   - Set root directory to `/frontend`
   - Add environment variable: `NEXT_PUBLIC_API_URL` (from backend service URL)
6. **Deploy both services**
7. **Get public URL** from Railway dashboard
8. **Create desktop shortcut** to the URL

### **Environment Variables (Railway)**

**Backend Service:**
```
DATABASE_URL=postgresql://postgres:password@host:port/database
ENVIRONMENT=production
```

**Frontend Service:**
```
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
NODE_ENV=production
```

### **Desktop Shortcut (Windows)**

Create `CampaignStudio-Railway.url`:
```ini
[InternetShortcut]
URL=https://campaignstudio-production.up.railway.app
IconIndex=0
```

---

## Approach 3: Vercel + Railway Split (Cloud Hybrid)

### **Architecture Diagram**

```
┌──────────────────┐         ┌──────────────────┐
│  Vercel (Global) │         │ Railway (Cloud)  │
│                  │         │                  │
│  ┌────────────┐ │         │  ┌────────────┐ │
│  │  Frontend  │ │────────→│  │  Backend   │ │
│  │  Next.js   │ │  HTTPS  │  │  FastAPI   │ │
│  │  (Edge)    │ │         │  │   :8001    │ │
│  └────────────┘ │         │  └────────────┘ │
│                  │         │        ↓        │
└──────────────────┘         │  ┌────────────┐ │
                             │  │  Database  │ │
                             │  │    PG      │ │
                             │  └────────────┘ │
                             └──────────────────┘
         ↓                            ↓
   https://campaign-studio.vercel.app
```

### **Implementation Files**

#### **File 1: `vercel.json`**

Location: `c:\Users\fkurk\OneDrive\Documents\MyProjects\CampaignStudio\frontend\vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url"
  }
}
```

#### **File 2: Backend CORS Configuration**

Location: `c:\Users\fkurk\OneDrive\Documents\MyProjects\CampaignStudio\backend\main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# CORS configuration for Vercel frontend
origins = [
    "http://localhost:3000",  # Local development
    "https://campaign-studio.vercel.app",  # Production Vercel
    "https://*.vercel.app",  # Vercel preview deployments
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ... rest of your FastAPI app
```

#### **File 3: API Client Configuration**

Location: `c:\Users\fkurk\OneDrive\Documents\MyProjects\CampaignStudio\frontend\lib\api.ts`

```typescript
// API base URL configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export const apiClient = {
  baseURL: API_BASE_URL,
  
  async fetch(endpoint: string, options?: RequestInit) {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },
};
```

### **Practice Steps**

#### **Part A: Deploy Backend to Railway**

1. **Create Railway project**
2. **Add PostgreSQL database**
3. **Deploy backend service**:
   - Connect GitHub repo
   - Set root directory to `/backend`
   - Add `DATABASE_URL` environment variable
4. **Note the backend URL** (e.g., `https://backend.up.railway.app`)

#### **Part B: Deploy Frontend to Vercel**

1. **Create Vercel account** at https://vercel.com
2. **Import GitHub repository**
3. **Configure project**:
   - Framework preset: Next.js
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `.next`
4. **Add environment variable**:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-backend.up.railway.app`
5. **Deploy**
6. **Get Vercel URL** (e.g., `https://campaign-studio.vercel.app`)

#### **Part C: Configure CORS**

1. **Update backend CORS** to allow Vercel domain
2. **Redeploy backend** on Railway
3. **Test cross-origin requests** from Vercel frontend

#### **Part D: Create Desktop Shortcut**

Create `CampaignStudio-Vercel.url`:
```ini
[InternetShortcut]
URL=https://campaign-studio.vercel.app
IconIndex=0
```

### **Environment Variables**

**Railway (Backend):**
```
DATABASE_URL=postgresql://postgres:password@host:port/database
ALLOWED_ORIGINS=https://campaign-studio.vercel.app,https://*.vercel.app
ENVIRONMENT=production
```

**Vercel (Frontend):**
```
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
NODE_ENV=production
```

### **Troubleshooting CORS Issues**

| Issue | Solution |
|-------|----------|
| "CORS policy" error | Add Vercel domain to backend CORS origins |
| "Failed to fetch" | Check NEXT_PUBLIC_API_URL is correct |
| Works locally, fails on Vercel | Ensure environment variable is set in Vercel dashboard |
| Preview deployments fail | Add `https://*.vercel.app` to CORS origins |

---

## Comparison Matrix

| Aspect | Desktop Docker | Railway Monolith | Vercel + Railway |
|--------|---------------|------------------|------------------|
| **Setup Complexity** | Medium | Medium-High | High |
| **Cost (Monthly)** | $0 (local) | $5-20 | $0-10 (Vercel free tier) |
| **Startup Time** | ~30 seconds | ~2 minutes | ~1 minute |
| **Global Performance** | N/A (local) | Single region | Multi-region (Vercel CDN) |
| **CORS Configuration** | Not needed | Not needed | Required |
| **Environment Parity** | Exact match | Close match | Different architectures |
| **Debugging Ease** | Easiest | Medium | Hardest |
| **Scalability** | N/A | Manual | Automatic (Vercel) |
| **Best For** | Development | Simple deployment | Production at scale |

---

## Practice Workflow

### **Week 1: Master Desktop Docker**
- Day 1-2: Set up docker-compose.yml
- Day 3-4: Create startup scripts
- Day 5-7: Practice daily development workflow

### **Week 2: Deploy to Railway**
- Day 1-2: Create Railway account and project
- Day 3-4: Deploy backend and frontend
- Day 5-7: Test and troubleshoot

### **Week 3: Add Vercel Split**
- Day 1-2: Deploy frontend to Vercel
- Day 3-4: Configure CORS
- Day 5-7: Compare all three approaches

### **Week 4: Documentation and Reflection**
- Document what you learned
- Create decision matrix for future projects
- Update this guide with your insights

---

## Success Criteria

You've mastered all three approaches when you can:

✅ Start any environment from scratch in under 10 minutes  
✅ Troubleshoot common issues without documentation  
✅ Explain tradeoffs between approaches to someone else  
✅ Choose the right approach for a new project  
✅ Switch between approaches based on project phase  

---

## Next Steps

After completing all three approaches:

1. **Document your experience** in a conversation with Antigravity
2. **Create a decision flowchart** for choosing deployment strategy
3. **Build a reusable template** for future projects
4. **Share your learnings** with the team/community

---

## Resources

- **Docker Compose Docs:** https://docs.docker.com/compose/
- **Railway Docs:** https://docs.railway.app/
- **Vercel Docs:** https://vercel.com/docs
- **FastAPI Deployment:** https://fastapi.tiangolo.com/deployment/
- **Next.js Deployment:** https://nextjs.org/docs/deployment

---

**Remember:** The goal isn't to pick one approach and stick with it forever. The goal is to understand all three so you can choose the right tool for each situation.
