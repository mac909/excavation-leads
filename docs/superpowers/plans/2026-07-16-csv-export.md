# CSV Export of Leads Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an Excel-safe CSV export of the (filtered) lead list to the admin dashboard, with unit-tested formatting/escaping.

**Architecture:** Pure formatter `lib/csv.ts` (no DB, unit-tested with Vitest) + proxy-gated GET route `app/admin/export/route.ts` that re-runs the dashboard's Prisma query uncapped + an "Export CSV" anchor on the dashboard that carries the current filters.

**Tech Stack:** Next.js 16 (App Router), Prisma 6, Vitest (new), TypeScript.

**Spec:** `docs/superpowers/specs/2026-07-16-csv-export-design.md`

## Global Constraints

- **WORKSPACE RULE — commits:** do NOT run any `git commit` step unless the user has explicitly authorized commits for this task at execution start. If not authorized, skip commit steps and report them as skipped.
- **Next.js version warning (AGENTS.md):** this repo pins a Next.js newer than training data. Before writing/modifying any file under `app/`, read the route-handler docs in `node_modules/next/dist/docs/` and follow them over memory.
- Path alias: `@/*` → `./*` (tsconfig). Vitest must resolve it (config in Task 1).
- CSV format: RFC 4180 quoting, CRLF line endings, single leading `\uFEFF` BOM, formula-injection guard (`=`, `+`, `-`, `@` prefix → leading `'`) on TEXT fields only — numbers never guarded.
- Dates: `yyyy-MM-dd HH:mm`, UTC.
- After all code changes: run `graphify update .` (project rule, no API cost).
- Subagents exploring code MUST run `graphify query "<question>"` before reading raw source (project hook enforces this).

---

### Task 1: Vitest infra + `csvField` escaping (TDD)

**Files:**
- Modify: `package.json` (devDep + `test` script)
- Create: `vitest.config.ts`
- Create: `lib/csv.ts`
- Test: `lib/csv.test.ts`

**Interfaces:**
- Produces: `csvField(value: string | number | null): string` — exported from `lib/csv.ts`. Strings: formula-guarded then RFC 4180-escaped. Numbers: `String(value)`, never guarded/quoted. `null`: empty string.

- [ ] **Step 1: Install Vitest and add test script**

```bash
npm install -D vitest
```

Then in `package.json` `"scripts"`, add:

```json
"test": "vitest run"
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
});
```

- [ ] **Step 3: Write failing tests for `csvField`**

Create `lib/csv.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { csvField } from "./csv";

describe("csvField", () => {
  it("passes plain text through unchanged", () => {
    expect(csvField("Acme Dirtworks")).toBe("Acme Dirtworks");
  });

  it("quotes fields containing commas", () => {
    expect(csvField("Acme Dirtworks, LLC")).toBe('"Acme Dirtworks, LLC"');
  });

  it("doubles embedded quotes and wraps", () => {
    expect(csvField('the "big" dig')).toBe('"the ""big"" dig"');
  });

  it("quotes fields containing newlines (LF and CRLF)", () => {
    expect(csvField("line1\nline2")).toBe('"line1\nline2"');
    expect(csvField("line1\r\nline2")).toBe('"line1\r\nline2"');
  });

  it("guards formula-injection prefixes = + - @ with a leading apostrophe", () => {
    expect(csvField("=SUM(A1:A9)")).toBe("'=SUM(A1:A9)");
    expect(csvField("+1 555 123 4567")).toBe("'+1 555 123 4567");
    expect(csvField("-DANGER")).toBe("'-DANGER");
    expect(csvField("@here")).toBe("'@here");
  });

  it("guards then quotes when both apply", () => {
    expect(csvField('=HYPERLINK("x")')).toBe('"\'=HYPERLINK(""x"")"');
  });

  it("never guards or quotes numbers, including negatives", () => {
    expect(csvField(-97.7431)).toBe("-97.7431");
    expect(csvField(30.2672)).toBe("30.2672");
  });

  it("renders null as empty string", () => {
    expect(csvField(null)).toBe("");
  });
});
```

- [ ] **Step 4: Run tests, verify they fail**

Run: `npm test`
Expected: FAIL — `lib/csv.ts` does not exist / `csvField` not exported.

- [ ] **Step 5: Implement `csvField` in `lib/csv.ts`**

