# 🚀 Campaign Studio - Deployment Guide

## Table of Contents
1. [Quick Start: Vercel Deployment](#quick-start-vercel-deployment) ⭐ **RECOMMENDED FOR DEMOS**
2. [Local vs Production Overview](#local-vs-production-overview)
3. [Understanding the Docker Setup](#understanding-the-docker-setup)
4. [Local Development](#local-development)
5. [Preparing for Production](#preparing-for-production)
6. [Deployment Checklist](#deployment-checklist)
7. [Common Deployment Platforms](#common-deployment-platforms)

---

## Quick Start: Vercel Deployment

### ⭐ **Why Vercel? (Recommended for Demos)**

**Perfect for Campaign Studio because:**
- ✅ **FREE** for demos and hobby projects
- ✅ **Next.js optimized** (made by the Next.js team)
- ✅ **5-minute setup** - fastest way to get live
- ✅ **Auto-deploy** from GitHub on every push
- ✅ **Free PostgreSQL** database included
- ✅ **Global CDN** - fast worldwide
- ✅ **Automatic HTTPS** - secure by default
- ✅ **Zero config** - detects Next.js automatically

**Your local workflow stays exactly the same!** You'll still use Docker for development.

---

### 🚀 Vercel Deployment Steps (60 minutes total)

#### **Step 1: Prepare Your Repository (10 min)**

**1.1 Push to GitHub (if not already)**
```bash
# If you haven't pushed to GitHub yet:
git remote add origin https://github.com/YOUR_USERNAME/CampaignStudio.git
git branch -M main
git push -u origin main
```

**1.2 Create `.env.example`** (template for others)
```bash
# In project root
DATABASE_URL=postgresql://user:password@host:5432/dbname
NEXT_PUBLIC_API_URL=http://localhost:8001
ALLOWED_ORIGINS=http://localhost:3000
SECRET_KEY=your-secret-key-here
```

**1.3 Add to `.gitignore`** (if not already there)
```
.env
.env.local
.env.production
```

---

#### **Step 2: Deploy Frontend to Vercel (15 min)**

**2.1 Sign Up for Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "Sign Up"
- Choose "Continue with GitHub"
- Authorize Vercel to access your repos

**2.2 Import Project**
- Click "Add New..." → "Project"
- Select your `CampaignStudio` repository
- Vercel auto-detects Next.js in `next-gen-app/`

**2.3 Configure Build Settings**
```
Framework Preset: Next.js
Root Directory: next-gen-app
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

**2.4 Set Environment Variables**
Click "Environment Variables" and add:
```
NEXT_PUBLIC_API_URL = https://your-backend-url.railway.app/api
(We'll get this URL in Step 3)
```

**2.5 Deploy!**
- Click "Deploy"
- Wait 2-3 minutes
- You'll get a URL like: `https://campaign-studio-xyz.vercel.app`

---

#### **Step 3: Deploy Backend to Railway (20 min)**

**Why Railway for backend?**
- Vercel is serverless (great for frontend)
- Railway is better for persistent backend + database
- $5 FREE credit (lasts 1-2 months for demos)

**3.1 Sign Up for Railway**
- Go to [railway.app](https://railway.app)
- Click "Login with GitHub"
- Authorize Railway

**3.2 Create New Project**
- Click "New Project"
- Choose "Deploy from GitHub repo"
- Select `CampaignStudio`

**3.3 Add PostgreSQL Database**
- In your Railway project, click "+ New"
- Select "Database" → "PostgreSQL"
- Railway creates a database automatically
- Copy the `DATABASE_URL` (you'll need this)

**3.4 Configure Backend Service**
- Click on your backend service
- Go to "Settings" → "Environment"
- Add variables:
```
DATABASE_URL = (paste from PostgreSQL service)
ALLOWED_ORIGINS = https://campaign-studio-xyz.vercel.app
SECRET_KEY = (generate a random 32-character string)
PORT = 8001
```

**3.5 Set Root Directory**
- Settings → "Build"
- Root Directory: `backend`
- Build Command: (leave empty, uses Dockerfile)
- Start Command: (leave empty, uses Dockerfile CMD)

**3.6 Deploy**
- Railway auto-deploys
- Wait 2-3 minutes
- You'll get a URL like: `https://campaignstudio-production.up.railway.app`

---

#### **Step 4: Connect Frontend to Backend (5 min)**

**4.1 Update Vercel Environment Variable**
- Go back to Vercel dashboard
- Your project → "Settings" → "Environment Variables"
- Update `NEXT_PUBLIC_API_URL`:
```
NEXT_PUBLIC_API_URL = https://campaignstudio-production.up.railway.app
```

**4.2 Redeploy Frontend**
- Go to "Deployments" tab
- Click "..." on latest deployment
- Click "Redeploy"
- Wait 2 minutes

---

#### **Step 5: Initialize Database (10 min)**

**5.1 Run Migrations on Railway**
- In Railway, click on your backend service
- Go to "Deployments" → Click latest deployment
- Click "View Logs"
- Verify database tables were created

**5.2 Seed Initial Data (Optional)**
You can run SQL directly in Railway:
- Click on PostgreSQL service
- Click "Data" tab
- Run SQL queries to add initial platforms, modes, etc.

Or use a migration script:
```bash
# Create a migration script in backend/migrations/
# Railway will run it on deploy
```

---

#### **Step 6: Test Your Live App! (5 min)**

**6.1 Visit Your Vercel URL**
```
https://campaign-studio-xyz.vercel.app
```

**6.2 Test Key Features**
- [ ] Frontend loads
- [ ] Can create a campaign
- [ ] Can create a post
- [ ] Settings modal works
- [ ] Platform tabs work

**6.3 Check Logs**
- Vercel: Dashboard → Your Project → "Logs"
- Railway: Your Service → "Deployments" → "View Logs"

---

### 🎯 **Success! Your App is Live!**

**You now have:**
- ✅ Frontend: `https://campaign-studio-xyz.vercel.app`
- ✅ Backend: `https://campaignstudio-production.up.railway.app`
- ✅ Database: Managed PostgreSQL on Railway
- ✅ Auto-deploy: Push to GitHub → Auto-updates

---

### 📊 Cost Breakdown

| Service | Free Tier | Paid (if needed) |
|---------|-----------|------------------|
| **Vercel** | 100GB bandwidth/month | $20/month Pro |
| **Railway** | $5 credit (1-2 months) | ~$5-10/month after |
| **Total** | **FREE for 1-2 months** | **~$5-10/month** |

---

### 🔄 Local Development (Unchanged!)

**Your local workflow stays exactly the same:**

```bash
# Still use Docker locally
.\start_docker.bat

# Still access at:
http://localhost:3000

# Still commit to Git
git add .
git commit -m "feat: new feature"
git push

# Vercel auto-deploys on push! 🎉
```

**Nothing changes locally!** Docker is still your development environment.

---

### 🚀 Alternative: Full Vercel Stack (Advanced)

**If you want everything on Vercel:**

**Option A: Vercel + Vercel Postgres**
- Frontend: Vercel (free)
- Backend: Vercel Serverless Functions (free)
- Database: Vercel Postgres (free tier)

**Requires:**
- Converting FastAPI routes to Vercel serverless functions
- More complex setup
- Better for scaling later

**Option B: Vercel + Neon Database**
- Frontend: Vercel
- Backend: Vercel Serverless Functions  
- Database: Neon (serverless PostgreSQL, free tier)

---

### 🔧 Troubleshooting

**Frontend loads but API calls fail:**
- Check `NEXT_PUBLIC_API_URL` in Vercel
- Verify Railway backend is running
- Check CORS settings in backend (`ALLOWED_ORIGINS`)

**Database connection errors:**
- Verify `DATABASE_URL` in Railway
- Check PostgreSQL service is running
- Review backend logs in Railway

**Build fails on Vercel:**
- Check build logs in Vercel dashboard
- Verify `package.json` has all dependencies
- Ensure Next.js version is compatible

**Railway deployment fails:**
- Check Dockerfile exists in `backend/`
- Verify environment variables are set
- Review deployment logs

---

### 📚 Next Steps After Deployment

**1. Custom Domain (Optional)**
- Buy domain (Namecheap, Google Domains, etc.)
- Add to Vercel: Settings → Domains
- Configure DNS records
- Vercel handles SSL automatically

**2. Monitoring**
- Vercel Analytics (built-in)
- Railway metrics dashboard
- Set up error tracking (Sentry, etc.)

**3. Backups**
- Railway: Automated database backups
- Export data regularly
- Version control for code (Git)

**4. CI/CD**
- Already set up! (GitHub → Vercel/Railway)
- Add tests before deploy (optional)
- Staging environment (optional)

---

### 🎓 Learning Path

**Week 1: Deploy to Vercel + Railway** ✅ (You're here!)
- Get comfortable with the platforms
- Test deployments
- Learn the dashboards

**Week 2: Try Other Platforms**
- Deploy to Render (comparison)
- Try Fly.io (Docker-native)
- Understand trade-offs

**Week 3: Optimize**
- Add monitoring
- Set up custom domain
- Improve performance

**Week 4: Scale**
- Add staging environment
- Set up proper CI/CD
- Database optimization

---
---

## Local vs Production Overview

### What Runs Where?

| Component | Local Development | Production/External Host |
|-----------|------------------|--------------------------|
| **Docker Containers** | ✅ On your machine | ✅ On remote server |
| **`.bat` Scripts** | ✅ On your machine | ❌ Not deployed |
| **Browser Auto-Open** | ✅ Opens on your PC | ❌ N/A (users access via URL) |
| **Database** | ✅ In Docker container | ✅ In Docker OR managed service |
| **Environment Variables** | 🔧 Local values | 🔧 Production values |

### Key Concept: Separation of Concerns

```
┌─────────────────────────────────────────────────────────────┐
│  LOCAL DEVELOPMENT                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  start_docker.bat (Windows Script)                          │
│       ↓                                                     │
│  Runs: docker-compose up --build -d                         │
│       ↓                                                     │
│  Opens: http://localhost:3000 in YOUR browser               │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  PRODUCTION DEPLOYMENT                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SSH into server                                            │
│       ↓                                                     │
│  Runs: docker-compose up -d (on server)                     │
│       ↓                                                     │
│  Users access: https://yourdomain.com                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Understanding the Docker Setup

### Files and Their Roles

#### **Deployed to Production** ✅
- `docker-compose.yml` - Orchestrates all containers
- `backend/Dockerfile` - Builds the FastAPI backend image
- `next-gen-app/Dockerfile` - Builds the Next.js frontend image
- `.dockerignore` - Excludes files from Docker builds
- `.env.example` - Template for environment variables
- All application code (`backend/`, `next-gen-app/`, etc.)

#### **Local Development Only** 🏠
- `start_docker.bat` - Windows convenience script
- `shutdown_services.bat` - Local service management
- `hard_reset.bat` - Local database reset tool
- `.env` - Your local secrets (NEVER commit this!)
- `venv/` - Python virtual environment (not needed in Docker)

---

## Local Development

### Current Setup (What You're Using Now)

```batch
# start_docker.bat does this:
1. Checks if Docker Desktop is running
2. Runs: docker-compose up --build -d
3. Waits 3 seconds for services to start
4. Opens http://localhost:3000 in your browser
5. Shows container logs
```

### Your `docker-compose.yml` Explained

```yaml
services:
  backend:
    # Builds from backend/Dockerfile
    ports:
      - "8001:8001"  # Maps container port 8001 to your PC's port 8001
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/campaignstudio
      - ALLOWED_ORIGINS=http://localhost:3000  # ⚠️ Change for production!
    volumes:
      - ./backend:/app/backend  # ⚠️ Live reload - remove for production!

  frontend:
    ports:
      - "3000:3000"  # Maps container port 3000 to your PC's port 3000
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8001  # ⚠️ Change for production!
    volumes:
      - ./next-gen-app:/app  # ⚠️ Live reload - remove for production!
    command: npm run dev  # ⚠️ Development mode - change for production!

  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data  # Persists database data
```

**⚠️ Items marked need changes for production deployment!**

---

## Preparing for Production

### Step 1: Create Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    ports:
      - "8001:8001"
    environment:
      - DATABASE_URL=${DATABASE_URL}  # From environment variable
      - ALLOWED_ORIGINS=${ALLOWED_ORIGINS}  # Your production domain
      - SECRET_KEY=${SECRET_KEY}  # Add security secrets
    depends_on:
      - db
    restart: always
    # NO volumes for live reloading in production!

  frontend:
    build:
      context: ./next-gen-app
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}  # Production API URL
      - NODE_ENV=production
    depends_on:
      - backend
    command: npm start  # Production mode, not 'npm run dev'
    restart: always
    # NO volumes for live reloading in production!

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always
    # Consider using managed database (AWS RDS, DigitalOcean Managed DB, etc.)

  # Optional: Add Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl  # SSL certificates
    depends_on:
      - frontend
      - backend
    restart: always

volumes:
  postgres_data:
```

### Step 2: Create Production Environment File

Create `.env.production` (on the server):

```bash
# Database
DATABASE_URL=postgresql://prod_user:STRONG_PASSWORD@db:5432/campaignstudio
POSTGRES_USER=prod_user
POSTGRES_PASSWORD=STRONG_PASSWORD_HERE
POSTGRES_DB=campaignstudio

# Backend
SECRET_KEY=your-super-secret-key-here-min-32-chars
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Frontend
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NODE_ENV=production
```

### Step 3: Update Frontend Dockerfile for Production

Your `next-gen-app/Dockerfile` should have a production build:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] **Security Audit**
  - [ ] Remove all hardcoded passwords
  - [ ] Use environment variables for all secrets
  - [ ] Generate strong SECRET_KEY
  - [ ] Review CORS settings (ALLOWED_ORIGINS)

- [ ] **Code Preparation**
  - [ ] Remove development volumes from docker-compose
  - [ ] Change `npm run dev` to `npm start`
  - [ ] Update API URLs to production domains
  - [ ] Remove debug logging
  - [ ] Run production build locally to test

- [ ] **Database**
  - [ ] Decide: Docker container or managed service?
  - [ ] Set up automated backups
  - [ ] Create production database user (not 'postgres')
  - [ ] Test database migrations

### Deployment Day

- [ ] **Server Setup**
  - [ ] Install Docker and Docker Compose on server
  - [ ] Set up firewall (allow ports 80, 443, 22)
  - [ ] Configure SSH access
  - [ ] Set up SSL certificates (Let's Encrypt)

- [ ] **Deploy Application**
  - [ ] Clone repository to server
  - [ ] Create `.env.production` with secrets
  - [ ] Run: `docker-compose -f docker-compose.prod.yml up -d`
  - [ ] Check logs: `docker-compose logs -f`
  - [ ] Test all endpoints

- [ ] **Post-Deployment**
  - [ ] Set up monitoring (uptime, errors)
  - [ ] Configure automated backups
  - [ ] Set up CI/CD pipeline (optional)
  - [ ] Document deployment process

---

## Common Deployment Platforms

### Option 1: DigitalOcean Droplet (Recommended for Beginners)

**What it is**: A virtual private server (VPS) where you have full control.

**Steps**:
1. Create a Droplet (Ubuntu 22.04)
2. SSH into the server: `ssh root@your-server-ip`
3. Install Docker:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```
4. Install Docker Compose:
   ```bash
   apt install docker-compose-plugin
   ```
5. Clone your repo:
   ```bash
   git clone https://github.com/yourusername/CampaignStudio.git
   cd CampaignStudio
   ```
6. Create `.env.production` with your secrets
7. Deploy:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

**Cost**: ~$6-12/month for basic droplet

---

### Option 2: AWS EC2 + RDS

**What it is**: Amazon's cloud platform with separate compute (EC2) and database (RDS).

**Pros**:
- Managed database (automatic backups, scaling)
- Industry standard
- Lots of documentation

**Cons**:
- More complex setup
- Can be expensive if not configured carefully

**Steps** (High-level):
1. Launch EC2 instance (Ubuntu)
2. Create RDS PostgreSQL database
3. Configure security groups (firewall rules)
4. SSH into EC2 and deploy Docker containers
5. Update DATABASE_URL to point to RDS endpoint

---

### Option 3: Railway.app (Easiest, but Limited Free Tier)

**What it is**: Platform-as-a-Service (PaaS) that auto-deploys from GitHub.

**Steps**:
1. Connect GitHub repo to Railway
2. Railway auto-detects Docker setup
3. Add environment variables in Railway dashboard
4. Deploy with one click

**Pros**:
- Extremely easy
- Automatic deployments on git push
- Free tier available

**Cons**:
- Less control
- Can get expensive as you scale

---

### Option 4: Render.com (Good Balance)

**What it is**: Modern PaaS with Docker support and managed databases.

**Steps**:
1. Create account on Render.com
2. Create PostgreSQL database (managed)
3. Create Web Service from Docker
4. Connect to GitHub repo
5. Set environment variables
6. Deploy

**Pros**:
- Easy setup
- Managed database
- Free tier for testing

---

## Understanding the Deployment Flow

### Local Development (Current)
```
Your PC
├── Docker Desktop running
├── start_docker.bat executes
│   └── docker-compose up --build -d
├── Containers start on localhost
│   ├── Frontend: http://localhost:3000
│   ├── Backend: http://localhost:8001
│   └── Database: localhost:5432
└── Browser opens automatically (your PC)
```

### Production Deployment
```
Remote Server (e.g., DigitalOcean)
├── Docker installed
├── You SSH in and run: docker-compose -f docker-compose.prod.yml up -d
├── Containers start on server
│   ├── Frontend: http://server-ip:3000
│   ├── Backend: http://server-ip:8001
│   └── Database: server-ip:5432
├── Nginx reverse proxy (optional)
│   └── Routes https://yourdomain.com → Frontend
│       Routes https://yourdomain.com/api → Backend
└── Users access via: https://yourdomain.com
    (No browser auto-open - users type URL manually)
```

---

## Key Differences Summary

| Aspect | Local Development | Production |
|--------|------------------|------------|
| **Command** | `start_docker.bat` | `docker-compose -f docker-compose.prod.yml up -d` |
| **Access** | `localhost:3000` | `https://yourdomain.com` |
| **Database** | Docker container | Docker OR managed service |
| **Secrets** | `.env` (local) | `.env.production` (server) |
| **Live Reload** | ✅ Enabled (volumes) | ❌ Disabled |
| **Mode** | `npm run dev` | `npm start` |
| **Browser Open** | ✅ Auto-opens | ❌ Users navigate manually |
| **SSL** | ❌ Not needed | ✅ Required (HTTPS) |
| **Backups** | ❌ Optional | ✅ Critical |

---

## Next Steps for Learning

1. **Practice Local Docker** ✅ (You're doing this now!)
   - Understand how containers work
   - Experiment with docker-compose commands
   - Learn to read logs: `docker-compose logs -f`

2. **Set Up a Test Server** (Recommended)
   - Create a free/cheap DigitalOcean droplet
   - Practice SSH access
   - Deploy a simple "Hello World" container

3. **Learn Docker Commands**
   ```bash
   docker ps                    # List running containers
   docker logs <container-id>   # View container logs
   docker exec -it <id> bash    # Enter container shell
   docker-compose down          # Stop all services
   docker system prune          # Clean up unused resources
   ```

4. **Study Environment Variables**
   - Understand why secrets shouldn't be in code
   - Learn about `.env` files
   - Practice using `${VARIABLE}` syntax

5. **Explore Deployment Platforms**
   - Try Railway.app (easiest)
   - Then try DigitalOcean (more control)
   - Eventually explore AWS (industry standard)

---

## Troubleshooting Common Issues

### "Connection Refused" in Production
- Check firewall rules (ports 80, 443 must be open)
- Verify containers are running: `docker ps`
- Check logs: `docker-compose logs backend`

### "Database Connection Failed"
- Verify DATABASE_URL is correct
- Check if database container is running
- Ensure backend can reach database (network connectivity)

### "502 Bad Gateway" (with Nginx)
- Backend might not be running
- Check Nginx configuration
- Verify proxy_pass URLs are correct

### "Environment Variables Not Working"
- Make sure `.env.production` is in the same directory as docker-compose
- Use `docker-compose config` to verify variables are loaded
- Restart containers after changing .env

---

## Resources

- **Docker Documentation**: https://docs.docker.com/
- **Docker Compose Reference**: https://docs.docker.com/compose/
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **FastAPI Deployment**: https://fastapi.tiangolo.com/deployment/
- **DigitalOcean Tutorials**: https://www.digitalocean.com/community/tutorials
- **Let's Encrypt (Free SSL)**: https://letsencrypt.org/

---

## Questions to Ask Yourself Before Deploying

1. **Where will my users access this?**
   - Just me? → Simple droplet is fine
   - Team? → Consider staging + production environments
   - Public? → Need SSL, monitoring, backups

2. **How much traffic do I expect?**
   - Low → Single server is fine
   - High → Need load balancing, scaling

3. **What's my budget?**
   - $0 → Railway/Render free tier (limited)
   - $5-20/month → DigitalOcean droplet
   - $50+/month → AWS with managed services

4. **Do I need a custom domain?**
   - Yes → Buy domain, configure DNS
   - No → Use platform-provided URL

5. **How important is uptime?**
   - Critical → Need monitoring, backups, redundancy
   - Testing → Basic setup is fine

---

## Final Notes

**Remember**: The `.bat` files are just convenience scripts for YOUR local machine. They make YOUR life easier during development. When you deploy to a server:

1. The server doesn't have a desktop/browser to open
2. You'll SSH into the server and run Docker commands directly
3. Users will access your app via a URL (not localhost)
4. Everything else (the Docker containers) works the same!

**You're on the right track!** Understanding the difference between local development and production is a crucial step in becoming a full-stack developer. Take your time, experiment, and don't be afraid to break things in development - that's how you learn! 🚀

---

*Last Updated: 2025-12-04*
*Project: Campaign Studio*
*Author: Generated for learning purposes*
