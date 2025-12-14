# Hybrid Client-Server Architecture Standards

## Overview
This document defines the architectural standards for building "Hybrid" web applications that function seamlessly in both **Local Desktop** environments (localhost) and **Cloud SaaS** environments (Vercel/Railway) without code changes.

## 1. The "Centralized Config" Rule (Frontend)
**Rule:** Frontend code must NEVER contain hardcoded `http://localhost` URLs.
**Implementation:**
- Create a single source of truth for the API URL (e.g., `lib/api.ts`).
- This file must check `process.env.NEXT_PUBLIC_API_URL` first.
- It must provide a fallback to `localhost` for development convenience.

**Standard Pattern (`lib/api.ts`):**
```typescript
// ✅ CORRECT
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

// ❌ INCORRECT
fetch("http://localhost:8001/api/users");
```

## 2. The "Dynamic Origins" Rule (Backend)
**Rule:** The Backend must NOT hardcode CORS origins.
**Implementation:**
- Use an environment variable (e.g., `ALLOWED_ORIGINS`) to define permitted domains.
- In `main.py` (FastAPI), split this string into a list.
- Fallback to `["*"]` ONLY if the environment variable is missing (Development Mode).

**Standard Pattern (`main.py`):**
```python
# ✅ CORRECT
import os
from fastapi.middleware.cors import CORSMiddleware

origins_env = os.getenv("ALLOWED_ORIGINS")
if origins_env:
    origins = origins_env.split(",")
else:
    origins = ["*"] # Default for local dev

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    # ...
)
```

## 3. The "Environment Parity" Rule
**Rule:** Local development and Production must use the same Environment Variable names.
**Implementation:**
- **Vercel (Production):** Set `NEXT_PUBLIC_API_URL` to the Railway URL (e.g., `https://my-app.up.railway.app`).
- **Railway (Production):** Set `ALLOWED_ORIGINS` to the Vercel URL (e.g., `https://my-app.vercel.app`).
- **Local (Development):** No `.env` file is strictly required if the code defaults to `localhost`, BUT if one is used, it must use the same variable names.

## 4. The "Relative vs Absolute" Rule
**Rule:** Always use Absolute URLs for API calls in a decoupled architecture.
**Reasoning:** In a decoupled stack, Frontend (Port 3000) and Backend (Port 8001) are distinct services. Relative URLs (e.g., `/api/users`) will try to hit Port 3000 and fail.

## Checklist for New Features
- [ ] Did I import `API_BASE_URL` instead of typing a string?
- [ ] Did I add any new environment variables to both Vercel and Railway?
- [ ] Does the feature work if I disconnect the internet (Local Mode)?

## 5. Operational Gotchas & Deployment Checklist
Even with perfect code, these configuration errors can break the application in Production.

### ⚠️ The "Trailing Slash" Trap
**Issue:** CORS headers are strict string matches.
**Rule:** When setting `ALLOWED_ORIGINS` in Railway/Backend, do **NOT** include a trailing slash.
- ✅ `https://campaign-studio.vercel.app`
- ❌ `https://campaign-studio.vercel.app/`

### ⚠️ The "Mixed Content" Blocker
**Issue:** Modern browsers block HTTP requests initiated from an HTTPS page.
**Rule:** Your `NEXT_PUBLIC_API_URL` (in Vercel) MUST start with `https://`.
- ✅ `https://my-backend.up.railway.app`
- ❌ `http://my-backend.up.railway.app`

### ⚠️ The "Cold Start" Timeout
**Issue:** Serverless backends (like Railway Starter) spin down after inactivity.
**Symptom:** The first request (e.g., Login) might fail with a timeout or 500 error.
**Solution:** This is expected behavior on free tiers. Wait 30 seconds for the container to wake up and try again. Do not panic and start debugging code immediately.

## 6. Pre-Deployment Audit Protocol
Before committing any code for deployment, you MUST run the "Localhost Audit" to catch any hardcoded URLs that slipped through.

**The "Grep Test":**
Run this command in your terminal root:
`grep -r "localhost" .`

**Pass Criteria:**
- ✅ `README.md` (Documentation is allowed)
- ✅ `lib/config.ts` (Fallback definitions are allowed)
- ✅ `lib/api.ts` (Fallback definitions are allowed)
- ❌ **ANY** other file (Components, Pages, Utils) containing "localhost" is a FAIL.

## 7. Security Roadmap & Demo Mode Risks
**Current State (MVP):**
To facilitate easy testing, the Backend API routes (GET/POST) are currently **PUBLIC**.
- The Frontend implements a "Demo Mode" that bypasses the Login screen by setting a fake client-side token.
- This allows anonymous users to interact with the real backend.

**⚠️ SECURITY WARNING:**
This configuration is **NOT SAFE** for a high-stakes production environment.
- Anyone can send requests to your API if they know the URL.
- There is no rate limiting or user validation on the backend for these routes.

**Future Hardening Plan:**
1.  **Lock Down Routes:** Add `Depends(get_current_user)` to all sensitive FastAPI routes.
2.  **Demo User:** Create a specific "Demo User" in the database with restricted permissions (e.g., read-only or reset daily).
3.  **Backend Auth:** Update the "Demo Mode" button to actually authenticate as this Demo User, rather than faking it on the client.


