export function csvField(value: string | number | null): string {
  if (value === null) return "";
  if (typeof value === "number") return String(value);
  const guarded = /^[=+\-@]/.test(value) ? `'${value}` : value;
  if (/[",\r\n]/.test(guarded)) return `"${guarded.replaceAll('"', '""')}"`;
  return guarded;
}
