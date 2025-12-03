# 🎓 Campaign Studio: Migration & Architecture Notes for Students

## 1. Context: The "Graduation"
We have moved from `CampaignPosterMVP` to `CampaignStudio`.
- **Old State:** A prototype focused on proving the concept. Often single-file scripts or loosely organized code.
- **New State:** A "SaaS-ready" structure. This folder is designed to scale, handle real users, and be deployed to the cloud.

## 2. Architecture Breakdown
We are using a **Decoupled Full-Stack Architecture**.

### 🖥️ Frontend: Next.js 14 (The "Storefront")
- **Location:** `/next-gen-app`
- **Role:** Handles what the user sees and interacts with.
- **Why Next.js?** It offers server-side rendering (better SEO), routing, and a robust framework for React.
- **Key Tech:** React, TypeScript (for safety), Tailwind CSS (for styling).

### ⚙️ Backend: FastAPI (The "Engine")
- **Location:** `/backend`
- **Role:** Handles the logic, data processing, and database connections.
- **Why FastAPI?** It's incredibly fast (as the name implies), auto-generates API documentation (Swagger UI), and is Python-based (great for AI integration).

## 3. The Roadmap Explained (The "Why")

The `README_SAAS.md` lists several next steps. Here is why they matter:

### A. Database: SQLite ➡️ PostgreSQL (Supabase)
- **SQLite:** Great for local testing, but it's just a file. It struggles when multiple users try to write at the same time.
- **PostgreSQL:** A robust, server-based database. It handles thousands of concurrent connections and is the industry standard for SaaS.

### B. Storage: Local Disk ➡️ Cloud Storage (S3/Supabase)
- **Local:** If you deploy your backend to a server (like Render) and it restarts, *local files are often wiped*.
- **Cloud:** Storing images/videos in the cloud ensures they persist forever and can be served via a global CDN (Content Delivery Network).

### C. Config: Hardcoded URLs ➡️ Environment Variables
- **Problem:** If code says `fetch('http://localhost:8001')`, it breaks when you deploy to the web (where `localhost` doesn't exist).
- **Solution:** We use `process.env.NEXT_PUBLIC_API_URL`.
    - Locally, it equals `http://localhost:8001`.
    - In Production, it equals `https://my-api.railway.app`.

## 4. Immediate Checklist for You
1.  **Read the README:** Check `README_SAAS.md` for the exact commands.
2.  **Install Dependencies:** You need to install libraries for *both* Python (backend) and Node (frontend).
3.  **Run Two Terminals:** You cannot run the whole app in one window. One terminal runs the API, the other runs the UI.

---
*Prepared by Antigravity Agent*
