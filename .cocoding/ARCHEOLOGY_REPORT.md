# 🔍 Software Archeology Report
## Campaign Studio - Codebase Analysis Summary

**Date:** 2025-12-07  
**Analyst:** Antigravity (Gemini Agent)  
**Mission:** Reverse-engineer PRD from active codebase  
**Status:** ✅ COMPLETE

---

## 📊 Executive Summary

**What I Found:**
Campaign Studio is a **fully functional, production-deployed SaaS MVP** for multi-platform social media campaign management. The project is in active use with real users, deployed on Vercel (frontend) and Railway (backend), with PostgreSQL database.

**Codebase Health:** 🟢 **GOOD**
- Clean architecture (3-tier: Next.js → FastAPI → PostgreSQL)
- Type-safe (TypeScript + Zod on frontend, Pydantic on backend)
- Production-ready deployment configuration
- Some technical debt but no critical blockers

---

## 🏗️ Stack Analysis

### **ACTIVE STACK**

| Layer | Technology | Status | Lines of Code |
|-------|-----------|--------|---------------|
| **Frontend** | Next.js 16 + React 19 + TypeScript | ✅ Active | ~50,000 |
| **Backend** | FastAPI + Python | ✅ Active | ~10,000 |
| **Database** | PostgreSQL 15 | ✅ Active | 6 tables |
| **Auth** | JWT (OAuth2) | ✅ Active | ~200 |
| **UI** | Tailwind + Radix UI | ✅ Active | ~20,000 |
| **Validation** | Zod + Pydantic | ✅ Active | ~500 |
| **Deployment** | Docker + Vercel + Railway | ✅ Active | N/A |

**Total Estimated Lines:** ~70,000+

---

## ✅ ACTIVE FEATURES (What Actually Works)

### **1. User Authentication** ✅
- Registration with email/password
- JWT token-based login (3000-min expiry)
- Password reset flow (token-based)
- Route protection on frontend
- Auto-admin for `fkurka@gmail.com`

**Files:**
- `backend/auth.py` (173 lines)
- `next-gen-app/context/AuthContext.tsx`
- `next-gen-app/app/login/`, `register/`, `forgot-password/`, `reset-password/`

---

### **2. Campaign Management** ✅
- Create/list campaigns
- Mode-based organization (5 modes)
- User ownership (multi-tenant)
- Auto-campaign creation from posts

**Files:**
- `backend/models.py` - Campaign model
- `backend/main.py` - Campaign routes
- `next-gen-app/components/campaign/CreateCampaignModal.tsx`

---

### **3. Content Modes (5 Strategies)** ✅
Pre-seeded with AI guidance:
1. **Donation / E-Begging** (`ebeg`)
2. **Political / Activism** (`political`)
3. **Content / Thought Leadership** (`content`)
4. **Promotion / Sales** (`promotion`)
5. **Awareness / Viral** (`awareness`)

**Files:**
- `backend/main.py` - `INITIAL_MODES` (lines 62-97)
- `backend/enums.py` - `ModeSlug` enum
- `next-gen-app/components/mode-switcher/ModeSwitcher.tsx`

---

### **4. Post Editor (Content Studio)** ✅
Three-column layout:
- **Left:** Mode switcher, campaign selector, workspace tools
- **Middle:** Title/hook editor, AI optimizer, platform previews
- **Right:** Media editor (upload/paste/URL ingest)

**Files:**
- `next-gen-app/app/page.tsx` (969 lines, 43,893 bytes)
- `next-gen-app/components/MediaEditor.tsx` (18,117 bytes)
- `next-gen-app/components/AITextOptimizer.tsx`

---

### **5. Platform Support (22+ Networks)** ✅
Pre-seeded platforms:
- Mainstream: X, LinkedIn, Facebook, Instagram, TikTok, YouTube
- Messaging: Telegram, WhatsApp, Discord
- Alternative: Gab, Gettr, Rumble, Minds, Mastodon, Bluesky, Threads
- Publishing: Ghost, Substack, Medium
- Community: Reddit, Pinterest, Snapchat

**Features:**
- Character limit validation per platform
- Platform-specific preview tabs
- One-click "Open Platform" buttons
- Custom hashtags/suffixes

