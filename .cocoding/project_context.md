# Project Identity
**Project Name:** CampaignStudio (fka CampaignManager)
**Mission:** The AI Cockpit for Creators (Donation & Campaign Management).
**Stack:** Next.js (Frontend), FastAPI (Backend), PostgreSQL (DB), Docker Compose.

## 🚀 Current Status (2025-12-07)
- **Infrastructure:** Docker environment fully operational on Windows.
- **Authentication:** 
  - Real JWT Authentication enabled via `/auth/token`.
  - Admin User: `fkurka@gmail.com` (Superuser).
  - Login Flow: Fixed loop issue by implementing `NewAuthContext` and enabling real fetch logic in Login Page.
- **Admin Dashboard:** 
  - Located at `/admin`.
  - Accessible via **Shield Icon** in Studio Header (visible to superusers).
  - Features: User List, Basic Stats (Placeholder).
- **Known Quirks:**
  - **Windows Volume Mounts:** File syncing is unreliable. Use `docker cp` to update files inside containers if `npm run dev` doesn't pick up changes.
  - **Hydration Mismatches:** Visible in console, likely due to browser extensions (Dark Reader). Use Incognito for clean testing.

## ✅ Completed Objectives
- [x] Troubleshoot Login Loop (Resolved)
- [x] Verify DB Connection (Connected to local Postgres)
- [x] Confirm Admin Credentials
- [x] Access Admin Dashboard

## 🔜 Next Steps
1. **Docker Deep Dive:** Explain the "Universal Package Delivery System" concept (Dev Containers, Images vs. Code, Host Binding).
2. **Cloud Fix:** Troubleshoot Railway/Vercel CORS issue (likely trailing slash or header stripping).
3. Remove debug alerts from `NewAuthContext.tsx` (Done locally, verify online).
4. Implement Analytics Tracking (per `PRD_GROWTH_ANALYTICS.md`).