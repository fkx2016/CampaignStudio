# 🛡️ Engineering Doctrine & Evolution Protocol
**Version:** 1.0
**Date:** 2025-12-03
**Status:** RATIFIED

---

## 📖 Preamble
This document serves as the "Constitution" for all future development within this workspace. It was forged from the lessons learned during the "Great Collapse" of December 2025, where a lack of infrastructure discipline led to a critical failure of the CampaignStudio application.

**The Golden Rule:**
> *"Am I building on a solid layer?"*
> If the answer is "I think so," **STOP**. Verify the layer below. Lock dependencies. Dockerize. *Then* build.

> *See also: [The Docker Manifesto](DOCKER_MANIFESTO.md) for the required mindset shift.*

---

## 🏗️ The 4-Stage Evolution Protocol
We do not build features until the foundation is cured concrete. We follow this strict sequence for all new projects or major refactors.

### Stage 1: The Steel Skeleton (Infrastructure First)
**Goal:** A boring, empty app that runs perfectly in a reproducible environment.
*   **Actions:**
    *   Initialize git repository.
    *   Create `docker-compose.yml` immediately. **No bare-metal development.**
    *   Connect an empty Frontend to an empty Backend.
    *   Connect the Backend to the Database container.
*   **The Gatekeeper Test:**
    *   [ ] Can I run `docker-compose up` on a fresh machine and see "Hello World" from the API?
    *   [ ] Does `docker-compose down -v` successfully wipe the slate clean?

### Stage 2: The Data Foundation (Schema & Migrations)
**Goal:** The "Brain" of the app is defined and mutable.
*   **Actions:**
    *   Define core SQLModels (`User`, `Post`, etc.).
    *   **Initialize Alembic** for migrations. Do not rely on `db.create_all()` for production-intent apps.
    *   Generate and apply the initial migration.
*   **The Gatekeeper Test:**
    *   [ ] Can I add a column to a model and generate a migration script without data loss?
    *   [ ] Does the database persist data across container restarts?

### Stage 3: The "Tracer Bullet" (End-to-End Feature)
**Goal:** Prove the logic layer works before adding complexity.
*   **Actions:**
    *   Build *one* simple, vertical slice of functionality (e.g., "Create a Post").
    *   **No Authentication yet.** No complex UI.
    *   Input -> API -> DB -> Screen.
*   **The Gatekeeper Test:**
    *   [ ] Can I perform the action and see the result persist?
    *   [ ] Are dependencies pinned in `requirements.txt` immediately after success?

### Stage 4: The Gatekeeper (Authentication & Security)
**Goal:** Secure the application.
*   **Actions:**
    *   Implement Login/Register flows.
    *   Wrap existing "Tracer Bullet" routes with `Depends(get_current_user)`.
    *   Implement Role-Based Access Control (RBAC) if needed.
*   **The Gatekeeper Test:**
    *   [ ] Does the app reject unauthenticated requests?
    *   [ ] Can I register a new user and log in without errors?

---

## 🚫 Anti-Patterns (The "Seven Deadly Sins")

1.  **The "Ghost" Database:** Switching between local SQLite and Docker Postgres without clear config boundaries.
    *   *Fix:* Use Environment Variables (`DATABASE_URL`) exclusively.
2.  **Dependency Drift:** Installing packages without pinning versions (`pip install fastapi`).
    *   *Fix:* Run `pip freeze > requirements.txt` immediately after a feature works.
3.  **The "Zombie" Process:** Running servers in background terminals on Windows.
    *   *Fix:* Use Docker. When the container dies, the process dies.
4.  **Premature Optimization:** Building complex UI before the API is tested.
    *   *Fix:* Build the API first, test with Swagger/Postman, *then* build the UI.
5.  **The "Works on My Machine":** Relying on local system paths or global installs.
    *   *Fix:* If it's not in the `Dockerfile`, it doesn't exist.

---

## 💀 Case Study: The Collapse of Dec '25
**The Incident:**
The application failed to authenticate users and crashed during startup after a "Hard Reset."

**The Root Causes:**
1.  **Schema Mismatch:** The `reset_db.py` script deleted a local SQLite file, but the app was connecting to a Postgres instance. The code expected an `is_superuser` column that didn't exist in the Postgres DB.
2.  **Dependency Conflict:** `bcrypt` updated to v5.0.0, breaking compatibility with `passlib`. This "time bomb" went off because versions were not pinned.
3.  **Process Leaks:** Old backend processes were holding onto ports, preventing the new code from running.

**The Resolution:**
*   Implemented Docker to enforce clean state and process isolation.
*   Updated reset scripts to use `SQLModel.metadata.drop_all()` for database-agnostic resets.
*   Pinned `bcrypt==4.0.1` to resolve the conflict.

---

*This document is to be reviewed before starting any new module or project.*