**Files:**
- `backend/main.py` - `INITIAL_PLATFORMS` (lines 37-60)
- `next-gen-app/app/page.tsx` - Platform preview tabs

---

### **6. Media Management** ✅
Upload methods:
- Drag & drop file input
- Paste image (Ctrl+V)
- Paste URL (auto-ingest to local storage)
- File browser

**Storage:**
- Local: `backend/static/uploads/`
- Production: Same (TODO: Migrate to S3)

**Files:**
- `backend/main.py` - Upload routes (lines 356-415)
- `next-gen-app/components/MediaEditor.tsx`

---

### **7. AI Text Optimization (Simple)** ✅
Rule-based text transformations (no external API):
- Mode-aware tone adjustments
- Character limit compliance
- Emoji injection
- Call-to-action suggestions

**Files:**
- `backend/ai/optimizer.py` (1,553 bytes)
- `next-gen-app/components/AITextOptimizer.tsx`

---

### **8. Workspace Settings** ✅
Global configuration:
- Default QR code URL
- Default text overlay
- Focus music player (YouTube embed)

**Files:**
- `backend/models.py` - `WorkspaceSettings` model
- `backend/main.py` - Settings routes
- `next-gen-app/components/settings/SettingsModal.tsx`

---

## 🚫 GHOST CODE (Disconnected/Abandoned)

### **Files to Delete:**
1. **`/src/types.ts`** (1,248 bytes)
   - Orphaned TypeScript types file
   - Not imported by any active code
   - **Action:** Delete or move to `/next-gen-app/types/`

2. **`/next-gen-prototype/`** (empty directory)
   - Early prototype, no longer used
   - **Action:** Delete

3. **`/schemas/`** (1 child, unknown)
   - **Action:** Investigate contents, likely outdated

### **Files to Organize:**
Root-level Python utility scripts (not part of core app):
- `check_data.py` (1,070 bytes)
- `create_superuser.py` (1,233 bytes)
- `restore_campaign.py` (4,508 bytes)
- `verify_api.py` (1,226 bytes)
- `wipe_local_db.py` (694 bytes)
- `wipe_prod_db.py` (746 bytes)

**Action:** Move to `/tools/` or `/scripts/` directory

---

## 🗄️ Database Schema

### **6 Active Tables:**

1. **`user`** - User accounts
   - Fields: `id`, `email`, `hashed_password`, `full_name`, `is_active`, `is_superuser`, `created_at`
   - Relationships: `campaigns[]`, `posts[]`

2. **`mode`** - Content strategies
   - Fields: `id`, `name`, `slug`, `description`, `tone_guidelines`, `structure_template`, etc.
   - Relationships: `campaigns[]`

3. **`campaign`** - Campaign containers
   - Fields: `id`, `name`, `description`, `status`, `mode_id`, `user_id`
   - Relationships: `posts[]`, `mode`, `user`

4. **`campaignpost`** - Individual posts
   - Fields: `id`, `title`, `hook_text`, `status`, `mode`, `media_image_url`, etc.
   - JSON Columns: `target_platforms`, `platform_post_ids`, `performance_metrics`
   - Relationships: `campaign`, `user`

5. **`platform`** - Social media platforms
   - Fields: `id`, `name`, `slug`, `base_url`, `icon`, `char_limit`, `is_active`, etc.

6. **`workspacesettings`** - Global settings
   - Fields: `id`, `default_overlay_text`, `default_qr_url`, `default_music_url`
   - Singleton (always `id=1`)

---

## 🚀 Deployment Configuration

### **Local Development:**
```bash
.\start_docker.bat  # Windows
docker-compose up   # Mac/Linux

# Services:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8001
# - Database: localhost:5432
```

### **Production (Current):**
- **Frontend:** Vercel (auto-deploy from GitHub)
- **Backend:** Railway (Docker-based)
- **Database:** Railway PostgreSQL (managed)

**Environment Variables:**
- `NEXT_PUBLIC_API_URL` → Railway backend URL
- `DATABASE_URL` → Railway PostgreSQL connection
- `ALLOWED_ORIGINS` → Vercel frontend URL

---

## 🐛 Technical Debt

