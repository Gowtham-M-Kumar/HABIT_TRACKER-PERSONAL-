# Habit Tracker Web Application

A beautiful, interactive, offline-first habit tracker built with **React 18**, **Vite**, **TypeScript**, **Tailwind CSS v4**, **Zustand**, and **Framer Motion**.

This project implements the design specification described in the pre-production plan.

---

## Key Features

- **Live Dashboard**: Every statistic (rings, charts, leaderboard, progress bars, streaks) recalculates instantly on checkbox click.
- **Unified Layout**:
  - **Desktop (>= 1200px)**: A 3-column, 3-row layout displaying all progress elements side by side.
  - **Mobile (< 768px)**: Bottom tab navigation (Home, Grid, Charts, Leaderboard) with scrolling day columns.
- **Zustand State**: JSON storage model persisted in `localStorage` with automated migration.
- **PWA & Offline-First**: Installable app configured via `vite-plugin-pwa` utilizing service workers.
- **Customizable**: Profile name, base64 photo avatar upload, daily affirmation, light/dark mode toggle, and multiple theme highlights.

---

## Getting Started

### Prerequisites

Node.js 18 or above.

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173).

---

## Production & Deployment

### Build

Generate optimized static assets in `dist/` and verify TypeScript types:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

### Deploy to Vercel

This is a **frontend-only** Vite SPA. No backend, API routes, or environment variables are required.

1. Connect the GitHub repository to [Vercel](https://vercel.com), or install the CLI:

   ```bash
   npm install -g vercel
   ```

2. Deploy:

   ```bash
   vercel
   ```

3. Production deploy:

   ```bash
   vercel --prod
   ```

Vercel uses `vercel.json` to run `npm run build` and serve the `dist/` folder with SPA rewrites.
