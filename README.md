# Habit Tracker Web Application

A beautiful, interactive, offline-first habit tracker built with **React 18**, **Vite**, **TypeScript**, **Tailwind CSS v4**, **Zustand**, and **Framer Motion**.

This project implements the design specification described in the pre-production plan.

---

## 🚀 Key Features

- **Live Dashboard**: Every statistic (rings, charts, leaderboard, progress bars, streaks) recalculates instantly on checkbox click.
- **Unified Layout**:
  - **Desktop (>= 1200px)**: A 3-column, 3-row layout displaying all progress elements side by side.
  - **Mobile (< 768px)**: Bottom tab navigation (Home, Grid, Charts, Leaderboard) with scrolling day columns.
- **Zustand State**: JSON storage model persisted in `localStorage` with automated migration.
- **PWA & Offline-First**: Installable app configured via `vite-plugin-pwa` utilizing service workers.
- **Customizable**: Profile name, base64 photo avatar upload, daily affirmation, light/dark mode toggle, and multiple theme highlights.

---

## 🛠️ Getting Started

### Prerequisites

Make sure you have Node.js (version 18 or above) installed.

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the local development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

---

## 📦 Production & Deployment

### Build Compilation

To generate optimized minified build chunks (located in the `dist/` directory) and verify TypeScript types:
```bash
npm run build
```

### Deployment to Vercel

The application is completely serverless and fits Vercel's free tier.

1. Configure environment variables in Vercel for production:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `SESSION_SECRET`
   - `FRONTEND_URL` (for example `https://your-app.vercel.app`)
   - `ALLOWED_ORIGINS` (optional comma-separated list of allowed frontend origins)

2. Install the Vercel CLI (or connect your GitHub repository to Vercel):
   ```bash
   npm install -g vercel
   ```

3. Run deployment:
   ```bash
   vercel
   ```

4. To deploy to production:
   ```bash
   vercel --prod
   ```
