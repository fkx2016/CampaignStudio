# 📊 PRD: Growth Analytics & "The Greed Engine" Dashboard

**Metric-Driven Architecture for the Incentive Protocol**

---

## 1. Executive Summary
The CampaignStudio backend currently captures users but lacks visibility into *behavior*. To validate the "Incentive Protocol" (Lottery Badges), we need a robust analytics layer that proves **ROI to Sponsors** and **Growth to Creators**. This dashboard is not just an admin view; it is the "Scoreboard" for the business.

---

## 2. Core Directives

*   **Prove the Value:** Every metric must answer "Is this making money/growth?"
*   **Privacy First:** Track behavior (clicks/views) without compromising user identity until signup.
*   **Real-Time Feedback:** The "Greed Engine" relies on instant gratification; analytics must reflect that velocity.

---

## 3. Key Metrics to Define

### A. The "Greed Engine" Funnel (Acquisition)
*   **Impressions:** How many anonymous visitors saw the Lottery Badge?
*   **"Money Seeks" (Intent):** How many clicked "Claim $1.00"?
    *   *Metric:* `Click-Through Rate (CTR)` = Claims / Impressions.
*   **Conversion:** How many Claims resulted in a verified Signup?
    *   *Metric:* `Conversion Rate` = Signups / Claims.
    *   *Target:* >20% (Industry avg is <5%).

### B. The "Sponsor ROI" (Monetization)
*   **Cost Per Acquisition (CPA):** How much did the Sponsor pay per user? (e.g., $1.00).
*   **LTV Precursor:** How many "Lottery Users" returned within 7 days?
*   **Sponsor Visibility:** Impressions of the Sponsor Logo (e.g., Stripe badge views).

### C. Network Health (RADIA Protocol)
*   **Spawning Rate:** New RADIAs (Studios) created per day.
*   **Federation Density:** Users who visit >1 Creator's RADIA.

---

## 4. User Roles & Access

| Role | Access Level | View |
|------|--------------|------|
| **Super Admin** | God Mode | All Users, Total Network ROI, Global Sponsor Pool |
| **Creator** | Own Data | My Signups, My Lottery Performance, My Earnings |
| **Sponsor** | ROI Data | Impressions, Clicks, Signups attributed to their Spend |
| **User** | Personal | My Wallet, My Content Performance |

---

## 5. Technical Requirements

### Phase 1: The "List" (MVP - Implemented)
*   `GET /users` (Admin only)
*   Basic CSV Export.

### Phase 2: Behavioral Tracking (The "Ping" System)
*   **Anonymous Tracking:** Use fingerprinting/cookies to track "Money Seek" clicks before auth.
*   **Event Log:**
    *   `event_type`: "view_badge", "click_claim", "signup_success"
    *   `metadata`: `{ "amount": 1.00, "sponsor": "Stripe" }`

### Phase 3: The Visualization Layer
*   Time-series graphs (Signups over last 30 days).
*   Cohort Retention Heatmaps.

---

## 6. Development Roadmap

1.  **Define Events Schema:** Create `AnalyticsEvent` model in DB.
2.  **Implement Tracking Pixel:** Frontend sends generic events.
3.  **Build Aggregation Pipelines:** SQL queries to calculate CTR/CPA.
4.  **Visualize:** Use charting library (Recharts/Chart.js) in Admin Dashboard.

---

**"If you can measure it, you can monetize it."**
