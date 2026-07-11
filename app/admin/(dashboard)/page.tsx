import Link from "next/link";
import { LeadStatus, ProjectType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  PROJECT_TYPE_LABELS,
  TIMELINE_LABELS,
  BUDGET_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_PIN_COLORS,
} from "@/lib/labels";
import AdminMapPanel from "@/components/AdminMapPanel";
import AdminTour from "@/components/tour/AdminTour";

export const dynamic = "force-dynamic";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; sort?: string }>;
}) {
  const { status, type, sort } = await searchParams;

  const where: Prisma.LeadWhereInput = {};
  if (status && status in LeadStatus) where.status = status as LeadStatus;
  if (type && type in ProjectType) where.projectType = type as ProjectType;
  const order: Prisma.SortOrder = sort === "asc" ? "asc" : "desc";

  const [leads, statusCounts] = await Promise.all([
    prisma.lead.findMany({ where, orderBy: { createdAt: order }, take: 100 }),
    prisma.lead.groupBy({ by: ["status"], _count: true }),
  ]);

  const counts = Object.fromEntries(statusCounts.map((s) => [s.status, s._count]));
  const total = statusCounts.reduce((sum, s) => sum + s._count, 0);

  const pins = leads.map((l) => ({
    id: l.id,
    lat: l.lat,
    lng: l.lng,
    name: l.name,
    projectTypeLabel: PROJECT_TYPE_LABELS[l.projectType],
    statusLabel: STATUS_LABELS[l.status],
    color: STATUS_PIN_COLORS[l.status],
  }));

  const sortHref = (dir: string) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (type) params.set("type", type);
    params.set("sort", dir);
    return `/admin?${params.toString()}`;
  };

  const statCards: { label: string; count: number; href: string; active: boolean; dot?: string }[] = [
    { label: "All leads", count: total, href: "/admin", active: !status },
    ...Object.values(LeadStatus).map((s) => ({
      label: STATUS_LABELS[s],
      count: counts[s] ?? 0,
      href: `/admin?status=${s}`,
      active: status === s,
      dot: STATUS_PIN_COLORS[s],
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-slate-900">Leads</h1>
          <p className="text-sm text-slate-500">
            Incoming excavation projects, newest first.
          </p>
        </div>
      </div>

      {/* Stat cards (click to filter) */}
      <div id="tour-stats" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`rounded-none border-2 bg-white p-4 transition ${
              card.active
                ? "border-slate-900 shadow-[4px_4px_0_0_#f59e0b]"
                : "border-slate-300 hover:border-slate-900"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              {card.dot && (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: card.dot }}
                />
              )}
              {card.label}
            </div>
            <div className="font-display mt-1 text-3xl font-bold text-slate-900">
              {card.count}
            </div>
          </Link>
        ))}
      </div>

      {/* Map */}
      <div id="tour-map" className="overflow-hidden rounded-none border-2 border-slate-900 bg-white">
        <div className="flex items-center justify-between border-b-2 border-slate-900 px-5 py-3">
          <h2 className="font-display text-lg font-bold uppercase tracking-wide text-slate-900">Lead map</h2>
          <span className="text-xs text-slate-400">
            {leads.length} shown · colored by status
          </span>
        </div>
        <div className="h-72">
          <AdminMapPanel pins={pins} />
        </div>
      </div>

      {/* Filters + table */}
      <div className="overflow-hidden rounded-none border-2 border-slate-900 bg-white">
        <form
          id="tour-filters"
          method="GET"
          action="/admin"
          className="flex flex-wrap items-center gap-3 border-b-2 border-slate-900 bg-slate-50 px-5 py-3"
        >
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            Status
            <select
              name="status"
              defaultValue={status ?? ""}
              className="rounded-none border-2 border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium normal-case tracking-normal text-slate-900"
            >
              <option value="">All</option>
              {Object.values(LeadStatus).map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            Project type
            <select
              name="type"
              defaultValue={type ?? ""}
              className="rounded-none border-2 border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium normal-case tracking-normal text-slate-900"
            >
              <option value="">All</option>
              {Object.values(ProjectType).map((t) => (
                <option key={t} value={t}>{PROJECT_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </label>
          {sort && <input type="hidden" name="sort" value={sort} />}
          <button className="rounded-none bg-slate-900 px-4 py-1.5 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-slate-700">
            Apply
          </button>
          {(status || type) && (
            <Link href="/admin" className="text-sm text-slate-400 underline hover:text-slate-600">
              Clear
            </Link>
          )}
        </form>

        <div id="tour-table">
          {/* Mobile: stacked job cards */}
          <div className="divide-y-2 divide-slate-100 md:hidden">
            {leads.length === 0 && (
              <p className="px-5 py-12 text-center text-slate-400">
                No leads match these filters.
              </p>
            )}
            {leads.map((lead) => (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                className="block p-4 transition hover:bg-amber-50/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold text-slate-900">{lead.name}</span>
                  <span
                    className={`inline-flex shrink-0 rounded-none px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset ${STATUS_COLORS[lead.status]}`}
                  >
                    {STATUS_LABELS[lead.status]}
                  </span>
                </div>
                <div className="mt-0.5 truncate text-xs text-slate-400">
                  {lead.address ?? "No address"}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
                  <span>{PROJECT_TYPE_LABELS[lead.projectType]}</span>
                  <span className="text-slate-300">·</span>
                  <span>{BUDGET_LABELS[lead.budgetRange]}</span>
                  <span className="text-slate-300">·</span>
                  <span>{TIMELINE_LABELS[lead.timeline]}</span>
                  <span className="ml-auto text-slate-400">
                    {lead.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop: full table */}
          <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-xs uppercase tracking-wider text-slate-300">
              <tr>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Project</th>
                <th className="px-5 py-3 font-semibold">Budget</th>
                <th className="px-5 py-3 font-semibold">Timeline</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">
                  <Link
                    href={sortHref(order === "desc" ? "asc" : "desc")}
                    className="underline decoration-dotted underline-offset-2"
                  >
                    Received {order === "desc" ? "↓" : "↑"}
                  </Link>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    No leads match these filters.
                  </td>
                </tr>
              )}
              {leads.map((lead) => (
                <tr key={lead.id} className="transition hover:bg-amber-50/40">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="font-semibold text-slate-900 hover:text-amber-700 hover:underline"
                    >
                      {lead.name}
                    </Link>
                    <div className="mt-0.5 max-w-xs truncate text-xs text-slate-400">
                      {lead.address ?? "No address"}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{PROJECT_TYPE_LABELS[lead.projectType]}</td>
                  <td className="px-5 py-3.5 text-slate-600">{BUDGET_LABELS[lead.budgetRange]}</td>
                  <td className="px-5 py-3.5 text-slate-600">{TIMELINE_LABELS[lead.timeline]}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex rounded-none px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset ${STATUS_COLORS[lead.status]}`}
                    >
                      {STATUS_LABELS[lead.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">
                    {lead.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
      <AdminTour firstLeadId={leads[0]?.id ?? null} />
    </div>
  );
}
