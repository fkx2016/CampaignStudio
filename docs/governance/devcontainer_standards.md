# Software Factory: DevContainer Standards [Build 1.0 - Dec 13, 2025]

**Enforcement Level: STRICT**
All AI Agents (AG, PA, WA) must adhere to these three rules when generating or modifying .devcontainer configurations.

## Rule 1: The Identity Protocol (Git)
**Requirement:** You MUST include the standard Git feature to enable credential forwarding from the host.
**Why:** Prevents "Permission Denied" errors during git push without requiring keys inside the container.
**Implementation:** In devcontainer.json, ensure the features block includes: `"features": { "ghcr.io/devcontainers/features/git:1": {} }`

## Rule 2: The Immutability Protocol (Versions)
**Requirement:** You MUST use specific version tags for all base images and tools.
**Restriction:** The tag `:latest` is FORBIDDEN.
**Why:** Ensures the factory works identically today and 6 months from now.
**Implementation:**

BAD: `FROM python:latest`

GOOD: `FROM python:3.11-bullseye`

## Rule 3: The Simplicity Protocol (Mounts)
**Requirement:** Rely on VS Code's default workspace mounting behavior.
**Restriction:** Do NOT generate custom mounts or bind arguments unless explicitly requested.
**Why:** Custom binds often fail on Windows hosts due to path formatting.
