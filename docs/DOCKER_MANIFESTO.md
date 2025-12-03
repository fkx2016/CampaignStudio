# 🐳 The Docker Manifesto: A New Way of Thinking
**Version:** 1.0
**Date:** 2025-12-03
**Status:** CANONICAL

---

## 📖 The Revelation
> "I wish I had started out this way."

We are no longer building a "Windows Python Application." We are building a **Docker Application**.
Your laptop is no longer the *home* of the application; it is merely the *launchpad*.

This document outlines the mental shift required to move from a "Hobbyist Scripter" to a "Systems Architect."

---

## 🧠 The Docker Intuition (Mental Models)

### 1. The "Launchpad" vs. The "Server"
*   **Old Mindset (Windows):** "I need to install Python, Postgres, and Node on my computer to run this."
*   **🐳 Docker Mindset:** "My computer is just a host. The application lives in **Containers**—disposable, lightweight Linux servers that contain *only* what the app needs."
    *   *The Truth:* If you delete the container, the app doesn't exist anymore. It leaves no trace on your Windows registry. Your laptop remains pristine.

### 2. "Cattle, Not Pets" (Ephemerality)
*   **Old Mindset (Windows):** "My server is acting weird. Let me SSH in and try to fix the config file." (Treating it like a sick pet).
*   **🐳 Docker Mindset:** "The container is acting weird. **Kill it.**" (Treating it like livestock).
    *   *The Truth:* You never "fix" a running container. You fix the blueprint (`Dockerfile`), destroy the old container, and spawn a fresh, healthy one.

### 3. The "USB Drive" (Volumes)
*   **Old Mindset (Windows):** "The database is saved in `MyDocuments/Project/db.sqlite`."
*   **🐳 Docker Mindset:** "The container filesystem is temporary. If I restart, it resets. The *only* data that survives is what I explicitly map to a **Volume**."
    *   *The Truth:* Think of a Volume like a USB drive you plug into the container. If you destroy the container, the USB drive (Volume) is safe. That is where your data lives.

### 4. The "Conductor" (Orchestration)
*   **Old Mindset (Windows):** "First I run the DB script, then I open a new terminal for the backend, then another for the frontend..."
*   **🐳 Docker Mindset:** "I define the entire system in `docker-compose.yml`. I give one command (`up`), and the **Orchestrator** brings the whole symphony to life."

---

## 🗣️ The Vocabulary of the Architect

To think in Docker, you must speak in Docker.

| Term | The "Windows" Equivalent | The Docker Reality |
| :--- | :--- | :--- |
| **Image** | A `.exe` installer | The read-only blueprint. It contains the OS, the Code, and the Libs. It is frozen in time. |
| **Container** | A running process | A living instance of an Image. It is temporary. It dies when you stop it. |
| **Service** | A program (e.g., "Postgres") | A definition in `docker-compose` that says "Run this Image with these settings." |
| **Volume** | A folder on your hard drive | A persistent data store that survives container death. |
| **Network** | `localhost` | A private, virtual Wi-Fi network that only your containers can see. |

---

## 📜 The Golden Rules

1.  **If it's not in the Dockerfile, it doesn't exist.**
    *   Never rely on a library installed globally on your laptop. If `pip freeze` didn't catch it, your app will crash in production.
2.  **The Database is a Service, not a File.**
    *   Never treat your database like a local file (`db.sqlite`). Treat it like a remote server that you connect to via URL (`postgresql://...`).
3.  **One Process per Container.**
    *   Don't try to run Python and Node in the same container. Give them each their own house. Let them talk over the network.

---

## 🏗️ Your Architecture (The CampaignStudio Stack)

You are now the Architect of this virtual data center:

```mermaid
graph TD
    User((User Browser))
    
    subgraph "Docker Host (Your Laptop)"
        subgraph "Virtual Network (campaignstudio_default)"
            Frontend[Frontend Container\n(Next.js / Port 3000)]
            Backend[Backend Container\n(FastAPI / Port 8001)]
            DB[Database Container\n(Postgres / Port 5432)]
            
            Frontend -- "Server-Side Calls" --> Backend
            Backend -- "SQL Queries" --> DB
        end
        
        Volume[(postgres_data Volume)]
        DB -.-> Volume
    end
    
    User -- "HTTP :3000" --> Frontend
    User -- "HTTP :8001" --> Backend
```

*   **The Frontend** is a container running Node.js.
*   **The Backend** is a container running Python.
*   **The Database** is a container running Postgres.
*   **The Volume** is the only thing that is "real" and persistent.

---

*Refer to this Manifesto whenever you feel the urge to "just run a script locally." Resist. Containerize.*
