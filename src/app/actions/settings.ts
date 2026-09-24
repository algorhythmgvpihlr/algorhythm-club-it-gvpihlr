"use server";

import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const settingsSchema = z.object({
  clubName: z.string().min(1, "Club Name is required"),
  description: z.string().min(1, "Description is required"),
  whatsappUrl: z.string().optional().nullable(),
  instagramUrl: z.string().optional().nullable(),
  linkedinUrl: z.string().optional().nullable(),
  footerText: z.string().min(1, "Footer text is required"),
});

export async function getSettings() {
  return await prisma.websiteSettings.findFirst() || await prisma.websiteSettings.create({
    data: {
      clubName: 'AlgoRhythm Club',
      description: 'Technical Club of IT Department, GVPIHLR',
      footerText: '© 2026 AlgoRhythm Club, GVPIHLR',
    }
  });
}

export async function updateSettings(id: string, data: z.infer<typeof settingsSchema>) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  const validated = settingsSchema.parse(data);
  const settings = await prisma.websiteSettings.update({
    where: { id },
    data: validated,
  });
  
  revalidatePath("/", "layout");
  return settings;
}