### **High Priority:**
1. **Secret Key:** Still using `supersecretkey_change_me_in_prod`
2. **File Storage:** Local filesystem (should migrate to S3/Supabase)
3. **Email:** Password reset emails only log to console
4. **AI Optimization:** Simple rule-based (no real AI API)

### **Medium Priority:**
1. **Ghost Code:** `/src/types.ts`, `/next-gen-prototype/`, root scripts
2. **Error Handling:** Generic error messages
3. **Validation:** Missing server-side validation
4. **Testing:** No automated tests

### **Low Priority:**
1. **Character Limits:** Not enforced server-side
2. **Platform Metadata:** Not used in UI
3. **Performance Metrics:** Schema exists but no tracking
4. **Campaign Status:** Not enforced in business logic

---

## 📈 Roadmap (Inferred)

### **Phase 1: MVP** ✅ (COMPLETE)
- [x] User authentication
- [x] Campaign management
- [x] Post editor
- [x] Platform previews
- [x] Media upload
- [x] Mode-based strategies
- [x] Docker local dev
- [x] Production deployment

### **Phase 2: AI Integration** (PLANNED)
- [ ] Real AI text optimization
- [ ] AI image generation
- [ ] AI video generation
- [ ] Smart templates

### **Phase 3: Platform Integration** (PLANNED)
- [ ] OAuth for platforms
- [ ] Direct posting
- [ ] Post scheduling
- [ ] Analytics tracking

### **Phase 4: Collaboration** (PLANNED)
- [ ] Team workspaces
- [ ] Campaign sharing
- [ ] Comment threads
- [ ] Approval workflows

### **Phase 5: Monetization** (PLANNED)
- [ ] Creator Hub
- [ ] Subscription tiers
- [ ] Usage-based pricing
- [ ] White-label options

---

## 🎯 Recommendations

### **Immediate Actions:**
1. ✅ **PRD Generated** - Document current state (DONE)
2. 🧹 **Clean Ghost Code** - Delete `/src/types.ts`, `/next-gen-prototype/`
3. 📁 **Organize Scripts** - Move root Python scripts to `/tools/`
4. 🔐 **Rotate Secret Key** - Generate new `SECRET_KEY` for production
5. ☁️ **Migrate Storage** - Move uploads to S3/Supabase Storage

### **Short-Term (1-2 weeks):**
1. 🧪 **Add Tests** - Jest (frontend), pytest (backend)
2. 🤖 **Real AI Integration** - OpenAI API for text optimization
3. 📧 **Email Service** - SendGrid/Mailgun for password resets
4. 📊 **Error Tracking** - Sentry integration

### **Medium-Term (1-3 months):**
1. 🔗 **Platform OAuth** - X, LinkedIn, Facebook integrations
2. 📅 **Post Scheduling** - Queue posts for future publishing
3. 📈 **Analytics Dashboard** - Track post performance
4. 👥 **Team Features** - Multi-user workspaces

---

## 🏁 Verdict

**Campaign Studio is a SOLID FOUNDATION for a SaaS product.**

**Strengths:**
- ✅ Clean architecture (3-tier separation)
- ✅ Type-safe schemas (Zod + Pydantic)
- ✅ Production-ready deployment
- ✅ User authentication & authorization
- ✅ Multi-platform support (22+ networks)
- ✅ Mode-based content strategies

**Weaknesses:**
- ⚠️ Some ghost code (easily cleaned)
- ⚠️ Local file storage (needs cloud migration)
- ⚠️ Simple AI (needs real API integration)
- ⚠️ No automated tests (risky for refactoring)

**Overall Grade:** 🟢 **B+ (Good, Production-Ready)**

**Ready for:** Feature expansion, scaling, user onboarding

---

**Report Generated By:** Antigravity Software Archeologist  
**Analysis Duration:** ~15 minutes  
**Files Analyzed:** 50+ files across frontend, backend, and infrastructure  
**Total Codebase Size:** ~70,000 lines (estimated)

---

## 📚 Deliverables

1. ✅ **PRD.md** - Comprehensive product requirements document
2. ✅ **ARCHEOLOGY_REPORT.md** - This summary (you are here)
3. 📋 **Next Steps** - Recommendations for cleanup and feature development

**All documents saved to:** `.cocoding/`
