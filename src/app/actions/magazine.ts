"use server";

import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deleteByUrlOrId } from "@/lib/google-drive";

const magazineSchema = z.object({
  title: z.string().min(1, "Title is required"),
  month: z.string().min(1, "Month is required"),
  year: z.string().min(4, "Year is required"),
  coverImage: z.string().optional().nullable(),
  pdfUrl: z.string().min(1, "PDF URL is required"),
});

export async function getMagazines() {
  return await prisma.magazine.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function createMagazine(data: z.infer<typeof magazineSchema>) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  const validated = magazineSchema.parse(data);
  const magazine = await prisma.magazine.create({ data: validated });
  
  revalidatePath("/admin/magazines");
  revalidatePath("/magazines");
  revalidatePath("/");
  return magazine;
}

export async function updateMagazine(id: string, data: z.infer<typeof magazineSchema>) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  const validated = magazineSchema.parse(data);

  const oldMagazine = await prisma.magazine.findUnique({ where: { id } });
  if (oldMagazine) {
    if (validated.coverImage !== undefined && validated.coverImage !== oldMagazine.coverImage) {
      await deleteByUrlOrId(oldMagazine.coverImage);
    }
    if (validated.pdfUrl !== undefined && validated.pdfUrl !== oldMagazine.pdfUrl) {
      await deleteByUrlOrId(oldMagazine.pdfUrl);
    }
  }

  const magazine = await prisma.magazine.update({
    where: { id },
    data: validated,
  });
  
  revalidatePath("/admin/magazines");
  revalidatePath("/magazines");
  revalidatePath("/");
  return magazine;
}

export async function deleteMagazine(id: string) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  const oldMagazine = await prisma.magazine.findUnique({ where: { id } });
  if (oldMagazine) {
    await deleteByUrlOrId(oldMagazine.coverImage);
    await deleteByUrlOrId(oldMagazine.pdfUrl);
  }

  await prisma.magazine.delete({ where: { id } });
  
  revalidatePath("/admin/magazines");
  revalidatePath("/magazines");
  revalidatePath("/");
  return { success: true };
}
