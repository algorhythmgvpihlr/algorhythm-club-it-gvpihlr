"use server";

import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deleteByUrlOrId } from "@/lib/google-drive";
import { Prisma } from "@prisma/client";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  shortOverview: z.string().min(1, "Overview is required"),
  detailedDescription: z.string().default(""),
  coverImage: z.string().optional().nullable(),
  status: z.string().min(1, "Status is required"),
  registrationStatus: z.string().min(1, "Registration status is required"),
  googleFormUrl: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
});

function cleanDriveUrl(url?: string | null) {
  if (!url) return url;

  let cleaned = url.trim();

  // Remove accidental Markdown link formatting:
  // [https://example.com](https://example.com)
  const markdownMatch = cleaned.match(/^\[.*?\]\((https?:\/\/.*?)\)$/);

  if (markdownMatch?.[1]) {
    cleaned = markdownMatch[1];
  }

  // Remove accidental surrounding quotes
  cleaned = cleaned.replace(/^["']|["']$/g, "");

  return cleaned;
}

function cleanEventData(data: z.infer<typeof eventSchema>) {
  return {
    ...data,
    coverImage: cleanDriveUrl(data.coverImage),
    googleFormUrl: data.googleFormUrl?.trim() || null,
    images: data.images?.map((url) => cleanDriveUrl(url)!).filter(Boolean),
  };
}

export async function getEvents() {
  return await prisma.event.findMany({
    orderBy: {
      startDate: "desc",
    },
    include: {
      images: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });
}

export async function createEvent(data: z.infer<typeof eventSchema>) {
  const session = await getAuthSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    const parsed = eventSchema.parse(data);
    const cleaned = cleanEventData(parsed);

    // Prevent duplicate slugs from causing an unexplained Prisma 500.
    const existingEvent = await prisma.event.findUnique({
      where: {
        slug: cleaned.slug,
      },
    });

    if (existingEvent) {
      throw new Error(
        `An event with the slug "${cleaned.slug}" already exists. Please use a different slug or edit the existing event.`
      );
    }

    const { images, ...eventData } = cleaned;

    const event = await prisma.event.create({
      data: {
        ...eventData,
        images:
          images && images.length > 0
            ? {
              create: images.map((url, index) => ({
                url,
                order: index,
              })),
            }
            : undefined,
      },
      include: {
        images: true,
      },
    });

    revalidatePath("/admin/events");
    revalidatePath("/events");
    revalidatePath("/");
    revalidatePath(`/events/${event.slug}`);

    return event;
  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Failed to create event.");
  }
}

export async function updateEvent(
  id: string,
  data: z.infer<typeof eventSchema>
) {
  const session = await getAuthSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    const parsed = eventSchema.parse(data);
    const cleaned = cleanEventData(parsed);

    const oldEvent = await prisma.event.findUnique({
      where: {
        id,
      },
      include: {
        images: true,
      },
    });

    if (!oldEvent) {
      throw new Error("Event not found.");
    }

    // If slug is being changed, make sure another event isn't using it.
    if (cleaned.slug !== oldEvent.slug) {
      const duplicateSlug = await prisma.event.findUnique({
        where: {
          slug: cleaned.slug,
        },
      });

      if (duplicateSlug) {
        throw new Error(
          `An event with the slug "${cleaned.slug}" already exists.`
        );
      }
    }

    // Delete old cover from Drive only when it has actually changed.
    if (
      cleaned.coverImage !== undefined &&
      cleaned.coverImage !== oldEvent.coverImage
    ) {
      if (oldEvent.coverImage) {
        await deleteByUrlOrId(oldEvent.coverImage);
      }
    }

    // Delete removed gallery images from Drive.
    if (cleaned.images !== undefined) {
      const oldImageUrls = oldEvent.images.map((image) => image.url);

      const newImageUrls = cleaned.images;

      const removedImages = oldImageUrls.filter(
        (url) => !newImageUrls.includes(url)
      );

      for (const url of removedImages) {
        await deleteByUrlOrId(url);
      }
    }

    const { images, ...eventData } = cleaned;

    const event = await prisma.event.update({
      where: {
        id,
      },
      data: {
        ...eventData,

        images:
          images !== undefined
            ? {
              deleteMany: {},
              create: images.map((url, index) => ({
                url,
                order: index,
              })),
            }
            : undefined,
      },
      include: {
        images: true,
      },
    });

    revalidatePath("/admin/events");
    revalidatePath("/events");
    revalidatePath(`/events/${event.slug}`);
    revalidatePath("/");

    return event;
  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Failed to update event.");
  }
}

export async function deleteEvent(id: string) {
  const session = await getAuthSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    const oldEvent = await prisma.event.findUnique({
      where: {
        id,
      },
      include: {
        images: true,
      },
    });

    if (!oldEvent) {
      throw new Error("Event not found.");
    }

    if (oldEvent.coverImage) {
      await deleteByUrlOrId(oldEvent.coverImage);
    }

    for (const image of oldEvent.images) {
      await deleteByUrlOrId(image.url);
    }

    await prisma.event.delete({
      where: {
        id,
      },
    });

    revalidatePath("/admin/events");
    revalidatePath("/events");
    revalidatePath("/");

    return {
      success: true,
    };
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Failed to delete event.");
  }
}