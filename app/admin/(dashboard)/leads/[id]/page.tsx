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
        <Link href="/admin" className="text-sm text-gray-500 hover:underline">
          ← Back to leads
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[lead.status]}`}>
            {STATUS_LABELS[lead.status]}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
              {fields.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
                  <dd className="mt-0.5 text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6">
              <dt className="text-xs uppercase tracking-wide text-gray-400">Project details</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-900">{lead.description}</dd>
            </div>
          </div>

          <form
            action={updateLeadStatus}
            className="flex items-end gap-3 rounded-xl border border-gray-200 bg-white p-6"
          >
            <input type="hidden" name="id" value={lead.id} />
            <label className="text-sm font-medium text-gray-700">
              Triage status
              <select
                name="status"
                key={lead.status}
                defaultValue={lead.status}
                className="mt-1 block rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                {Object.values(LeadStatus).map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </label>
            <button className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
              Update status
            </button>
          </form>
        </div>

        <div className="h-96 overflow-hidden rounded-xl border border-gray-200 lg:h-auto lg:min-h-[24rem]">
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
    </div>
  );
}
