# Architecture Strategy: From Desktop MVP to SaaS Platform

## 1. Executive Summary
This document outlines the strategic roadmap for evolving the **Campaign Poster** application from a single-user local desktop tool (Phase 1) into a multi-user SaaS platform (Phase 2). 

The core architectural goal is **"One Project, Two Faces."** We will maintain a single codebase for the business logic ("The Brain") while supporting multiple interfaces (Desktop GUI and Web App) to ensure no effort is wasted and features remain consistent across both versions.

## 2. Architectural Pattern: Hexagonal Architecture
We are adopting a **Hexagonal Architecture** (also known as Ports and Adapters). This decouples the core business logic from the external details (User Interface, Database, File Storage).

### The Structure
```text
CampaignPoster/
├── core/                  <-- THE SHARED BRAIN (Pure Python Logic)
│   ├── content.py         (Generates text/markdown)
│   ├── media.py           (Generates images, processes assets)
│   └── logic.py           (Business rules)
│
├── interfaces/            <-- THE PORTS (How users interact)
│   ├── desktop/           (Current: Tkinter GUI / manual_poster.py)
│   └── web/               (Future: FastAPI + HTML/HTMX)
│
└── adapters/              <-- THE ADAPTERS (How we store/talk to things)
    ├── storage_local.py   (Current: JSON files + Local Disk)
    └── storage_cloud.py   (Future: PostgreSQL + AWS S3)
```

## 3. The "Shared Brain" Strategy
The `core/` directory contains the "Truth" of the application. It does not know whether it is running on a laptop or a server. It simply receives inputs and returns outputs.

### Key Abstractions

#### A. Data Layer (The Repository Pattern)
*   **Problem:** Desktop uses `json`; SaaS uses `PostgreSQL`.
*   **Solution:** The Core asks for data via an abstract interface (e.g., `get_post(id)`).
    *   **Local Adapter:** Reads from `titles_and_hooks.json`.
    *   **Cloud Adapter:** Executes a SQL query.

#### B. Media Layer (Asset Management)
*   **Problem:** Desktop saves to `C:/Users/.../images`; SaaS cannot save to a transient server disk.
*   **Solution:** The Core delegates storage to a `MediaManager`.
    *   **Local Adapter:** Uses `shutil.copy()` to the local `images/` folder.
    *   **Cloud Adapter:** Uses `boto3` to upload to AWS S3 or Cloudinary.

#### C. User Context (Multi-Tenancy)
*   **Problem:** Desktop is single-user; SaaS is multi-user.
*   **Solution:** All Core functions accept a `user_context`.
    *   **Local:** Passes a default `user_id="local_admin"`.
    *   **SaaS:** Passes the authenticated `user_id` from the login session.

## 4. Phase 2 Tech Stack Recommendation
To maximize code reuse (Python) and minimize complexity, we recommend the following stack for the SaaS version:

*   **Backend:** **FastAPI**
    *   *Why:* Modern, high-performance, native Python type support. Can import our `core` modules directly.
*   **Frontend:** **HTMX + Jinja2 Templates**
    *   *Why:* Allows building dynamic, interactive web apps using mostly Python and HTML. Avoids the complexity of a separate React/Vue frontend codebase for this stage.
*   **Database:** **SQLite** (Dev) -> **PostgreSQL** (Prod)
    *   *Why:* Standard, reliable relational data storage.
*   **Authentication:** **Clerk** or **Auth0**
    *   *Why:* Offloads complex security/login/subscription flows to a managed provider.

## 5. Transition Plan
1.  **Refactor (Complete):** Move logic to `core/` (Done).
2.  **Abstract Data:** Create a `DataManager` class to wrap the JSON loading logic, preparing it to be swapped for a DB later.
3.  **Build Web Interface:** Create a `web_app.py` (FastAPI) alongside `manual_poster.py`.
4.  **Connect:** Wire the Web Interface to the existing `core` logic.
5.  **Migrate Data:** Write a script to import `titles_and_hooks.json` into the PostgreSQL database.

## 6. Conclusion
By adhering to this strategy, we ensure that every feature added to the Desktop version (e.g., a new "AI Video" generator) is immediately available to the SaaS version, as they share the same brain. We avoid the trap of maintaining two separate codebases.
