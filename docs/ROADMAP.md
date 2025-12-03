# 🗺️ Campaign Studio Roadmap
**Status:** Active
**Last Updated:** 2025-12-03

---

## ✅ Phase 1: The Steel Foundation (Completed)
**Goal:** Establish a resilient, containerized environment.
*   [x] **Dockerization:** Full stack (Frontend, Backend, DB) running in containers.
*   [x] **Stability:** Fixed Authentication, Database Schema, and Process Leaks.
*   [x] **Data Recovery:** Imported 50+ legacy posts into the new schema.
*   [x] **Protocol:** Ratified the [CoCoding Protocol](THE_COCODING_PROTOCOL.md) and [Docker Manifesto](DOCKER_MANIFESTO.md).
*   [x] **Basic Workflow:** "Draft -> Edit -> Accept" loop implemented in UI.

---

## 🚧 Phase 2: The AI Brain (Next Priority)
**Goal:** Integrate Local LLMs and MCP to make the app "Smart" without relying solely on external APIs.
*   [ ] **Dockerized Model Runner:**
    *   Add `ollama` service to `docker-compose.yml`.
    *   Enable GPU passthrough (if available) or CPU optimization.
    *   Connect Backend to Ollama service for zero-cost generation.
*   [ ] **MCP (Model Context Protocol) Integration:**
    *   Explore MCP for standardized context fetching.
    *   Implement "MCP Clients" within the Docker network to query data safely.
*   [ ] **AI Content Refinement:**
    *   Upgrade "AI Rewrite" button to use the local model.
    *   Implement "Image Prompt Generator" using local LLM.

---

## 🔮 Phase 3: The Real World Connection
**Goal:** Connect the studio to actual social media platforms.
*   [ ] **Social API Integration:**
    *   Connect to X (Twitter) API.
    *   Connect to LinkedIn API.
*   [ ] **"One-Click Post":**
    *   Upgrade the "Accept" button to actually trigger a social media post.
*   [ ] **Analytics Dashboard:**
    *   Pull engagement metrics back into the Studio.

---

## 🛡️ Long Term Vision
*   **Multi-Agent Orchestration:** Multiple AI agents (Writer, Editor, Compliance) working together in the background.
*   **SaaS Deployment:** Deploying the Docker stack to a cloud provider (AWS/DigitalOcean).
