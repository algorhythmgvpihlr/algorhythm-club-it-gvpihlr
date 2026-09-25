import { getMagazines } from "@/app/actions/magazine";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

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

export default async function MagazinesPage() {
  const magazines = await getMagazines();

  return (
    <div className="pt-32 pb-24 container mx-auto px-4 min-h-screen">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Magazines
        </h1>

        <p className="text-xl text-zinc-400">
          Explore our publications and technical articles.
        </p>
      </div>

      {magazines.length === 0 ? (
        <p className="text-zinc-500 text-center py-12">
          No magazines published yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {magazines.map((mag) => {
            // Cover image continues using our secure media proxy
            const coverUrl = getMediaUrl(mag.coverImage);

            // PDF uses Google Drive preview instead of the media proxy.
            // This opens the PDF in the browser rather than downloading it.
            const pdfFileId = getDriveFileId(mag.pdfUrl);

            const pdfUrl = pdfFileId
              ? `https://drive.google.com/file/d/${pdfFileId}/preview`
              : mag.pdfUrl;

            return (
              <Card
                key={mag.id}
                className="bg-zinc-900 border-zinc-800 group hover:border-zinc-700 transition-colors overflow-hidden"
              >
                {/* Magazine Cover */}
                <div className="aspect-[3/4] bg-zinc-800 relative overflow-hidden">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={mag.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      <BookOpen size={64} />
                    </div>
                  )}
                </div>

                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {mag.title}
                  </h3>

                  <p className="text-zinc-400 mb-6">
                    {mag.month} {mag.year}
                  </p>

                  {/* Open PDF in Google Drive Preview */}
                  {pdfUrl ? (
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2">
                        <BookOpen size={18} />
                        Read
                      </Button>
                    </a>
                  ) : (
                    <Button
                      disabled
                      className="w-full bg-zinc-700 text-zinc-400 gap-2"
                    >
                      <BookOpen size={18} />
                      PDF Unavailable
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}