# PES Tournament

A full-stack tournament tracker for a 12-player PES league. Tracks league standings, fixtures, knockout bracket, and awards. Admin-only score entry via a password-protected dashboard.

## Stack

- **Next.js 16** (App Router, server actions, server components)
- **Supabase** (Postgres, Realtime, Storage for player badges)
- **Tailwind CSS v4** (CSS-based design tokens, dark theme)
- **bcryptjs** (admin password hashing)
- **TypeScript** — strict, zero `any` types

## Features

- League table with live standings, form strip, tiebreak flags
- 66-match round-robin fixture list with search and filter
- Knockout bracket (SF1, SF2, Final) with live score updates
- 6 awards: Champion, Runner-up, Shield, Golden Boot, Clean Sheet King, Best GD
- Admin dashboard: score entry, walkover declaration, player badge management
- Realtime updates via Supabase Postgres Changes — all public pages refresh live

## Setup

### 1. Supabase

Create a new Supabase project, then run the schema in the SQL editor:

```bash
# Copy and run the contents of:
supabase/schema.sql
```

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Generate once — stored as base64 to avoid $ expansion in dotenv
# Run: node -e "const b=require('bcryptjs'); b.hash('yourpassword',12).then(h=>console.log(Buffer.from(h).toString('base64')))"
ADMIN_PASSWORD_HASH=<base64-of-bcrypt-hash>
```

> **Important:** The admin password hash must be base64-encoded. bcrypt hashes contain `$` characters which dotenv expands as variable references. The app decodes it at runtime.

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin panel is at [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

## Tournament flow

1. **Admin → Players** — Add all 12 players with name, badge image, and colour
2. **Admin → Dashboard** — Click "Start League" to generate all 66 fixtures
3. **Admin → Matches** — Enter scores as matches are played
4. **Dashboard** — Click "Advance to Knockouts" when ready (warns if matches still pending)
5. **Admin → Matches** — Enter SF and Final scores
6. **Dashboard** — Click "Complete Tournament" once all 3 knockout matches are done

## Project structure

```text
app/
  (public pages)        /  /table  /fixtures  /bracket  /awards  /rules
  admin/
    login/              Admin login (unprotected)
    (protected)/        All admin pages — requireAdmin() in layout
      dashboard/
      players/
      matches/
actions/                Server actions (auth, matches, players, tournament)
components/
  ui/                   Primitive components (Button, Input, Modal, Skeleton…)
  FixtureCard.tsx        Shared domain components
  BracketNode.tsx
  Navigation.tsx
hooks/
  useRealtimeMatches.ts  Supabase realtime subscription + router.refresh()
lib/
  standings.ts           League table computation
  fixtures.ts            Round-robin generator (circle method)
  awards.ts              Award computation
  bracket.ts             Knockout bracket builder
  supabase.ts            Browser client (singleton)
  supabase-server.ts     Server client + admin client
types/
  index.ts               All shared TypeScript interfaces
supabase/
  schema.sql             Full DB schema with RLS policies
```

## Deploy

Deploy to Vercel. Set all four environment variables in the Vercel dashboard under **Settings → Environment Variables**. The `SUPABASE_SERVICE_ROLE_KEY` must **not** have a `NEXT_PUBLIC_` prefix.

```bash
npm run build   # verify clean before deploying
```
