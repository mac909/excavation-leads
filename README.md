# DigSite Leads — Excavation Lead-Capture POC

Proof-of-concept "digital real estate" demo: a public page where property owners/contractors
submit excavation projects (with a map pin on the site), and an admin dashboard to review and work the
resulting leads.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind 4 · Prisma 6 · Postgres · Leaflet/OpenStreetMap · Zod

## Local development

Requires Node 20+ and a Postgres database. The demo DB runs in Docker:

```bash
docker start excavation-leads-pg   # created with:
# docker run -d --name excavation-leads-pg -e POSTGRES_PASSWORD=postgres \
#   -e POSTGRES_DB=excavation_leads -p 54322:5432 postgres:16

npm install
npx prisma db push   # sync schema (no migrations for the POC)
npm run reseed       # wipe + load 20 demo leads
npm run dev          # http://localhost:3000
```

`.env` (see `.env.example`):

- `DATABASE_URL` — Postgres connection string
- `ADMIN_PASSWORD` — shared password for `/admin` (demo default: `dig-demo-2026`)

## Routes

- `/` — public lead form with click-to-drop-pin map (Nominatim reverse-geocodes the address)
- `/api/leads` — POST endpoint, Zod-validated
- `/admin` — password-gated dashboard: status/type filters, date sort, all-leads map
- `/admin/leads/[id]` — lead detail + lead status updates

## Resetting the demo

`npm run reseed` wipes all leads (including live submissions and status changes) and reloads
the 20 seeded Austin-area leads. Run it before each stakeholder demo.

## Deploying (Vercel + Neon)

1. Create a free [Neon](https://neon.tech) Postgres project; copy the **pooled** connection
   string (required on serverless, or connections exhaust under cold starts).
2. Push this repo to GitHub and import it into [Vercel](https://vercel.com). The build works
   as-is (`postinstall` runs `prisma generate`).
3. Set env vars in Vercel: `DATABASE_URL` (pooled Neon string) and `ADMIN_PASSWORD`.
4. Push the schema and seed the production DB once, from your machine:
   ```bash
   DATABASE_URL="<neon-pooled-url>" npx prisma db push
   DATABASE_URL="<neon-pooled-url>" npm run reseed
   ```
5. Warm the URL once before presenting (Neon free tier cold-starts ~1s after idle).

## POC limitations (intentional)

No user accounts, notifications, uploads, spam protection, rate limiting, migrations,
tests, CI, or pagination beyond `take: 100`. Auth is a single shared password stored as a
hashed cookie — demo-grade only.
