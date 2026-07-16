# CSV Export of Leads — Design

2026-07-16 · Status: approved

## Problem

Admins can view/filter leads at `/admin` but can't get them out of the app. Add a CSV
export of the lead list that opens cleanly in Excel.

## Decisions

- **Scope:** respects current `status`/`type` filters and `sort`, but exports ALL matching
  rows (no `take: 100` display cap).
- **Values:** human labels from `lib/labels.ts`, not raw enums.
- **Mechanism:** GET route handler under `/admin` (approach A) — proxy-gated, native download.
- **Tests:** Vitest (new to repo — adds `npm test`).

## Components

### `lib/csv.ts` (new, pure)
- `csvEscape(value: string): string` — RFC 4180: wrap in quotes if field contains `,`,
  `"`, `\r`, or `\n`; double embedded quotes. Formula-injection guard: if the raw value
  starts with `=`, `+`, `-`, or `@`, prefix with `'` before escaping (lead fields are
  public user input). Applies to text fields only — numeric lat/lng are emitted via
  `String(number)` and never guarded (a guarded `-97.7` would break as a number in Excel).
- `leadsToCsv(leads: LeadRow[]): string` — header row + one row per lead, CRLF line
  endings, `\uFEFF` BOM prefix (Excel UTF-8 detection). `LeadRow` is a plain-object type
  (no Prisma import) so tests need no DB.
- Columns: Received (`yyyy-MM-dd HH:mm`, UTC), Name, Email, Phone, Address, Project type,
  Description, Timeline, Budget, Status, Lat, Lng.

### `app/admin/export/route.ts` (new)
- GET; parses `status`/`type`/`sort` with the same validation as the dashboard
  (`app/admin/(dashboard)/page.tsx:24-27`), queries `prisma.lead.findMany({ where,
  orderBy })` — no cap.
- Response: `leadsToCsv(...)`, `Content-Type: text/csv; charset=utf-8`,
  `Content-Disposition: attachment; filename="leads-<yyyy-mm-dd>.csv"`.
- Auth: none in-file — `proxy.ts` already gates the `/admin` prefix.

### Dashboard link
- "Export CSV" link beside the filters form in `app/admin/(dashboard)/page.tsx`, href
  `/admin/export?<current params>` built like the existing `sortHref()` helper.

## Testing

Vitest unit tests on `lib/csv.ts`:
- comma in company name; embedded quotes; multiline description
- formula-injection prefix (`=SUM(...)` name)
- BOM present exactly once; CRLF endings; header row correct
- empty lead list → header only
- label mapping (enum → human label) and date formatting

Manual verification (filed as /deliver checklist):
- Export with no filters and with status+type filters; open both in Excel
- Columns split correctly; unicode (e.g. accented name) intact; multiline description
  stays in one cell; row count matches the "All leads"/filtered stat card
- Filename carries today's date

## Out of scope

- Streaming (lead counts are POC-scale)
- Re-importable raw-enum export
- XLSX format
