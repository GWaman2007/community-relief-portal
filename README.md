# 🌍 Community Relief Portal
**Autonomous AI Deduplication & Real-Time Geospatial Volunteer Routing**

![Hackathon Submission](https://img.shields.io/badge/Status-Hackathon_Ready-emerald?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js_|_Supabase_|_Gemini_AI-20232A?style=for-the-badge)

---

## 🛑 The Problem & Solution

In the immediate aftermath of a crisis, disaster response is often chaotic. Fragmented NGO field data leads to massively duplicated efforts, resulting in overloaded communication channels and dangerously delayed volunteer dispatch. 

**Our Solution:** A unified, AI-driven disaster relief dashboard. The Community Relief Portal ingests raw field reports, autonomously strips out duplicate reporting using semantic spatial analysis, and provides a secure, real-time routing ecosystem to seamlessly dispatch local volunteers precisely where they are needed most.

---

## ⚡ Core Features

### 🧠 Semantic AI Deduplication (RAG)
We implemented a robust Retrieval-Augmented Generation pipeline. When an NGO submits a crisis report, the backend queries Supabase PostGIS for a 2km bounding-radius intersection. We feed the localized context to the **Gemini 3.1 Flash API** which intelligently detects semantic duplication (e.g. knowing "Fallen tree on Main St" is the exact same incident as "Large oak blocking Main"). Detected duplicates recursively reinforce the parent node's verified status rather than visually cluttering the map.

### 🛡️ Secure 3-Tier Role-Based Access
Security and data integrity are paramount. The platform enforces absolute separation of concerns across three distinct layers:
- **Platform Admin:** Managed via an explicit `.env.local` configuration. Only the system administrator can verify NGOs or authorize the deployment of active volunteers.
- **NGO Contributor:** Verified organizations authorized to transmit field data and submit crisis reports. 
- **Field Volunteer:** Registered community members who respond to dispatch requests from the administrator.

### 📡 Live Telemetry & WebSockets
Gone are the static dashboards. We bound the entire geographic and data layers natively to **Supabase Realtime**. Map markers dynamically shift color states (Red `Critical` ➡️ Yellow `Dispatched` ➡️ Green `Resolved`), tracking metrics update seamlessly, and volunteer notification hubs sync instantly across the globe without a single page refresh.

### 🔄 Closed-Loop Dispatch System
When the Administrator approves a relief operation, the targeted Volunteers instantly receive localized task notifications into their secure browser inbox. Upon explicitly selecting "Accept" or "Decline", the active mission tracker painted dynamically onto the Admin's Leaflet Popup adjusts the Live Volunteer Response ratios, allowing the administration to monitor live response viability.

### 🤖 AI Volunteer Verification
To ensure high-quality volunteer networks, Gemini operates continuously as an asynchronous "HR Screener". When new volunteers register, Gemini autonomously parses their submitted skillsets and history, checking for conflicting information or non-compliance before modifying the `is_authorized` database flag.

### 🚰 The Data Cascade Security Protocol 
If an operating NGO is compromised or no longer active, Admins can immediately suspend their access. Suspending an NGO executes an absolute Data Cascade relational constraint. Because Map elements evaluate a strict verification pipeline, revoking an NGO instantly and globally scrubs every single one of their uploaded crisis markers from the visual arrays, protecting platform routing validity.

### 🎨 Premium Glassmorphic Design
The entire portal leverages a cohesive, modern glassmorphic aesthetic built with Tailwind CSS. We utilize frosted glass cards (`backdrop-blur-xl`), `oklch` vibrant color tokens, dynamic Framer Motion micro-animations, and a fully interactive edge-to-edge Leaflet map layout for a top-tier user experience.

---

## 💻 Tech Stack

- **Framework:** Next.js 16 (App Router) & React 19
- **Database & Auth:** Supabase (PostgreSQL, PostGIS, Realtime WebSockets, JWT Identity)
- **Maps:** Leaflet.js / React-Leaflet with Marker Clustering
- **Styling:** Tailwind CSS v4, shadcn/ui, Framer Motion
- **Artificial Intelligence:** Google Gemini 3.1 Flash API

---

## 🚀 Local Setup Instructions

Follow these steps to deploy the application locally for judging configuration.

### 1. Install Dependencies
```bash
npm install
```

### 2. Required Environment Variables
Create a `.env.local` file in the root directory. You **must** define your Super Admin credentials here alongside your platform keys.

```env
# Next.js / Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini Settings
GEMINI_API_KEY=your_gemini_api_key

# 🚨 SYSTEM ADMINISTRATOR LOCK 🚨
# The explicit email string assigned Global Admin controls over the platform
NEXT_PUBLIC_ADMIN_EMAIL=your.email@example.com
```

### 3. Start the Development Server
```bash
npm run dev
```

Navigate to `http://localhost:3000` to interact with the platform. To test the Admin capabilities, register an account utilizing the precise email defined in `NEXT_PUBLIC_ADMIN_EMAIL`.
