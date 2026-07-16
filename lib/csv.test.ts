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
