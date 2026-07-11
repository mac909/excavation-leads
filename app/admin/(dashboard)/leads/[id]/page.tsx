import Link from "next/link";
import { notFound } from "next/navigation";
import { LeadStatus } from "@prisma/client";
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
import { updateLeadStatus } from "../../../actions";
import DetailTour from "@/components/tour/DetailTour";

export const dynamic = "force-dynamic";

export default async function LeadDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) notFound();

  const fields: [string, string][] = [
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Address", lead.address ?? "—"],
    ["Coordinates", `${lead.lat.toFixed(5)}, ${lead.lng.toFixed(5)}`],
    ["Project type", PROJECT_TYPE_LABELS[lead.projectType]],
    ["Timeline", TIMELINE_LABELS[lead.timeline]],
    ["Budget", BUDGET_LABELS[lead.budgetRange]],
    [
      "Received",
      lead.createdAt.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    ],
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="text-sm font-medium text-slate-400 transition hover:text-slate-600"
        >
          ← Back to leads
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display break-words text-3xl font-bold uppercase tracking-wide text-slate-900 sm:text-4xl">{lead.name}</h1>
          <span
            className={`inline-flex rounded-none px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset ${STATUS_COLORS[lead.status]}`}
          >
            {STATUS_LABELS[lead.status]}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div id="tour-lead-info" className="rounded-none border-2 border-slate-900 bg-white p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-5 text-sm sm:grid-cols-2">
              {fields.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {label}
                  </dt>
                  <dd className="mt-1 break-words font-medium text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 border-t-2 border-slate-200 pt-5">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Project details
              </dt>
              <dd className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {lead.description}
              </dd>
            </div>
          </div>

          <form
            id="tour-triage"
            action={updateLeadStatus}
            className="flex items-end gap-3 rounded-none border-2 border-slate-900 bg-white p-6"
          >
            <input type="hidden" name="id" value={lead.id} />
            <label className="text-sm font-medium text-slate-700">
              Lead status
              <select
                name="status"
                key={lead.status}
                defaultValue={lead.status}
                className="mt-1.5 block rounded-none border-2 border-slate-300 px-3 py-2 text-sm"
              >
                {Object.values(LeadStatus).map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </label>
            <button className="rounded-none bg-slate-900 px-4 py-2 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-slate-700">
              Update status
            </button>
          </form>
        </div>

        <div id="tour-detail-map" className="h-96 overflow-hidden rounded-none border-2 border-slate-900 lg:h-auto lg:min-h-[24rem]">
          <AdminMapPanel
            pins={[
              {
                id: lead.id,
                lat: lead.lat,
                lng: lead.lng,
                name: lead.name,
                projectTypeLabel: PROJECT_TYPE_LABELS[lead.projectType],
                statusLabel: STATUS_LABELS[lead.status],
                color: STATUS_PIN_COLORS[lead.status],
              },
            ]}
          />
        </div>
      </div>
      <DetailTour />
    </div>
  );
}
