# Planora — Productivity Suite

**Planora** is a modern, frontend-only productivity web application built with **Angular 21** (standalone components). It combines **To-Do management**, **Calendar views**, **Reminders**, and **Notes** in a responsive SaaS-style UI.

All data is stored in **localStorage** — no backend, database, or authentication required.

![Angular](https://img.shields.io/badge/Angular-21-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

| Module | Capabilities |
|--------|-------------|
| **Dashboard** | Task stats, today's tasks, productivity progress, upcoming reminders |
| **Tasks** | CRUD, priorities, categories, due date/time, search, filter, sort, drag-and-drop |
| **Calendar** | Month / week / day views (FullCalendar), drag events, click date to add task |
| **Reminders** | Popup alerts, sound alert, browser notifications, badge count in navbar |
| **Notes** | Color-coded notes with pin support |
| **Settings** | Dark/light mode, notifications, PDF export, sample data, PWA |

## Tech Stack

- Angular 21 (standalone components, lazy routes)
- Angular Material + CDK (drag-drop, dialogs)
- FullCalendar Angular
- Chart.js
- jsPDF + jspdf-autotable
- RxJS + localStorage
- Angular Service Worker (PWA / offline)

## Project Structure

```
src/app/
├── core/layout/          # Main shell (sidebar, navbar)
├── shared/components/    # Stat cards, dialogs, page header
├── shared/pipes/
├── services/             # Task, note, reminder, settings, PDF, storage
├── models/               # TypeScript interfaces
├── pages/                # Dashboard, Tasks, Calendar, etc.
└── components/           # Reminder popup

public/
├── logo.png              # App logo (sidebar & navbar)
└── icons/                # PWA icons (72, 192, 512)
```

## Prerequisites

- **Node.js** 20+ (22 recommended)
- **npm** 10+

## Installation

```bash
# Clone or navigate to the project
cd planora

# Install dependencies
npm install
```

## Development

```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200).

## Production Build

```bash
npm run build
```

Output: `dist/planora/browser`

## Deployment

### Vercel

1. Push the repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Use these settings:
   - **Framework Preset:** Angular
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/planora/browser`
4. Deploy. The included `vercel.json` enables SPA routing.

### GitHub Pages

1. The `build:gh-pages` script uses base href `/Planora/` for [abhijithcsgo/Planora](https://github.com/abhijithcsgo/Planora). If you fork to a different repo name, update it:

   ```json
   "build:gh-pages": "ng build --configuration production --base-href /YOUR-REPO-NAME/"
   ```

2. Enable **GitHub Pages** → Source: **GitHub Actions**.

3. Push to `main` / `master`. The workflow in `.github/workflows/deploy-gh-pages.yml` builds and deploys automatically.

4. Or deploy manually:

   ```bash
   npm run build:gh-pages
   npx angular-cli-ghpages --dir=dist/planora/browser
   ```

## Usage Notes

- **First launch** starts with empty tasks and notes (no demo data). Optional sample data is available in Settings.
- **Reminders** require tasks with “Enable reminder” and a datetime; allow browser notifications in Settings.
- **Dark mode** persists via localStorage.
- **Export PDF** is available under Settings.
- **Install as PWA:** Use “Install app” in the browser (Chrome/Edge) after a production build.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Dev server |
| `npm run build` | Production build |
| `npm run build:gh-pages` | Build with GitHub Pages base href |

## Browser Support

- Chrome / Edge (recommended for notifications & PWA)
- Firefox
- Safari (limited notification support)

## License

MIT — free to use and modify.

---

Built with Angular — **Planora** helps you plan your day without a backend.
