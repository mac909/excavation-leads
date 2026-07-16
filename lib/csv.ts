export function csvField(value: string | number | null): string {
  if (value === null) return "";
  if (typeof value === "number") return String(value);
  const guarded = /^[=+\-@]/.test(value) ? `'${value}` : value;
  if (/[",\r\n]/.test(guarded)) return `"${guarded.replaceAll('"', '""')}"`;
  return guarded;
}

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
  return "﻿" + [HEADERS.join(","), ...rows].map((r) => r + "\r\n").join("");
}
