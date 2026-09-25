import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { EventGallery } from "@/components/EventGallery";

function getDriveFileId(url?: string | null) {
  if (!url) return null;

  try {
    let cleaned = url.trim();

    // Handle accidental Markdown formatting:
    // [https://drive.google.com/...](https://drive.google.com/...)
    const markdownMatch = cleaned.match(
      /^\[.*?\]\((https?:\/\/.*?)\)$/
    );

    if (markdownMatch?.[1]) {
      cleaned = markdownMatch[1];
    }

    const parsed = new URL(cleaned);

    // Google Drive URL:
    // https://drive.google.com/uc?export=view&id=FILE_ID
    const id = parsed.searchParams.get("id");

    if (id) {
      return id;
    }

    // Google Drive URL:
    // https://drive.google.com/file/d/FILE_ID/view
    const match = parsed.pathname.match(/\/file\/d\/([^/]+)/);

    if (match?.[1]) {
      return match[1];
    }

    return null;
  } catch {
    return null;
  }
}

function getMediaUrl(url?: string | null) {
  if (!url) return null;

  const fileId = getDriveFileId(url);

  if (fileId) {
    return `/api/media/${fileId}`;
  }

  return url;
}

export default async function EventDetailsPage(
  props: {
    params: Promise<{ slug: string }>;
  }
) {
  const params = await props.params;

  const event = await prisma.event.findUnique({
    where: {
      slug: params.slug,
    },
    include: {
      images: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!event) {
    return notFound();
  }

  const coverImageUrl = getMediaUrl(event.coverImage);

  const galleryImages = event.images.map((image) => ({
    ...image,
    url: getMediaUrl(image.url) ?? image.url,
  }));

  return (
    <div className="pt-32 pb-24 container mx-auto px-4 min-h-screen max-w-4xl">

      {/* HEADER */}
      <div className="mb-8">

        <div className="inline-flex items-center rounded-full bg-zinc-800 px-3 py-1 text-sm font-semibold text-zinc-300 mb-6">
          {event.status}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {event.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-zinc-400 mb-8">

          <div className="flex items-center gap-2">
            <Calendar size={18} />

            <span>
              {new Date(event.startDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          {event.endDate && (
            <div className="flex items-center gap-2">
              <Clock size={18} />

              <span>
                Ends{" "}
                {new Date(event.endDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          )}

        </div>
      </div>

      {/* COVER IMAGE */}
      {coverImageUrl && (
        <div className="w-full aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 mb-12">

          <img
            src={coverImageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />

        </div>
      )}

      {/* DESCRIPTION */}
      <div className="prose prose-invert max-w-none mb-12">

        <h2 className="text-2xl font-bold text-white mb-4 border-b border-zinc-800 pb-2">
          Overview
        </h2>

        <p className="text-zinc-300 text-lg leading-relaxed">
          {event.shortOverview}
        </p>

        {event.detailedDescription && (
          <>
            <h2 className="text-2xl font-bold text-white mb-4 mt-8 border-b border-zinc-800 pb-2">
              Details
            </h2>

            <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {event.detailedDescription}
            </div>
          </>
        )}

      </div>

      {/* REGISTRATION */}
      {event.registrationStatus === "OPEN" &&
        event.googleFormUrl && (
          <div className="bg-cyan-950/30 border border-cyan-900 rounded-xl p-8 text-center mb-12">

            <h3 className="text-2xl font-bold text-white mb-4">
              Registration is Open!
            </h3>

            <p className="text-zinc-300 mb-6">
              Secure your spot for {event.title} before it's too late.
            </p>

            <a
              href={event.googleFormUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-8"
              >
                Register Now
              </Button>
            </a>

          </div>
        )}

      {/* GALLERY */}
      {galleryImages.length > 0 && (
        <EventGallery images={galleryImages} />
      )}

    </div>
  );
}