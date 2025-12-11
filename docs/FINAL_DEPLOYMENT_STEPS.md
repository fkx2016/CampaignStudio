# Final Deployment Configuration Steps

Now that the code is fixed and pushed, you must configure the "Cloud" side of the Hybrid Architecture.

## Phase 1: Railway (Backend) Configuration
**Goal:** Tell the Backend to trust requests coming from your Vercel Frontend.

1.  **Log in to Railway:** Go to [railway.app](https://railway.app) and open your project.
2.  **Select the Backend Service:** Click on the card for your Python/FastAPI service.
3.  **Go to Variables:** Click the "Variables" tab at the top.
4.  **Add New Variable:**
    *   **Variable Name:** `ALLOWED_ORIGINS`
    *   **Value:** `https://campaign-studio.vercel.app` (Replace with your ACTUAL Vercel URL)
    *   **⚠️ IMPORTANT:** Do NOT put a trailing slash `/` at the end.
5.  **Add Another Variable (Optional but Recommended):**
    *   **Variable Name:** `API_BASE_URL`
    *   **Value:** `https://[YOUR-RAILWAY-URL].up.railway.app`
    *   *(This ensures file uploads return the correct full URL)*
6.  **Redeploy:** Railway usually redeploys automatically when variables change. If not, click "Deployments" -> "Redeploy".

## Phase 2: Vercel (Frontend) Configuration
**Goal:** Tell the Frontend where the Backend lives.

1.  **Log in to Vercel:** Go to [vercel.com](https://vercel.com) and open your project.
2.  **Go to Settings:** Click the "Settings" tab at the top.
3.  **Go to Environment Variables:** Click "Environment Variables" on the left sidebar.
4.  **Add New Variable:**
    *   **Key:** `NEXT_PUBLIC_API_URL`
    *   **Value:** `https://[YOUR-RAILWAY-URL].up.railway.app` (Copy this from your Railway dashboard)
    *   **⚠️ IMPORTANT:** Must start with `https://`.
5.  **Save:** Click "Save".
6.  **Redeploy (Crucial):**
    *   Changing variables does NOT automatically update the live site.
    *   Go to the "Deployments" tab.
    *   Click the three dots `...` next to the latest deployment.
    *   Select **"Redeploy"**.
    *   Check the box "Redeploy with existing build cache" (optional, but faster).
    *   Click "Redeploy".

## Phase 3: Verification
Once both are redeployed:
1.  Open your Vercel URL (e.g., `https://campaign-studio.vercel.app`).
2.  **Login Test:** Try to log in.
    *   *Note:* If it fails immediately, wait 30 seconds (Cold Start) and try again.
3.  **Dashboard Test:** Ensure you see your campaigns.

## Troubleshooting
- **CORS Error?** Check `ALLOWED_ORIGINS` in Railway. Did you include a slash? Remove it.
- **Mixed Content Error?** Check `NEXT_PUBLIC_API_URL` in Vercel. Is it `http://`? Change to `https://`.
- **"Network Error"?** Check if the Railway backend is actually running (Green status).
