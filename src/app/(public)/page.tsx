import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getEvents } from "@/app/actions/event";
import { getMagazines } from "@/app/actions/magazine";
import { getSettings } from "@/app/actions/settings";
import {
  ArrowRight,
  Calendar,
  BookOpen,
  Cpu,
} from "lucide-react";

function getDriveFileId(url?: string | null) {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    // Handles:
    // https://drive.google.com/uc?export=view&id=FILE_ID
    // https://drive.google.com/thumbnail?id=FILE_ID
    const id = parsed.searchParams.get("id");

    if (id) return id;

    // Handles:
    // https://drive.google.com/file/d/FILE_ID/view
    const match = parsed.pathname.match(/\/file\/d\/([^/]+)/);

    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

function getMediaUrl(url?: string | null) {
  if (!url) return null;

  const fileId = getDriveFileId(url);

  return fileId ? `/api/media/${fileId}` : url;
}

export default async function HomePage() {
  const [events, magazines, settings] = await Promise.all([
    getEvents(),
    getMagazines(),
    getSettings(),
  ]);

  /*
   * Find all upcoming events and sort them
   * from nearest to farthest.
   */
  const upcomingEvents = events
    .filter((event) => event.status === "UPCOMING")
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() -
        new Date(b.startDate).getTime()
    );

  /*
   * Count events that have already been conducted.
   */
  const completedEventsCount = events.filter(
    (event) => event.status !== "UPCOMING"
  ).length;

  /*
   * Featured Event:
   * 1. Show nearest upcoming event if available.
   * 2. Otherwise show most recently completed event.
   */
  const featuredEvent =
    upcomingEvents[0] ||
    events
      .filter((event) => event.status !== "UPCOMING")
      .sort(
        (a, b) =>
          new Date(b.startDate).getTime() -
          new Date(a.startDate).getTime()
      )[0];

  const latestMagazine = magazines[0];

  return (
    <div className="flex flex-col min-h-screen">

      {/* =========================================================
          HERO SECTION
      ========================================================= */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-background">

        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10" />

        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-tech-teal/5 to-transparent -z-10 blur-3xl" />

        <div className="container mx-auto px-4 text-center relative z-10">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/50 text-tech-teal text-sm font-medium mb-8">
            <Cpu size={16} />
            GVPIHLR IT Department
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6">
            ALGORHYTHM CLUB
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 font-medium tracking-wide">
            Turn Into Code
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">

            <Link href="/events">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto text-lg h-12 px-8 font-semibold shadow-lg shadow-tech-teal/20"
              >
                Explore Events
              </Button>
            </Link>

            <Link href="/team">
              <Button
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:bg-muted w-full sm:w-auto text-lg h-12 px-8"
              >
                Meet Our Team
              </Button>
            </Link>

          </div>
        </div>
      </section>

      {/* =========================================================
          ABOUT SNIPPET
      ========================================================= */}
      <section className="py-24 bg-card border-y border-border">
        <div className="container mx-auto px-4 max-w-4xl text-center">

          <h2 className="text-3xl font-bold text-foreground mb-6">
            About AlgoRhythm
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            AlgoRhythm Club is an initiative of the Department of Information
            Technology at GVPIHLR, started in 2024 with the aim of helping
            students develop and strengthen the technical skills needed for
            placements and future careers. Since its inception, AlgoRhythm has
            conducted {completedEventsCount} technical events that give
            students opportunities to learn, test, and improve their skills
            in Aptitude and Coding.
          </p>

          {/* CTRL + CODE + CREATE */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 mt-16 mb-8">

            <Card className="bg-background border-border shadow-none flex-1 w-full max-w-sm">
              <CardContent className="p-8 text-center">

                <h3 className="text-2xl font-black text-foreground mb-4 text-tech-teal tracking-widest">
                  CTRL
                </h3>

                <p className="text-muted-foreground text-sm">
                  Control your fundamentals and strengthen your technical
                  foundation.
                </p>

              </CardContent>
            </Card>

            <div className="text-tech-teal/50 font-black text-2xl hidden md:block">
              +
            </div>

            <Card className="bg-background border-border shadow-none flex-1 w-full max-w-sm">
              <CardContent className="p-8 text-center">

                <h3 className="text-2xl font-black text-foreground mb-4 text-tech-teal tracking-widest">
                  CODE
                </h3>

                <p className="text-muted-foreground text-sm">
                  Develop problem-solving and programming skills through coding
                  challenges.
                </p>

              </CardContent>
            </Card>

            <div className="text-tech-teal/50 font-black text-2xl hidden md:block">
              +
            </div>

            <Card className="bg-background border-border shadow-none flex-1 w-full max-w-sm">
              <CardContent className="p-8 text-center">

                <h3 className="text-2xl font-black text-foreground mb-4 text-tech-teal tracking-widest">
                  CREATE
                </h3>

                <p className="text-muted-foreground text-sm">
                  Turn ideas and skills into practical solutions through
                  projects and technical activities.
                </p>

              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* =========================================================
          PLACEMENT FOCUS & STATISTICS
      ========================================================= */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

            {/* Placement Focus */}
            <div>

              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Placement Process
              </h2>

              <p className="text-lg text-muted-foreground mb-8">
                Placement drives generally involve three major phases:
              </p>

              <div className="space-y-4 mb-8">

                <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border">
                  <div className="text-2xl font-black text-tech-teal opacity-50">
                    01
                  </div>

                  <div className="text-xl font-bold text-foreground">
                    Aptitude
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border">
                  <div className="text-2xl font-black text-tech-teal opacity-50">
                    02
                  </div>

                  <div className="text-xl font-bold text-foreground">
                    Coding
                  </div>
                </div>

              </div>

              <div className="inline-block bg-tech-teal/10 text-tech-teal px-4 py-3 rounded-lg border border-tech-teal/20 font-medium">
                AlgoRhythm primarily focuses on Aptitude and Coding.
              </div>

            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              <Card className="bg-card border-border shadow-none">
                <CardContent className="p-8 text-center flex flex-col justify-center items-center h-full">

                  <div className="text-5xl font-black text-foreground mb-2">
                    2024
                  </div>

                  <div className="text-muted-foreground font-medium uppercase tracking-wider text-sm">
                    Established
                  </div>

                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-none">
                <CardContent className="p-8 text-center flex flex-col justify-center items-center h-full">

                  <div className="text-5xl font-black text-foreground mb-2">
                    {completedEventsCount}
                  </div>

                  <div className="text-muted-foreground font-medium uppercase tracking-wider text-sm">
                    Events Conducted
                  </div>

                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-none sm:col-span-2">
                <CardContent className="p-8 text-center flex flex-col justify-center items-center h-full">

                  <div className="text-3xl font-black text-foreground mb-2">
                    Aptitude + Coding
                  </div>

                  <div className="text-muted-foreground font-medium uppercase tracking-wider text-sm">
                    Core Focus
                  </div>

                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FEATURED EVENT
      ========================================================= */}
      {featuredEvent && (
        <section className="py-24 bg-card border-t border-border">

          <div className="container mx-auto px-4">

            <div className="bg-background rounded-2xl border border-border p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 shadow-sm">

              {/* Event Information */}
              <div className="flex-1 space-y-6">

                <div className="inline-block bg-tech-teal/10 text-tech-teal px-3 py-1 rounded-full text-sm font-semibold border border-tech-teal/20">
                  {featuredEvent.status === "UPCOMING"
                    ? "Upcoming Event"
                    : "Latest Event"}
                </div>

                <h2 className="text-3xl md:text-5xl font-bold text-foreground">
                  {featuredEvent.title}
                </h2>

                <div className="flex items-center gap-2 text-tech-teal font-medium">
                  <Calendar size={18} />

                  <span>
                    {new Date(
                      featuredEvent.startDate
                    ).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <p className="text-muted-foreground max-w-lg">
                  {featuredEvent.shortOverview}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-4">

                  <Link href={`/events/${featuredEvent.slug}`}>
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                    >
                      View Event
                      <ArrowRight size={20} />
                    </Button>
                  </Link>

                  {featuredEvent.status === "UPCOMING" &&
                    featuredEvent.registrationStatus === "OPEN" &&
                    featuredEvent.googleFormUrl && (
                      <a
                        href={featuredEvent.googleFormUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          size="lg"
                          variant="outline"
                          className="border-border text-foreground hover:bg-muted"
                        >
                          Register Now
                        </Button>
                      </a>
                    )}

                  {featuredEvent.status === "UPCOMING" &&
                    featuredEvent.registrationStatus === "CLOSED" && (
                      <span className="text-muted-foreground font-medium text-sm">
                        Registration Closed
                      </span>
                    )}

                  {featuredEvent.status === "UPCOMING" &&
                    featuredEvent.registrationStatus !== "OPEN" &&
                    featuredEvent.registrationStatus !== "CLOSED" && (
                      <span className="text-muted-foreground font-medium text-sm">
                        Coming Soon
                      </span>
                    )}

                </div>
              </div>

              {/* Event Cover */}
              <div className="w-full md:w-1/3 aspect-[4/3] bg-muted rounded-xl overflow-hidden border border-border relative group shadow-sm flex items-center justify-center">

                {featuredEvent.coverImage ? (
                  <img
                    src={
                      getMediaUrl(featuredEvent.coverImage) ||
                      featuredEvent.coverImage
                    }
                    alt={featuredEvent.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Calendar size={64} />
                  </div>
                )}

              </div>

            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          LATEST MAGAZINE
      ========================================================= */}
      {latestMagazine && (
        <section className="py-24 bg-background border-t border-border">

          <div className="container mx-auto px-4">

            <div className="bg-card rounded-2xl border border-border p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 shadow-sm">

              {/* Magazine Information */}
              <div className="flex-1 space-y-6">

                <div className="inline-block bg-tech-violet/10 text-tech-violet px-3 py-1 rounded-full text-sm font-semibold border border-tech-violet/20">
                  Latest Publication
                </div>

                <h2 className="text-3xl md:text-5xl font-bold text-foreground">
                  {latestMagazine.title}
                </h2>

                <p className="text-xl text-muted-foreground">
                  {latestMagazine.month} {latestMagazine.year}
                </p>

                <p className="text-muted-foreground max-w-lg">
                  Dive into the latest technical articles, club updates, and
                  alumni interviews in our newest magazine edition.
                </p>

                <div className="pt-4">

                  {(() => {
                    const pdfFileId = getDriveFileId(latestMagazine.pdfUrl);

                    const pdfPreviewUrl = pdfFileId
                      ? `https://drive.google.com/file/d/${pdfFileId}/preview`
                      : latestMagazine.pdfUrl;

                    return pdfPreviewUrl ? (
                      <a
                        href={pdfPreviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          size="lg"
                          className="bg-tech-violet hover:bg-tech-violet/90 text-white gap-2"
                        >
                          <BookOpen size={20} />
                          Read Magazine
                        </Button>
                      </a>
                    ) : null;
                  })()}

                </div>
              </div>

              {/* Magazine Cover */}
              <div className="w-full md:w-1/3 aspect-[3/4] bg-muted rounded-xl overflow-hidden border border-border relative group shadow-sm">

                {latestMagazine.coverImage ? (
                  <img
                    src={
                      getMediaUrl(latestMagazine.coverImage) ||
                      latestMagazine.coverImage
                    }
                    alt={latestMagazine.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <BookOpen size={64} />
                  </div>
                )}

              </div>

            </div>
          </div>
        </section>
      )}

    </div>
  );
}