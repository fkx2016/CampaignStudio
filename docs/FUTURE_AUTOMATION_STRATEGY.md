# Future Automation Strategy: The "App Factory" 🏭

## Objective
To enable the rapid deployment of hundreds of "Campaign Studio" style applications (Next.js + FastAPI + Postgres) with zero manual configuration.

## The Solution: GitHub Actions + Infrastructure as Code (IaC)

Instead of manually clicking through Vercel and Railway dashboards, we will use GitHub Actions to orchestrate the entire process.

### 1. The "Golden Template" Repository
Create a master repository containing:
- The full source code.
- A `.github/workflows/deploy.yml` file.
- A `railway.toml` file (defining the infrastructure).
- A `vercel.json` file (defining the frontend).

### 2. The Automation Workflow (`deploy.yml`)
This workflow will trigger on every push to `main`.

#### Job 1: Infrastructure Provisioning (Railway)
- **Tool:** Railway CLI (via GitHub Action)
- **Steps:**
    1.  Login using `RAILWAY_TOKEN` (Secret).
    2.  `railway up` (Deploys Backend + Database).
    3.  `railway variables get --json > env_vars.json` (Captures the new Backend URL).

#### Job 2: Frontend Deployment (Vercel)
- **Tool:** Vercel CLI (via GitHub Action)
- **Steps:**
    1.  Login using `VERCEL_TOKEN` (Secret).
    2.  Read `env_vars.json` from Job 1.
    3.  `vercel env add NEXT_PUBLIC_API_URL [BACKEND_URL]` (Automatically links them).
    4.  `vercel --prod` (Deploys the Frontend).

#### Job 3: Closing the Loop (CORS)
- **Tool:** Railway CLI
- **Steps:**
    1.  Get the Vercel URL from Job 2.
    2.  `railway variables set ALLOWED_ORIGINS=[VERCEL_URL]` (Automatically configures CORS).

### 3. The "One-Click" Experience
For every new app:
1.  **Clone:** Click "Use this Template" in GitHub.
2.  **Configure:** Add `RAILWAY_TOKEN` and `VERCEL_TOKEN` to Repo Secrets.
3.  **Push:** Make one commit.
4.  **Done:** The entire stack spins up, connects, and deploys automatically.

## Next Steps to Implement
1.  Generate a **Railway API Token** (Account Settings).
2.  Generate a **Vercel Access Token** (Account Settings).
3.  Write the `deploy.yml` script (I can assist with this when you are ready).
