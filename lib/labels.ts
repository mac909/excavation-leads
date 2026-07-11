import type { ProjectType, Timeline, BudgetRange, LeadStatus } from "@prisma/client";

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  FOUNDATION_BASEMENT: "Foundation / basement dig",
  POOL: "Pool excavation",
  UTILITY_TRENCHING: "Utility trenching",
  GRADING_CLEARING: "Grading / land clearing",
  DEMOLITION: "Demolition",
  SEPTIC: "Septic system",
  OTHER: "Other",
};

export const TIMELINE_LABELS: Record<Timeline, string> = {
  ASAP: "ASAP",
  ONE_TO_THREE_MONTHS: "1–3 months",
  THREE_TO_SIX_MONTHS: "3–6 months",
  FLEXIBLE: "Flexible",
};

export const BUDGET_LABELS: Record<BudgetRange, string> = {
  UNDER_10K: "Under $10k",
  FROM_10K_TO_25K: "$10k–$25k",
  FROM_25K_TO_50K: "$25k–$50k",
  FROM_50K_TO_100K: "$50k–$100k",
  OVER_100K: "Over $100k",
  UNSURE: "Not sure yet",
};

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  REJECTED: "Rejected",
};

export const STATUS_PIN_COLORS: Record<LeadStatus, string> = {
  NEW: "#3b82f6",
  CONTACTED: "#f59e0b",
  QUALIFIED: "#16a34a",
  REJECTED: "#9ca3af",
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  NEW: "bg-blue-50 text-blue-700 ring-blue-600/20",
  CONTACTED: "bg-amber-50 text-amber-700 ring-amber-600/20",
  QUALIFIED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  REJECTED: "bg-slate-100 text-slate-500 ring-slate-500/20",
};
