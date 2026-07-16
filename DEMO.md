# Stakeholder Demo Runbook (~10 min)

## Pre-demo setup (5 min before, in order)

```bash
cd ~/Code/POCs/excavation-leads
docker start excavation-leads-pg   # DB up (no-op if already running)
npm run reseed                     # clean 20 demo leads, wipes prior test submissions
npm run dev                        # http://localhost:3000
```

- Open two browser tabs: `localhost:3000` and `localhost:3000/admin` (sign in ahead of time: `dig-demo-2026`)
- Load both once so maps/tiles are cached — needs internet for OSM tiles + geocoding
- Close other tabs/notifications; zoom browser to ~110% if projecting

## Option A: Guided tour (easiest)

Click the amber **Guided tour** button (bottom-right of the public page), or share a link with
`?tour=1` appended (e.g. `https://excavation-leads.vercel.app/?tour=1`) — the tour starts on load.
It spotlights each feature and walks the full loop automatically: public form → pin-drop map →
admin pipeline → lead detail → status updates. If the viewer isn't signed in, the admin hop shows
the login screen and the tour resumes right after they enter the password. Narrate over the
popovers; each step scrolls to the feature it describes.

## Option B: Manual demo script

**1. Frame it (30s)**
"This is a digital property that turns excavation demand into qualified leads. Homeowners and contractors find it, describe their dig, and every submission lands in our pipeline with location, scope, timeline, and budget attached."

**2. Public lead capture (3 min) — tab 1**
- Point out the fields mirror how excavators qualify work: project type, scope, timeline, budget
- Fill the form as a homeowner, e.g.: Pool excavation / "15x30 pool, flat backyard, side gate access" / ASAP / $25k–$50k
- **The money moment:** click the map to drop a pin on a real neighborhood — address auto-fills from the pin. "No typing an address — they show us exactly where the dig is."
- Note submit is disabled until a pin is dropped — every lead has a location
- Submit → confirmation screen

**3. Admin pipeline (4 min) — tab 2 (refresh)**
- Your lead is at the top, status **New**; counts by status across the top
- Map shows all leads color-coded: blue New, amber Contacted, green Qualified, gray Rejected — "geographic density tells us where to focus crews or sell territories"
- Filter by status/project type; sort by date
- Point out **Export CSV** (top-right) — downloads the currently filtered lead list as an Excel-ready CSV
- Open your lead → full detail + site map → change Lead status to **Contacted** → badge and pin update
- "This is the lead-to-revenue loop: capture → contact → quote → booked job"

**4. Close (1 min)**
- Built as a lean POC; deploys to a public URL in ~15 min
- Natural next steps if greenlit: email/SMS alerts on new leads, lead routing to partner contractors, per-lead pricing, multiple metros, spam protection

## Q&A cheat sheet

- "Is this live?" — Local demo; same code deploys to Vercel + Neon free tier, ~15 min
- "What's real vs mock?" — App is fully real; the 20 existing leads are seeded. Anything submitted during the demo is stored for real
- "Auth?" — Shared demo password; real user accounts are deliberately out of POC scope
- "Cost to run?" — Free tiers cover a pilot; map has no API keys or usage fees (OpenStreetMap)
- "Can I get the data out?" — Export CSV button, respects current filters

## Recovery

- Map blank → check internet; refresh page
- Bad/test data showing → `npm run reseed` (safe mid-demo; refresh admin)
- Server dies → rerun `npm run dev`
- Demo again later → rerun full pre-demo setup
