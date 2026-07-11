"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { LeadStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, sessionToken } from "@/lib/auth";

export async function login(formData: FormData) {
  const password = formData.get("password");
  if (typeof password !== "string" || password !== process.env.ADMIN_PASSWORD) {
    redirect("/admin/login?error=1");
  }
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, await sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

export async function updateLeadStatus(formData: FormData) {
  const id = formData.get("id");
  const status = formData.get("status");
  if (typeof id !== "string" || typeof status !== "string") return;
  if (!(status in LeadStatus)) return;

  await prisma.lead.update({
    where: { id },
    data: { status: status as LeadStatus },
  });
  revalidatePath("/admin");
  revalidatePath(`/admin/leads/${id}`);
}
