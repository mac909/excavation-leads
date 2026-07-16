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
  if (status && Object.hasOwn(LeadStatus, status)) where.status = status as LeadStatus;
  if (type && Object.hasOwn(ProjectType, type)) where.projectType = type as ProjectType;
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
