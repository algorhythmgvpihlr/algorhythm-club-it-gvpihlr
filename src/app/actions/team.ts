"use server";

import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deleteByUrlOrId } from "@/lib/google-drive";

const teamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  rollNumber: z.string().optional(),
  branch: z.string().optional(),
  position: z.string().min(1, "Position is required"),
  category: z.string().min(1, "Category is required"),
  academicYear: z.string().optional(),
  designation: z.string().optional(),
  photoUrl: z.string().optional(),
});

export async function getTeamMembers() {
  return await prisma.teamMember.findMany({
    orderBy: { createdAt: "asc" }
  });
}

export async function createTeamMember(data: z.infer<typeof teamMemberSchema>) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  const validated = teamMemberSchema.parse(data);
  const member = await prisma.teamMember.create({ data: validated });
  
  revalidatePath("/admin/team");
  revalidatePath("/team");
  return member;
}

export async function updateTeamMember(id: string, data: z.infer<typeof teamMemberSchema>) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  const validated = teamMemberSchema.parse(data);

  const oldMember = await prisma.teamMember.findUnique({ where: { id } });
  if (oldMember && validated.photoUrl !== undefined && validated.photoUrl !== oldMember.photoUrl) {
    await deleteByUrlOrId(oldMember.photoUrl);
  }

  const member = await prisma.teamMember.update({
    where: { id },
    data: validated,
  });
  
  revalidatePath("/admin/team");
  revalidatePath("/team");
  return member;
}

export async function deleteTeamMember(id: string) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  const oldMember = await prisma.teamMember.findUnique({ where: { id } });
  if (oldMember) {
    await deleteByUrlOrId(oldMember.photoUrl);
  }

  await prisma.teamMember.delete({ where: { id } });
  
  revalidatePath("/admin/team");
  revalidatePath("/team");
  return { success: true };
}
