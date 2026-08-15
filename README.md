# Ali Hamza Sultan | Portfolio

A portfolio site built with a **neobrutalist design system**, a database-driven content layer, a Markdown blog engine, and a secure admin console.

Built on **Next.js 16 (App Router)** with **Neon Serverless Postgres** and **Vercel Blob**, and tuned for SEO — server-rendered articles, canonical slug URLs, and JSON-LD structured data.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, TypeScript, Tailwind CSS v4 |
| Database | Neon Serverless Postgres |
| File storage | Vercel Blob |
| Auth | NextAuth (credentials, PBKDF2-SHA512) |
| SEO | Metadata API, JSON-LD, dynamic sitemap |

---

## Features

### Content driven by the database
Hero, expertise cards, projects, experience and contact details all read from Postgres, so the site is editable without a redeploy. The homepage is cached with ISR (`revalidate = 3600`).

### Blog engine
- Canonical slug URLs (`/blogs/<slug>`); numeric ids still resolve but are marked `noindex`
- Server-rendered so search engines and LLM crawlers see the full article HTML
- `BlogPosting`, `BreadcrumbList` and auto-extracted `FAQPage` structured data
- Zero-dependency Markdown parser supporting tables, code blocks and inline SVG charts

### Admin console (`/console`)
Edit the hero, projects, experience and blogs, upload media, and read contact-form submissions.

---

## Database Schema

| Table | Purpose |
| :--- | :--- |
| `admins` | Console login (`salt:hash`, PBKDF2-SHA512) |
| `projects` | Project entries with `slug`, tags and cover art |
| `experiences` | Work history with explicit `sort_order` |
| `blogs` | Posts with `slug`, `meta_description` and Markdown `content` |
| `site_cards` | JSONB config for hero, expertise, contact and QR sections |
| `contact_messages` | Contact-form submissions |

---

## Setup

### 1. Install

```bash
npm install
```

### 2. Configure `.env.local`

Copy `.env.local.example` and fill it in:

```env
DATABASE_URL="your-neon-postgres-connection-string"
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
NEXTAUTH_SECRET="a-long-random-string"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="you@example.com"
ADMIN_PASSWORD="a-secure-password"
SITE_URL="https://your-domain.com"
REVALIDATION_SECRET="a-random-token"
```

> The driver is `@neondatabase/serverless`, which talks to Neon's proxy. A plain
> local Postgres will not work without running Neon's local proxy.

### 3. Create tables and seed the admin account

```bash
node scripts/create-tables.mjs
```

### 4. Load content (optional)

```bash
node scripts/seed-content.mjs
```

Resets and repopulates projects, experience, blogs and site cards. Blog bodies
live in `scripts/blogs-data.mjs`. It does not touch `admins` or `contact_messages`.

### 5. Run

```bash
npm run dev
```

Open <http://localhost:3000>. The admin console is at `/console`.

---

## Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run build:analyze` | Bundle analyzer |

---

## Author

**Ali Hamza Sultan** — AI Automation Engineer

- GitHub: [github.com/alihamzasultan](https://github.com/alihamzasultan)
- LinkedIn: [ali-hamza-sultan](https://www.linkedin.com/in/ali-hamza-sultan-ai-automation-engineer/)
- Email: [alihamzasultan6@gmail.com](mailto:alihamzasultan6@gmail.com)

Licensed under the MIT License — see [LICENSE](LICENSE).
