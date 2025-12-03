# 🤖 Agent Context & Operational Protocols

This file serves as the **Local Project Mission** for `CampaignStudio`.

## 🧬 Context Hierarchy (Two-Tier System)

### Tier 1: Global Constitution (The "Base Layer")
*   **File:** `docs/AMPA_GLOBAL_CONTEXT.md` (⚠️ **ACTION REQUIRED:** User to copy massive context file here)
*   **Role:** Contains universal standards, coding styles, and "institutional memory" from previous projects.
*   **Rule:** If this file exists, I must read it first to understand the user's core philosophy.

### Tier 2: Local Project Mission (This File)
*   **Role:** Specific instructions for *this* SaaS migration project.
*   **Precedence:** If a specific instruction here conflicts with Tier 1 (e.g., "Use PostgreSQL" vs "Use SQLite"), **Tier 2 wins**.

---

## 📌 Critical Local Instructions (ALWAYS FOLLOW)

### 1. 🔗 Clickable Links Mandate
**Rule:** Whenever you mention a URL, especially `localhost` addresses, you **MUST** format it as a clickable Markdown link.
- **Why?** To allow the user to open the app with a single click.
- **Format:** `[Label](URL)` or `[URL](URL)`
- **Examples:**
    - ✅ `[http://localhost:3000](http://localhost:3000)`
    - ✅ `[Open API Docs](http://localhost:8001/docs)`

### 2. 🚀 Server Management
- **Backend:** `uvicorn backend.main:app --reload --port 8001`
- **Frontend:** `npm run dev` (in `/next-gen-app`)
- **Action:** When asked to "start the app", run both in the background.

### 3. 💡 Ideation Protocol (Separation of Concerns)
**Rule:** When the user proposes a new idea, categorize it immediately:
1.  **Is it Reusable?** (e.g., Auth, Billing, Admin Panel) -> Add to `docs/IDEAS_GLOBAL_TEMPLATE.md`
2.  **Is it Specific?** (e.g., Social Media APIs, Content Gen) -> Add to `docs/IDEAS_PROJECT_SPECIFIC.md`
**Goal:** To build a reusable "SaaS Engine" while simultaneously building the "Campaign Studio" product.

## 📂 Project Context
- **Project Name:** Campaign Studio (SaaS Edition)
- **Goal:** Migration from MVP to Scalable SaaS.
- **Tech Stack:** FastAPI (Backend) + Next.js 14 (Frontend).
