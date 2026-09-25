import { getEvents } from "@/app/actions/event";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import Link from "next/link";

function getDriveFileId(url?: string | null) {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    // Google Drive:
    // /uc?export=view&id=FILE_ID
    // /thumbnail?id=FILE_ID
    const id = parsed.searchParams.get("id");

    if (id) {
      return id;
    }

    // Google Drive:
    // /file/d/FILE_ID/view
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

  let cleaned = url.trim();

  // Handle accidental Markdown URL:
  // [https://...](https://...)
  const markdownMatch = cleaned.match(/^\[.*?\]\((https?:\/\/.*?)\)$/);

  if (markdownMatch?.[1]) {
    cleaned = markdownMatch[1];
  }

  const fileId = getDriveFileId(cleaned);

  if (fileId) {
    return `/api/media/${fileId}`;
  }

  return cleaned;
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function EventsPage() {
  const events = await getEvents();

  const upcoming = events.filter(
    (event) => event.status === "UPCOMING"
  );

  const past = events.filter(
    (event) => event.status !== "UPCOMING"
  );

  return (
    <div className="pt-32 pb-24 container mx-auto px-4 min-h-screen">
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Events
        </h1>

        <p className="text-xl text-zinc-400">
          Discover our hackathons, workshops, and technical sessions.
        </p>
      </div>

      {/* UPCOMING EVENTS */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold text-white mb-8 border-b border-zinc-800 pb-4">
          Upcoming Events
        </h2>

        {upcoming.length === 0 ? (
          <p className="text-zinc-500 text-center py-12">
            No upcoming events scheduled at the moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcoming.map((event) => {
              const coverUrl = getMediaUrl(event.coverImage);

              return (
                <Card
                  key={event.id}
                  className="bg-zinc-900 border-zinc-800 overflow-hidden group"
                >
                  <div className="h-48 bg-zinc-800 relative overflow-hidden">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={event.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600">
                        <Calendar size={48} />
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <div className="text-sm text-cyan-400 font-medium mb-2">
                      {formatDate(event.startDate)}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">
                      {event.title}
                    </h3>

                    <p className="text-zinc-400 line-clamp-2 mb-6">
                      {event.shortOverview}
                    </p>

                    <div className="flex justify-between items-center">
                      <Link href={`/events/${event.slug}`}>
                        <Button
                          variant="outline"
                          className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
                        >
                          Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* PAST EVENTS */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-8 border-b border-zinc-800 pb-4">
          Past Events
        </h2>

        {past.length === 0 ? (
          <p className="text-zinc-500 text-center py-12">
            No past events found.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-75 hover:opacity-100 transition-opacity">
            {past.map((event) => {
              const coverUrl = getMediaUrl(event.coverImage);

              return (
                <Card
                  key={event.id}
                  className="bg-zinc-900 border-zinc-800 overflow-hidden group"
                >
                  <div className="h-48 bg-zinc-800 relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={event.title}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600">
                        <Calendar size={48} />
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <div className="text-sm text-zinc-500 font-medium mb-2">
                      {formatDate(event.startDate)}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">
                      {event.title}
                    </h3>

                    <div className="mt-4">
                      <Link href={`/events/${event.slug}`}>
                        <Button
                          variant="link"
                          className="text-cyan-400 p-0 h-auto"
                        >
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}