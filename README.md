# 🏆 Tournament App

A full-stack tournament manager for PES / eFootball / FIFA friend group leagues.
Supports any number of players, round-robin league + knockout bracket, live standings, and an admin dashboard for score entry.

**Live demo:** [pestourney.netlify.app](https://pestourney.netlify.app)

---

## Features

**Public**
- Live league table — points, GD, GF, form strip, streak badges, position change indicators
- Fixture list grouped by matchday with player filter and status tabs
- Knockout bracket (Semi-finals + Final) with auto-seeding from top 4
- Result pages with scoreline and table impact (position before → after)
- Awards cabinet — Champion, Runner-up, Shield, Golden Boot, Clean Sheet King, Best GD
- H2H records and remaining fixture difficulty per player
- "My Position" personalized banner (saved to localStorage)
- Realtime updates on all pages via Supabase Postgres Changes
- PWA support — add to home screen on mobile
- Dark / light mode

**Admin**
- Password-protected dashboard
- Add any number of players with badge image and color
- Auto-generate all fixtures (round-robin, circle method)
- Enter scores, declare walkovers, reset matches, edit results
- Advance tournament stage (league → knockouts → completed)
- Configurable match durations (league / semi-final / final)

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, Server Actions, Server Components) |
| Database | Supabase (Postgres + Realtime + Storage) |
| Styling | Tailwind CSS v4 (CSS-based design tokens) |
| Animation | Framer Motion |
| Auth | bcryptjs (single admin password, httpOnly cookie) |
| Hosting | Netlify / Vercel (free tier) |
| Language | TypeScript strict, zero `any` types |

---

## Setup

### 1. Clone

```bash
git clone https://github.com/nirxnjxnCodeS/tournament-app.git
cd tournament-app
npm install
```

### 2. Supabase

- Create a new project at [supabase.com](https://supabase.com)
- Go to SQL Editor → New Query
- Paste and run the full contents of `supabase/schema.sql`
- Go to Storage → create a bucket named `badges`, set to public

### 3. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Generate once:
# node -e "const b=require('bcryptjs'); b.hash('yourpassword',12).then(h=>console.log(Buffer.from(h).toString('base64')))"
ADMIN_PASSWORD_HASH=<base64-of-bcrypt-hash>
```

> The hash must be base64-encoded. bcrypt hashes contain `$` which dotenv treats as variable references. The app decodes at runtime.

### 4. Run locally

```bash
npm run dev
```

- Public app: [http://localhost:3000](http://localhost:3000)
- Admin panel: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## Tournament Flow