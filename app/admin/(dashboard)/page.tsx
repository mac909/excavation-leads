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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <div className="flex gap-3 text-sm">
          <span className="text-gray-500">{total} total</span>
          {Object.values(LeadStatus).map((s) => (
            <span key={s} className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[s]}`}>
              {STATUS_LABELS[s]}: {counts[s] ?? 0}
            </span>
          ))}
        </div>
      </div>

      <div className="h-72 overflow-hidden rounded-xl border border-gray-200">
        <AdminMapPanel pins={pins} />
      </div>

      <form method="GET" action="/admin" className="flex flex-wrap items-end gap-3">
        <label className="text-sm text-gray-600">
          Status
          <select name="status" defaultValue={status ?? ""} className="ml-2 rounded-md border border-gray-300 px-2 py-1.5 text-sm">
            <option value="">All</option>
            {Object.values(LeadStatus).map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </label>
        <label className="text-sm text-gray-600">
          Project type
          <select name="type" defaultValue={type ?? ""} className="ml-2 rounded-md border border-gray-300 px-2 py-1.5 text-sm">
            <option value="">All</option>
            {Object.values(ProjectType).map((t) => (
              <option key={t} value={t}>{PROJECT_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </label>
        {sort && <input type="hidden" name="sort" value={sort} />}
        <button className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700">
          Apply
        </button>
        {(status || type) && (
          <Link href="/admin" className="text-sm text-gray-500 underline">
            Clear
          </Link>
        )}
      </form>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Budget</th>
              <th className="px-4 py-3">Timeline</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">
                <Link href={sortHref(order === "desc" ? "asc" : "desc")} className="underline decoration-dotted">
                  Received {order === "desc" ? "↓" : "↑"}
                </Link>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                  No leads match these filters.
                </td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-amber-50/40">
                <td className="px-4 py-3">
                  <Link href={`/admin/leads/${lead.id}`} className="font-medium text-gray-900 hover:underline">
                    {lead.name}
                  </Link>
                  <div className="text-xs text-gray-400">{lead.address ?? "No address"}</div>
                </td>
                <td className="px-4 py-3">{PROJECT_TYPE_LABELS[lead.projectType]}</td>
                <td className="px-4 py-3">{BUDGET_LABELS[lead.budgetRange]}</td>
                <td className="px-4 py-3">{TIMELINE_LABELS[lead.timeline]}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[lead.status]}`}>
                    {STATUS_LABELS[lead.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
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
  );
}
