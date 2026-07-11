import { NextResponse } from "next/server";
import { z } from "zod";
import { ProjectType, Timeline, BudgetRange } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const leadSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.email().max(320),
  phone: z.string().min(7).max(40),
  address: z.string().max(500).nullish(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  projectType: z.enum(ProjectType),
  description: z.string().min(1).max(5000),
  timeline: z.enum(Timeline),
  budgetRange: z.enum(BudgetRange),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const lead = await prisma.lead.create({
    data: { ...parsed.data, address: parsed.data.address ?? null },
  });

  return NextResponse.json({ id: lead.id }, { status: 201 });
}
