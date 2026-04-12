# 🌍 Community Relief Portal
**Autonomous AI Deduplication & Real-Time Geospatial Volunteer Routing**

![Hackathon Submission](https://img.shields.io/badge/Status-Hackathon_Ready-emerald?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js_|_Supabase_|_Gemini_AI-20232A?style=for-the-badge)

---

## 🛑 The Problem & Solution

In the immediate aftermath of a crisis, disaster response is often chaotic. Fragmented NGO field data leads to massively duplicated efforts, resulting in overloaded communication channels and dangerously delayed volunteer dispatch. 

**Our Solution:** A unified, AI-driven command center. The Community Relief Portal ingests raw field intelligence, autonomously strips out duplicate reporting using semantic spatial analysis, and provides a real-time, zero-trust routing ecosystem to seamlessly dispatch local personnel precisely where they are needed most.

---

## ⚡ Core Architecture (The "Wow" Features)

### 🧠 Semantic AI Deduplication (RAG)
We implemented a robust Retrieval-Augmented Generation pipeline. When an NGO submits a crisis report, the backend queries Supabase PostGIS for a 2km bounding-radius intersection. We feed the localized context to the **Gemini 3.1 Flash API** which intelligently detects semantic duplication (e.g. knowing "Fallen tree on Main St" is the exact same incident as "Large oak blocking Main"). Detected duplicates recursively reinforce the parent node's verified status rather than visually cluttering the map.

### 🛡️ Zero-Trust 3-Tier RBAC
Security is paramount. The platform enforces absolute separation of concerns across three distinct operational layers:
- **Platform Admin:** Hardcoded firmly behind an absolute `.env.local` zero-trust vault. Only this immutable entity can authorize NGOs or dispatch active volunteers.
- **NGO Contributor:** Verified organizations authorized to transmit field intelligence. 
- **Field Volunteer:** Operatives reacting strictly to Admin dispatch parameters.

### 📡 Live Telemetry & WebSockets
Gone are the static dashboards. We bound the entire geographic and data layers natively to **Supabase Realtime**. Map markers dynamically shift color states (Red `Critical` ➡️ Yellow `Dispatched` ➡️ Green `Resolved`), tracking metrics update seamlessly, and volunteer notification hubs sync instantly across the globe without a single page refresh.

### 🔄 Closed-Loop Dispatch System
When the Central Command approves an operation, the targeted Volunteers instantly receive localized task notifications into their secure browser inbox. Upon explicitly selecting "Accept" or "Decline", the active mission tracker painted dynamically onto the Admin's Leaflet Popup dynamically adjusts the Live Operator Response ratios, allowing Central Command to monitor live response viability.

### 🤖 AI Volunteer Gatekeeper 
Malicious actors routinely attempt to disrupt humanitarian efforts. To counter this, Gemini operates continuously as an asynchronous "HR Screener". When new volunteers register, Gemini autonomously parses their submitted skillsets and history, aggressively checking for vulnerabilities or non-compliance before modifying the `is_authorized` database flag required to unlock their terminal.

### 🚰 The Data Cascade Security Protocol 
If an operating NGO goes rogue or is compromised, Admins possess a single "Kill Switch". Suspending an NGO executes an absolute Data Cascade relational constraint. Because Map elements evaluate a strict verification pipeline, revoking an NGO instantly and globally scrubs every single one of their uploaded crisis markers from the visual arrays, protecting platform routing validity.

---

## 💻 Tech Stack

- **Framework:** Next.js (App Router)
- **Database & Auth:** Supabase (PostgreSQL, PostGIS, Realtime WebSockets, JWT Identity)
- **Maps:** Leaflet.js / React-Leaflet with Marker Clustering
- **Styling:** Tailwind CSS
- **Artificial Intelligence:** Google Gemini 3.1 Flash API

---

## 🚀 Local Setup Instructions

Follow these steps to deploy the application locally for judging configuration.

### 1. Install Dependencies
```bash
npm install
```

### 2. Required Environment Variables
Create a `.env.local` file in the root directory. You **must** define your Super Admin credentials here alongside your platform keys to bypass the Zero-Trust vault.

```env
# Next.js / Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini Settings
GEMINI_API_KEY=your_gemini_api_key

# 🚨 THE ZERO-TRUST VAULT LOCK 🚨
# The explicit email string assigned Super Admin controls over the platform
NEXT_PUBLIC_ADMIN_EMAIL=your.email@example.com
```

### 3. Start the Development Server
```bash
npm run dev
```

Navigate to `http://localhost:3000` to interact with the platform. To test the Admin capabilities, register an account utilizing the precise email defined in `NEXT_PUBLIC_ADMIN_EMAIL`.
