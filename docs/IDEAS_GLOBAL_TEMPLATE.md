# 🌐 Global SaaS Template Ideas

This document tracks features, patterns, and architectural decisions that are **generic and reusable**.
These are intended to be part of our "Base SaaS Template" for all future projects.

## 🎯 Criteria
*   Is this feature useful for *any* SaaS (e.g., a To-Do app, a CRM, a Video Editor)?
*   Does it solve a common problem (Auth, Payments, Settings)?
*   If yes, add it here.

## 💡 The Backlog

### 1. Authentication & User Management
*   [ ] **Clerk Integration:** Standardize the "Sign Up / Login" flow.
*   [ ] **User Profile Page:** A generic settings page for Name, Email, Avatar.
*   [ ] **Onboarding Flow:** A reusable "Welcome Wizard" component.

### 2. Billing & Subscriptions
*   [ ] **Stripe Integration:** A standard wrapper for handling subscriptions.
*   [ ] **Pricing Page:** A responsive pricing table component (Free/Pro/Enterprise).

### 3. Admin Dashboard
*   [ ] **Super Admin Panel:** A hidden route for us to see all users and stats.
*   [ ] **Activity Logs:** A system to track user actions for debugging.

### 5. The "Context Engine" (Meta-Feature)
*   [ ] **Mode/Blueprint System:** A framework to allow users to define different "types" of workspaces or projects (e.g., "Donation Mode" vs "Sales Mode").
    *   *Why:* Allows the SaaS to adapt to different verticals without rewriting code.
    *   *Mechanism:* JSON-defined schemas that control UI fields and output logic.

### 6. Component Library Standard
*   [ ] **Shadcn UI:** The official UI library for the template.
    *   *Why:* Copy-paste components, accessible, customizable.
    *   *Rule:* Always install components via CLI (`npx shadcn@latest add [component]`) instead of mocking them.

### 7. Sovereign AI Infrastructure (The "Brain in a Box")
*   **Core Philosophy:** The SaaS should be able to run its own intelligence without relying solely on OpenAI/Anthropic APIs.
*   **Components:**
    *   **Docker:** The universal container runtime for all services (DB, App, AI).
    *   **Ollama:** The local LLM runner (for zero-cost inference).
    *   **Docker Model Runner:** A standardized container for executing AI models.
    *   **MCP (Model Context Protocol):** The standard for connecting LLMs to local data/tools.
*   **Goal:** Enable "Air-Gapped" or "Private Cloud" deployments for enterprise clients.

### 4. Infrastructure
*   [ ] **Docker Compose:** A standard `docker-compose.yml` for local dev.
*   [ ] **CI/CD Pipeline:** A GitHub Actions workflow for auto-deploying to Vercel/Railway.

---
*Created by Antigravity Agent*
