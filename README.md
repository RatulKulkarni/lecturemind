# LectureMind — Frontend

React + TypeScript single-page application for the LectureMind platform. Provides a dark-themed, animated UI for managing semesters, units, lecture uploads, AI-generated notes, and question banks.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.9 |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 (CSS-based `@theme` config) |
| State | Redux Toolkit 2 |
| Routing | React Router 7 |
| Animations | Framer Motion 12 |
| HTTP | Axios (JWT interceptor) |
| Drag & Drop | @dnd-kit |
| File Upload | react-dropzone |
| Notifications | react-hot-toast |
| Icons | react-icons (Heroicons 2) |

## Project Structure

```
src/
├── api/
│   └── axios.ts              # Axios instance with JWT interceptor & 401 redirect
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx      # Protected route wrapper (sidebar + outlet)
│   │   ├── PageTransition.tsx # Framer Motion page transition wrapper
│   │   └── Sidebar.tsx        # Collapsible sidebar with nav links
│   └── ui/
│       ├── Button.tsx         # Reusable button (primary/secondary/danger)
│       ├── Card.tsx           # Glass-morphism card with hover glow
│       ├── EmptyState.tsx     # Empty state placeholder
│       ├── Input.tsx          # Styled text input with label
│       ├── LoadingSpinner.tsx # Animated spinner
│       └── Modal.tsx          # Animated modal dialog
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx      # Login form with JWT auth
│   │   └── RegisterPage.tsx   # Registration form
│   ├── dashboard/
│   │   └── DashboardPage.tsx  # Semester overview, unit grid, stats
│   ├── landing/
│   │   └── LandingPage.tsx    # Public landing page with features & CTA
│   ├── unit/
│   │   ├── UnitPage.tsx       # Lecture list, status badges, reordering
│   │   ├── NotesViewerPage.tsx        # In-browser PDF viewer for notes
│   │   └── QuestionBankViewerPage.tsx # Interactive Bloom's taxonomy viewer
│   └── upload/
│       └── UploadPage.tsx     # Single & split lecture upload with progress
├── store/
│   ├── store.ts               # Redux store config + typed hooks
│   ├── authSlice.ts           # Login, register, logout, JWT persistence
│   ├── semesterSlice.ts       # Fetch/create semester, unit reordering
│   ├── unitSlice.ts           # Fetch/create unit, download notes/QB
│   └── uploadSlice.ts         # Single & split upload with progress tracking
├── types/
│   └── index.ts               # All TypeScript interfaces (models & DTOs)
├── App.tsx                    # Route definitions
├── main.tsx                   # Entry point (Provider, Router, Toaster)
└── index.css                  # Tailwind theme, global styles, dark palette
```

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (port 3000)
npm run dev
```

The dev server proxies `/api/*` requests to `http://localhost:8080` (Spring Boot backend). See `vite.config.ts` for details.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR on port 3000 |
| `npm run build` | Type-check with `tsc` then build for production |
| `npm run preview` | Preview the production build locally |

## Routes

| Path | Auth | Description |
|------|------|-------------|
| `/` | Public | Landing page |
| `/login` | Public | Login |
| `/register` | Public | Registration |
| `/dashboard` | Protected | Semester dashboard with unit grid |
| `/unit/:id` | Protected | Unit detail — lectures, status, notes/QB links |
| `/unit/:id/notes` | Protected | In-browser PDF viewer for generated notes |
| `/unit/:id/questionbank` | Protected | Interactive question bank viewer |
| `/upload` | Protected | Video lecture upload (single or split mode) |

## API Proxy

Vite forwards all `/api/*` requests to the backend:

```
Frontend (3000) → /api/auth/login → Backend (8080) /auth/login
Frontend (3000) → /api/semester/*  → Backend (8080) /semester/*
Frontend (3000) → /api/unit/*      → Backend (8080) /unit/*
Frontend (3000) → /api/video/*     → Backend (8080) /video/*
```

## Theme

The app uses a custom dark theme defined entirely in `src/index.css` via Tailwind v4's `@theme` directive:

- **Surface scale** (`surface-50` to `surface-950`): Dark navy base (`#0b0f1a`) to near-white
- **Primary scale**: Indigo accent
- **Accent scale**: Violet/purple
- Glass morphism, glow effects, noise texture overlay, animated gradients

## Environment

No `.env` file is needed for the frontend. All API calls go through the Vite proxy. The backend URL is configured in `vite.config.ts`.

To point at a different backend, edit the proxy target:

```ts
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:8080', // ← change this
  },
},
```
