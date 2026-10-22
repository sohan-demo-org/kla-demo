# KLA Demo — Full-Stack Corporate Site

A full-stack demo web application styled after the [KLA](https://www.kla.com) corporate site: a React
single-page front end backed by an Express REST API with SQLite persistence. It covers the main sections of
the real site (Company, Products & Technology, Services, Careers, Newsroom, Investors, Contact), plus working
forms and a small console that shows everything visitors submitted.

> **Demo only.** Not affiliated with, endorsed by, or an official property of KLA Corporation. Product names
> are used for illustration; specs, financials, jobs and news are sample data.

## Features

| Area | What it does | Backed by |
| --- | --- | --- |
| **Home** | KLA-style hero carousel with an animated circuit-board backdrop and the *Performance* panel ($3.66B / $817M / $1.05), featured products, stats, latest news | `GET /api/home` |
| **Header** | Purple utility bar (region picker, KLA Advance / Foundation / Instruments), logo, nav with a Products mega-menu, live site search | `GET /api/search` |
| **Products & Technology** | Category chips + keyword filter (URL-synced), product detail with specs, applications, related products and *Request a Demo* | `GET /api/products`, `GET /api/products/:slug` |
| **Services** | Lifecycle services and engagement model | `GET /api/services` |
| **Careers** | Keyword / team / location filters, job detail page with an application form | `GET /api/careers`, `POST /api/careers/:id/applications` |
| **Newsroom** | Category filters, lead story, article pages | `GET /api/news`, `GET /api/news/:slug` |
| **Investors** | Headline metrics, interactive quarterly chart (revenue / FCF / gross margin), table, dividend, events | `GET /api/investors` |
| **Yield Lab** (`/yield-lab`) | Interactive Klarity-style defect analysis on three synthetic lots: yield-by-wafer chart with SPC limits, wafer maps, spatial signature detection (scratch, reticle repeater, edge ring, center cluster), inspection-tool sensitivity, chamber commonality, and persisted excursions | `GET /api/yield/lots`, `GET /api/yield/lots/:id`, `GET /api/yield/lots/:id/wafers/:slot`, `POST`/`PATCH /api/yield/excursions` |
| **Contact** | Validated contact form (pre-filled from *Request a Demo*), reference number on success | `POST /api/contact` |
| **Footer** | Newsletter signup (deduplicated) | `POST /api/subscriptions` |
| **Demo console** (`/admin`) | Counts plus inquiries, applications, subscribers and Yield Lab excursions; change inquiry and excursion status | `GET /api/admin/summary`, `PATCH /api/contact/:id`, `PATCH /api/yield/excursions/:id` |

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, TypeScript, Vite 6, Tailwind CSS 3, React Router 6 |
| Backend | Node.js, Express 4, TypeScript (tsx), Zod validation |
| Database | SQLite via Node's built-in `node:sqlite` (no native dependencies) |
| Tests | `node:test` integration tests against an in-memory database |
| Tooling | npm workspaces, ESLint, TypeScript |

## Getting started

Requires **Node.js 22.13+** (built-in `node:sqlite`; developed on Node 24).

```bash
npm install     # installs both workspaces
npm run dev     # API on :4000 and web on :5173
```

Open http://localhost:5173. Vite proxies `/api/*` to the API, so no CORS or env setup is needed.

### Production-style run (single port)

```bash
npm run build   # compile the API and bundle the front end
npm start       # API + built front end on http://localhost:4000
```

### Other commands

```bash
npm test            # API integration tests
npm run lint        # ESLint across both workspaces
npm run typecheck   # TypeScript checks across both workspaces
```

### Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `4000` | API port |
| `DB_FILE` | `server/data/kla-demo.db` | SQLite file (created on first run; delete it to reset) |
| `API_URL` | `http://localhost:4000` | Where the Vite dev server proxies `/api` |

## Project layout

```
.
├── client/                 # Vite + React front end
│   └── src
│       ├── components      # Header, Footer, Logo, CircuitBackdrop, WaferArt, PageHeader, icons
│       ├── pages           # Home, Company, Products, ProductDetail, Services, Careers, JobDetail,
│       │                   # Newsroom, Article, Investors, Contact, Search, Admin, NotFound
│       ├── api.ts          # fetch helpers + useApi hook
│       └── index.css       # Tailwind layers and KLA component classes
├── server/                 # Express REST API
│   ├── src
│   │   ├── app.ts          # routes and validation
│   │   ├── db.ts           # SQLite store (contact requests, applications, subscriptions)
│   │   ├── data.ts         # sample content (products, news, jobs, investors…)
│   │   └── index.ts        # entry point
│   └── test/api.test.ts    # integration tests
└── package.json            # npm workspaces + combined scripts
```

## API reference

Base URL: `http://localhost:4000`

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/home` | Hero slides, headline metrics, featured products, latest news |
| GET | `/api/company` | Leadership and history milestones |
| GET | `/api/products` | Products; filter with `?category=` and `?q=` |
| GET | `/api/products/:slug` | Product with `related` products; `404` if unknown |
| GET | `/api/services` | Service offerings |
| GET | `/api/news` | Articles, newest first; filter with `?category=` |
| GET | `/api/news/:slug` | Single article |
| GET | `/api/careers` | `{ jobs, facets }`; filter with `?team=`, `?location=`, `?q=` |
| GET | `/api/careers/:id` | Single job |
| POST | `/api/careers/:id/applications` | Apply (`name`, `email`, `linkedin?`, `coverLetter`) |
| GET | `/api/investors` | Metrics, quarterly history, dividend, events |
| GET | `/api/search?q=` | Search across products, services, news and careers |
| POST | `/api/contact` | Contact request (`name`, `email`, `company`, `topic`, `product?`, `message`) |
| PATCH | `/api/contact/:id` | Update inquiry `status` (`New`, `In Progress`, `Closed`) |
| POST | `/api/subscriptions` | Newsletter signup; `201` new, `200` already subscribed |
| GET | `/api/admin/summary` | Counts plus all inquiries, applications and subscribers |

Validation errors return `400` with per-field issues:

```json
{ "error": "Validation failed", "issues": [{ "field": "email", "message": "A valid email is required" }] }
```

Example:

```bash
curl -X POST http://localhost:4000/api/contact \
  -H 'content-type: application/json' \
  -d '{"name":"Dana Lee","email":"dana@example.com","company":"Example Fab",
       "topic":"Request a demo","product":"Archer Overlay Metrology",
       "message":"We would like to discuss overlay control for EUV layers."}'
```

## Design notes

The look follows the KLA corporate site: a deep purple utility bar over a light header with the thin-stroke
KLA wordmark and blue “+” square, purple semibold navigation, a black hero with a perspective circuit-board
image on the right, a white-ruled *Performance* panel, and solid blue call-to-action buttons. Open Sans is
loaded from Google Fonts. The circuit backdrop is a generated SVG (no image assets), with light pulses
animating along the traces (disabled for `prefers-reduced-motion`).

| Token | Value | Used for |
| --- | --- | --- |
| `kla-purple` | `#3D0A7F` | Utility bar, nav, headings |
| `kla-purple-dark` | `#26064F` | Footer |
| `kla-blue` | `#3B82C8` | Buttons and links |
| `kla-sky` | `#48A9E0` | Logo square, accents, active nav underline |
| `kla-ink` | `#050507` | Hero background |
| `kla-mist` | `#F5F5F7` | Section backgrounds |

Tokens live in `client/tailwind.config.js`; shared classes (`.btn-primary`, `.card`, `.section`, `.heading`,
`.input`, `.chip`) live in `client/src/index.css`.
