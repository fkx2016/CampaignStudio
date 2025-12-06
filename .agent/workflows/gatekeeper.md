---
description: "The Gatekeeper Protocol: Verify build integrity before deployment."
---

# The Gatekeeper Check

This workflow enforces **Pillar 5** of the CoCoding Protocol. It must be run BEFORE any push to GitHub or Vercel.

1.  **Stop and Check:** We are about to simulate a production build.
2.  **Lint Check:** Verify code quality.
    ```bash
    npm run lint
    ```
3.  **Build Check:** Verify type safety and comprehensive build success.
    ```bash
    // turbo
    npm run build
    ```
4.  **Verdict:**
    *   If **GREEN**: You are authorized to push.
    *   If **RED**: You MUST fix errors before pushing.
