"use server";

import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  startDate: z.date(),
  endDate: z.date().optional().nullable(),
  shortOverview: z.string().min(1, "Overview is required"),
  detailedDescription: z.string().min(1, "Description is required"),
  coverImage: z.string().optional().nullable(),
  status: z.string().min(1),
  registrationStatus: z.string().min(1),
  googleFormUrl: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
});

export async function getEvents() {
  return await prisma.event.findMany({
    orderBy: { startDate: "desc" },
    include: { images: true }
  });
}

export async function createEvent(data: z.infer<typeof eventSchema>) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  const { images, ...validated } = eventSchema.parse(data);
  const event = await prisma.event.create({
    data: {
      ...validated,
      images: images && images.length > 0 ? {
        create: images.map((url, i) => ({ url, order: i }))
      } : undefined
    }
  });
  
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
  return event;
}

export async function updateEvent(id: string, data: z.infer<typeof eventSchema>) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  const { images, ...validated } = eventSchema.parse(data);
  const event = await prisma.event.update({
    where: { id },
    data: {
      ...validated,
      images: images !== undefined ? {
        deleteMany: {},
        create: images.map((url, i) => ({ url, order: i }))
      } : undefined
    },
  });
  
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath(`/events/${event.slug}`);
  revalidatePath("/");
  return event;
}

export async function deleteEvent(id: string) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  await prisma.event.delete({ where: { id } });
  
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
  return { success: true };
}
