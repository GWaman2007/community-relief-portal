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

- **Framework:** [Next.js 16.2.3](https://nextjs.org/) (App Router) & [React 19.2.4](https://react.dev/)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, PostGIS, Realtime WebSockets, JWT Identity)
- **Maps:** [Leaflet.js](https://leafletjs.com/) / [React-Leaflet](https://react-leaflet.com/) with Marker Clustering
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/)
- **Artificial Intelligence:** [Google Gemini 3.1 Flash API](https://ai.google.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.2.3 | React framework with App Router |
| `react` | 19.2.4 | UI library |
| `@supabase/supabase-js` | ^2.103.0 | Database client & authentication |
| `leaflet` | ^1.9.4 | Geospatial mapping engine |
| `react-leaflet` | ^5.0.0 | React wrapper for Leaflet |
| `react-leaflet-cluster` | ^4.1.3 | Marker clustering for performance |
| `framer-motion` | ^12.38.0 | Smooth animations |
| `lucide-react` | ^1.11.0 | Icon library |
| `shadcn` | ^4.4.0 | Accessible component primitives |
| `tailwind-merge` | ^3.5.0 | Utility class merging |
| `tw-animate-css` | ^1.4.0 | Animation utilities |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | ^4 | CSS-in-JS styling |
| `@tailwindcss/postcss` | ^4 | PostCSS integration |
| `eslint` | ^9 | Code linting |
| `eslint-config-next` | 16.2.3 | Next.js ESLint config |
| `typescript` | ^5 | Type safety |
| `@types/react` | ^19 | React type definitions |
| `@types/node` | ^20 | Node.js type definitions |
| `@types/leaflet` | 1.9.21 | Leaflet type definitions |

---

## 🚀 Getting Started

### Prerequisites

Before beginning, ensure you have the following installed:

- **Node.js** (v18 or higher) - Runtime environment
- **npm** or **yarn** - Package manager
- **Supabase Project** - PostgreSQL database with PostGIS extension enabled
- **Google Gemini API Key** - For AI-powered semantic analysis
- **Code Editor** - VS Code or similar with TypeScript/React extensions

### Installation

Follow these steps to deploy the application locally:

```bash
# Clone the repository
git clone <repository-url>
cd GDGH2SPROJ

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# Next.js / Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Gemini Settings
GEMINI_API_KEY=your-gemini-api-key

# 🚨 SYSTEM ADMINISTRATOR LOCK 🚨
# The explicit email string assigned Global Admin controls over the platform
NEXT_PUBLIC_ADMIN_EMAIL=admin@earth-node.org
```

**Important:** Never commit `.env.local` to version control. Add it to `.gitignore`.

---

## 📁 Usage

### Development Mode
Start the development server with hot reloading:
```bash
npm run dev
```
Navigate to `http://localhost:3000` in your browser.

### Production Build
Build the application for production deployment:
```bash
npm run build
```

### Production Server
Run the production server:
```bash
npm run start
```

### Linting
Run ESLint to check for code quality issues:
```bash
npm run lint
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start development server with hot reload |
| `build` | Build for production |
| `start` | Start production server |
| `lint` | Run ESLint |

---

## 📂 Project Structure

```
GDGH2SPROJ/
├── .env.local                    # Environment variables (Supabase, Gemini API, Admin email)
├── .gitignore                    # Git ignore rules
├── next.config.ts                # Next.js configuration (LAN-only dev, CSS inlining)
├── package.json                  # Dependencies and scripts
├── postcss.config.mjs            # PostCSS configuration
├── tsconfig.json                 # TypeScript compiler options
├── components.json               # shadcn/ui configuration
├── supabase_schema.sql           # Database schema definition
├── eslint.config.mjs             # ESLint configuration
│
├── public/                       # Static assets
│   ├── globe.svg
│   ├── file.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── src/
│   ├── app/
│   │   ├── api/                  # API routes
│   │   │   ├── admin/
│   │   │   │   ├── ngo/suspend       # Suspend NGO access
│   │   │   │   └── resolve           # Resolve incidents
│   │   │   ├── dispatch             # Volunteer dispatch endpoint
│   │   │   ├── ngo/register         # NGO registration
│   │   │   ├── process-report       # Process crisis reports
│   │   │   ├── volunteer/
│   │   │   │   ├── authorize        # AI volunteer verification
│   │   │   │   ├── register         # Volunteer registration
│   │   │   │   └── respond          # Volunteer response tracking
│   │   │   └── ...
│   │   ├── components/           # Custom UI components
│   │   │   ├── BelowTheFold.tsx    # Below-fold content with skeleton loader
│   │   │   ├── BelowTheFoldLoader.tsx
│   │   │   ├── HeroOrbit.tsx       # Hero section with orbital animations
│   │   │   └── LiveMetricsHUD.tsx  # Live metrics display
│   │   ├── dashboard/            # Role-specific dashboards
│   │   │   ├── MapComponent.tsx    # Leaflet map component
│   │   │   ├── DelayedMap.tsx      # Optimized map loading
│   │   │   ├── admin/              # Admin dashboard
│   │   │   ├── ngo/                # NGO dashboard
│   │   │   └── volunteer/          # Volunteer dashboard
│   │   ├── globals.css           # Global styles with Tailwind
│   │   ├── inbox/                # Message inbox page
│   │   ├── layout.tsx            # Root layout
│   │   ├── login/                # Login page
│   │   ├── page.tsx              # Landing page
│   │   ├── register/             # Registration page
│   │   ├── report/               # Report submission page
│   │   └── volunteer/            # Volunteer page
│   ├── components/ui/            # shadcn/ui primitives
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── separator.tsx
│   └── lib/
│       ├── supabaseClient.ts     # Supabase client configuration
│       └── utils.ts              # Utility functions (cn, class merging)
│
└── README.md                     # This file
```

### Directory Descriptions

| Directory | Purpose |
|-----------|---------|
| `src/app/` | Next.js App Router pages and routes |
| `src/app/api/` | API routes for all backend operations |
| `src/app/dashboard/` | Role-specific dashboards (admin/ngo/volunteer) |
| `src/app/components/` | Custom UI components for landing page |
| `src/components/ui/` | shadcn/ui component primitives |
| `src/lib/` | Utility functions and client configurations |
| `public/` | Static assets (SVG icons, images) |

---

## 🎨 Design System

### Relief Palette

The application uses a carefully curated color palette designed to de-escalate tension and provide visual relief during high-stress situations:

- **Backgrounds:** Cool gray-blue tones (`slate-50`, `slate-100`) for visual relief
- **Primary Actions:** Restorative teal (`teal-600`) for calls-to-action
- **Text:** Deep slate (`slate-900`, `slate-800`) for readability without eye strain
- **Avoid:** Stark black (`#000000`) and pure white backgrounds that cause eye strain

### Data Visualization Colors

Map heatmaps and alerts use calming, non-panic-inducing colors:

- **Heatmaps:** Deep amber to muted coral gradients
- **Danger Zones:** Reserved for immediate life-threatening situations
- **General Alerts:** Informative teals or gentle yellows
- **Marker States:** Red → Yellow → Green transitions for incident resolution

### Component Guidelines

- **Negative Space:** Generous padding (`p-6` or `p-8`) on cards displaying field surveys or volunteer metrics
- **Soft Boundaries:** Diffuse, low-opacity shadows and subdued borders
- **Calm Asynchrony:** Smooth, slow-pulsing skeleton loaders for AI data fetching
- **Glassmorphism:** Frosted glass cards with `backdrop-blur-xl` for modern aesthetics

---

## 🌐 User Experience Principles

### Visual Relief
- De-escalate tension through color psychology
- Ensure cognitive decompression with breathable layouts
- Avoid panic-inducing colors in data visualizations

### User Conversion
- Clear value proposition on landing pages
- Intuitive onboarding flows
- Trust-building through transparent information architecture

### Seamless Flow
- Logical navigation between pages
- Smooth transitions between states
- Consistent interaction patterns

---

## 🌐 Accessibility

All components are built with accessibility in mind:

- **Semantic HTML structure** for screen readers
- **ARIA labels and roles** for dynamic content
- **Keyboard navigation support** for all interactive elements
- **Screen reader compatibility** through proper heading hierarchy
- **Color contrast compliance** with WCAG 2.1 AA standards

---

## 📦 Installation (Complete Guide)

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd GDGH2SPROJ
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials and API keys
```

### Step 4: Database Setup
Run the schema migration:
```bash
psql -h your-db-host -U your-db-user -d your-db-name -f supabase_schema.sql
```

### Step 5: Start Development
```bash
npm run dev
```

Navigate to `http://localhost:3000` to interact with the platform.

---

## 🔧 Development Workflow

### Running Development Server
```bash
npm run dev
```

### Running Linting
```bash
npm run lint
```

### Running Type Checking
TypeScript is configured with strict mode enabled. Type checking is automatic during build.

### Building for Production
```bash
npm run build
```

### Testing Production Build
```bash
npm run start
```

---

## 📝 Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start development server with hot reload |
| `build` | `npm run build` | Build optimized production bundle |
| `start` | `npm run start` | Start production server from build |
| `lint` | `npm run lint` | Run ESLint code analysis |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style Guidelines

- Follow existing code patterns in the codebase
- Use TypeScript for type safety
- Write semantic HTML
- Keep components small and focused
- Add comments for complex logic
- Use Tailwind utility classes for styling

---

## 📄 License

This project is licensed under the MIT License.

---

## 🌟 Support

For support, please visit our documentation or join our community channels.

---

## 📞 Contact

- **Project:** Earth Node Community Relief Portal
- **GitHub:** https://github.com/earth-node
- **Documentation:** Available in the project repository

---

## 🎯 Key Capabilities Summary

Based on the file structure, the project provides:

- **Landing Page** with hero section and persuasive "About Us" content
- **Admin Dashboard** for platform management and NGO/volunteer oversight
- **NGO Dashboard** for submitting crisis reports and managing field operations
- **Volunteer Dashboard** for receiving dispatch requests and tracking missions
- **Interactive Leaflet Maps** with real-time marker clustering and state transitions
- **API Routes** for all business logic (registration, authorization, dispatch, reporting)
- **Real-time WebSocket Integration** for live telemetry across all dashboards
- **AI-Powered Features** including duplicate detection and volunteer verification

---

## 🏁 Conclusion

The Community Relief Portal represents a comprehensive, production-ready disaster response platform that combines cutting-edge technologies (Next.js 16, React 19, Supabase, Gemini AI) with thoughtful UX design principles. The glassmorphic aesthetic, coupled with semantic AI deduplication and real-time geospatial routing, creates a unified command center for crisis response operations.

The platform is designed for high-stress environments where clarity, speed, and reliability are paramount. Every component—from the breathing hero animations to the calm-asynchrony skeleton loaders—has been crafted to reduce cognitive load during critical moments.

**Ready to deploy?** Run `npm install`, configure your `.env.local`, and start making an impact.