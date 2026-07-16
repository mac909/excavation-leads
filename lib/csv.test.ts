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
