@AGENTS.md

# DigSite Leads — Workspace Context

Vault: /Users/masonmccabe/consulting/vaults/digsite
Shape: single-repo

## Engagement
- Client: DigSite Leads (personal/internal POC — no external client)
- Objective: excavation lead-capture "digital real estate" demo (public form + admin dashboard)
- Timeline: none fixed
- Consultant notes live in the vault above — NOT in this repo. Never commit vault content or this file's analysis into client repos.

## Workspace Manifest

| Unit (dir or package path) | Role | Stack | Test cmd | Lint/Typecheck | Dev cmd |
|---|---|---|---|---|---|
| . | fullstack demo app (public lead form + admin dashboard) | Next.js 16 / React 19 / Tailwind 4 / Prisma 6 / Postgres / Leaflet / zod | `npm test` (Vitest) | `npm run lint` | `npm run dev` (DB first: `docker start excavation-leads-pg`; reseed: `npm run reseed`) |

Graphify: installed — workspace graph at ./graphify-out/.

## Cross-repo contracts
See vault notes with `type: contract`. Headline seams (internal, single repo):
- Admin session auth: `lib/auth.ts` sessionToken ↔ `proxy.ts` gate ↔ `app/admin/actions.ts` login
- Lead shape: zod `leadSchema` ↔ Prisma `Lead` ↔ `POST /api/leads` ↔ `lib/labels.ts`

## Standing instructions
- Start substantive sessions with /onboard; it briefs from the vault.
- No task is complete without /deliver (tests green + manual checklist filed).
- /refresh reconciles the vault after other developers' changes — never regenerate the vault wholesale.
- Verification checklists are filed only by /deliver into the vault — subagents never create their own.
- Decision notes in the vault are never silently rewritten.
- Do not commit, push, or open PRs in client repos without explicit instruction per action.

## Conventions
- Vault note types: fact | decision | contract | stakeholder | verification (see note frontmatter).
- Verification queue: <vault>/verification/ — items with status: pending-verification await human sign-off.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