```ts
export function csvField(value: string | number | null): string {
  if (value === null) return "";
  if (typeof value === "number") return String(value);
  const guarded = /^[=+\-@]/.test(value) ? `'${value}` : value;
  if (/[",\r\n]/.test(guarded)) return `"${guarded.replaceAll('"', '""')}"`;
  return guarded;
}
```

- [ ] **Step 6: Run tests, verify they pass**

Run: `npm test`
Expected: PASS (8 tests).

- [ ] **Step 7: Commit (only if user authorized commits)**

```bash
git add package.json package-lock.json vitest.config.ts lib/csv.ts lib/csv.test.ts
git commit -m "feat: add Vitest and RFC 4180 csvField escaping"
```

---

### Task 2: `leadsToCsv` (TDD)

**Files:**
- Modify: `lib/csv.ts`
- Test: `lib/csv.test.ts` (append)

**Interfaces:**
- Consumes: `csvField` from Task 1.
- Produces: `leadsToCsv(leads: LeadRow[]): string` and `type LeadRow` exported from `lib/csv.ts`:

```ts
import {
  PROJECT_TYPE_LABELS,
  TIMELINE_LABELS,
  BUDGET_LABELS,
  STATUS_LABELS,
} from "@/lib/labels";

export type LeadRow = {
  createdAt: Date;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  projectType: keyof typeof PROJECT_TYPE_LABELS;
  description: string;
  timeline: keyof typeof TIMELINE_LABELS;
  budgetRange: keyof typeof BUDGET_LABELS;
  status: keyof typeof STATUS_LABELS;
  lat: number;
  lng: number;
};
```

(Prisma `Lead` objects satisfy `LeadRow` structurally — the route passes them straight in. `lib/labels.ts` uses `import type` only, so this stays runtime-free of Prisma.)

- [ ] **Step 1: Write failing tests for `leadsToCsv`**

Append to `lib/csv.test.ts`:

```ts
import { leadsToCsv, type LeadRow } from "./csv";

const HEADER =
  "Received,Name,Email,Phone,Address,Project type,Description,Timeline,Budget,Status,Lat,Lng";

function makeLead(overrides: Partial<LeadRow> = {}): LeadRow {
  return {
    createdAt: new Date("2026-07-04T16:20:00Z"),
    name: "Jane Digger",
    email: "jane@example.com",
    phone: "555-0100",
    address: "1 Quarry Rd, Austin, TX",
    projectType: "POOL",
    description: "Backyard pool",
    timeline: "ASAP",
    budgetRange: "FROM_10K_TO_25K",
    status: "NEW",
    lat: 30.2672,
    lng: -97.7431,
    ...overrides,
  };
}

describe("leadsToCsv", () => {
  it("starts with exactly one BOM then the header row", () => {
    const csv = leadsToCsv([]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv.slice(1).startsWith(HEADER)).toBe(true);
    expect(csv.indexOf("\uFEFF", 1)).toBe(-1);
  });

  it("emits header only (plus trailing CRLF) for an empty list", () => {
    expect(leadsToCsv([])).toBe(`\uFEFF${HEADER}\r\n`);
  });

  it("uses CRLF between all rows", () => {
    const csv = leadsToCsv([makeLead(), makeLead({ name: "Bob" })]);
    expect(csv.split("\r\n")).toHaveLength(4); // header + 2 rows + trailing ""
    expect(csv).not.toMatch(/[^\r]\n/); // no bare LF row endings
  });

  it("formats a full row: UTC date, labels, quoted address, plain numbers", () => {
    const csv = leadsToCsv([makeLead()]);
    const row = csv.split("\r\n")[1];
    expect(row).toBe(
      '2026-07-04 16:20,Jane Digger,jane@example.com,555-0100,"1 Quarry Rd, Austin, TX",Pool excavation,Backyard pool,ASAP,$10k–$25k,New,30.2672,-97.7431'
    );
  });

  it("maps every enum through its human label", () => {
    const csv = leadsToCsv([
      makeLead({
        projectType: "FOUNDATION_BASEMENT",
        timeline: "ONE_TO_THREE_MONTHS",
        budgetRange: "OVER_100K",
        status: "QUALIFIED",
      }),
    ]);
    expect(csv).toContain("Foundation / basement dig");
    expect(csv).toContain("1–3 months");
    expect(csv).toContain("Over $100k");
    expect(csv).toContain("Qualified");
  });

  it("keeps a multiline description inside one quoted field", () => {
    const csv = leadsToCsv([makeLead({ description: "dig here\nnot there" })]);
    expect(csv).toContain('"dig here\nnot there"');
  });

  it("renders null address as empty field", () => {
    const csv = leadsToCsv([makeLead({ address: null })]);
    expect(csv.split("\r\n")[1]).toContain(",555-0100,,Pool excavation,");
  });

  it("guards a formula-injection name", () => {
    const csv = leadsToCsv([makeLead({ name: "=cmd|calc" })]);
    expect(csv).toContain("'=cmd|calc");
  });
});
```

- [ ] **Step 2: Run tests, verify new ones fail**

Run: `npm test`
Expected: Task 1 tests PASS; `leadsToCsv` tests FAIL (not exported).

- [ ] **Step 3: Implement `leadsToCsv`**

Append to `lib/csv.ts` (below `csvField`, with the `LeadRow` type and labels import from the Interfaces block above):

```ts
const HEADERS = [
  "Received", "Name", "Email", "Phone", "Address", "Project type",
  "Description", "Timeline", "Budget", "Status", "Lat", "Lng",
];

function formatUtc(d: Date): string {
  return d.toISOString().slice(0, 16).replace("T", " ");
}

export function leadsToCsv(leads: LeadRow[]): string {
  const rows = leads.map((l) =>
    [
      csvField(formatUtc(l.createdAt)),
      csvField(l.name),
      csvField(l.email),
      csvField(l.phone),
      csvField(l.address),
      csvField(PROJECT_TYPE_LABELS[l.projectType]),
      csvField(l.description),
      csvField(TIMELINE_LABELS[l.timeline]),
      csvField(BUDGET_LABELS[l.budgetRange]),
      csvField(STATUS_LABELS[l.status]),
      csvField(l.lat),
      csvField(l.lng),
    ].join(",")
  );
  return "\uFEFF" + [HEADERS.join(","), ...rows].map((r) => r + "\r\n").join("");
}
```

- [ ] **Step 4: Run tests, verify all pass**

Run: `npm test`
Expected: PASS (16 tests).

- [ ] **Step 5: Commit (only if user authorized commits)**

```bash
git add lib/csv.ts lib/csv.test.ts
git commit -m "feat: leadsToCsv formatter (BOM, CRLF, labels, escaping)"
```

---

### Task 3: Export route + dashboard link

**Files:**
- Create: `app/admin/export/route.ts`
- Modify: `app/admin/(dashboard)/page.tsx` (header block, ~lines 68-75)

**Interfaces:**
- Consumes: `leadsToCsv` from Task 2; `prisma` from `@/lib/prisma`; filter-validation pattern from `app/admin/(dashboard)/page.tsx:24-27`.
- Produces: `GET /admin/export?status=&type=&sort=` → `text/csv` attachment. No new auth — `proxy.ts` gates the `/admin` prefix.

- [ ] **Step 1: Read the pinned Next.js route-handler docs**

Read the route-handlers guide under `node_modules/next/dist/docs/` (find it with `ls node_modules/next/dist/docs/`). If its conventions differ from the code below (handler signature, `Response` usage, `dynamic` export), follow the docs.

- [ ] **Step 2: Create `app/admin/export/route.ts`**

```ts
import { LeadStatus, ProjectType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { leadsToCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const sort = searchParams.get("sort");

  const where: Prisma.LeadWhereInput = {};
  if (status && status in LeadStatus) where.status = status as LeadStatus;
  if (type && type in ProjectType) where.projectType = type as ProjectType;
  const order: Prisma.SortOrder = sort === "asc" ? "asc" : "desc";

  const leads = await prisma.lead.findMany({ where, orderBy: { createdAt: order } });

  const date = new Date().toISOString().slice(0, 10);
  return new Response(leadsToCsv(leads), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${date}.csv"`,
    },
  });
}
```

- [ ] **Step 3: Add the "Export CSV" link to the dashboard**

In `app/admin/(dashboard)/page.tsx`, add an href builder next to the existing `sortHref` helper (after line 53):

```ts
const exportParams = new URLSearchParams();
if (status) exportParams.set("status", status);
if (type) exportParams.set("type", type);
if (sort) exportParams.set("sort", sort);
const exportHref = `/admin/export${exportParams.size ? `?${exportParams}` : ""}`;
```

Then replace the header block (lines 68-75) so the link sits opposite the title (plain `<a>`, not `<Link>` — it's a file download, not a client navigation):

```tsx
<div className="flex flex-wrap items-center justify-between gap-4">
  <div>
    <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-slate-900">Leads</h1>
    <p className="text-sm text-slate-500">
      Incoming excavation projects, newest first.
    </p>
  </div>
  <a
    href={exportHref}
    className="rounded-none border-2 border-slate-900 bg-white px-4 py-2 text-sm font-bold uppercase tracking-widest text-slate-900 transition hover:bg-slate-900 hover:text-white"
  >
    Export CSV
  </a>
</div>
```

- [ ] **Step 4: Lint and test**

Run: `npm run lint && npm test`
Expected: both clean.

- [ ] **Step 5: Smoke-test the route**

```bash
docker start excavation-leads-pg
npm run dev &   # or use the already-running dev server
sleep 5
# unauthenticated request must NOT return CSV (proxy gate):
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/admin/export"   # expect 302/307 redirect
# authenticated: log in via browser or reuse a session cookie, then:
curl -s -H "Cookie: <admin session cookie>" "http://localhost:3000/admin/export?status=NEW" | head -3
```

Expected: redirect code when unauthenticated; with the session cookie, first line is the BOM+header, subsequent lines are NEW leads only.

- [ ] **Step 6: Update the knowledge graph**

Run: `graphify update .`
Expected: rebuild message, no errors.

- [ ] **Step 7: Commit (only if user authorized commits)**

```bash
git add app/admin/export/route.ts "app/admin/(dashboard)/page.tsx"
git commit -m "feat: CSV export route + dashboard link"
```

---

## Post-plan

- Run `consulting-harness:deliver` — files the manual Excel verification checklist
  (download with/without filters, open in Excel: column split, unicode, multiline cell,
  row count vs stat cards, dated filename). No task is done in this workspace without it.
