import { NextRequest, NextResponse } from "next/server";
import { driveClient } from "@/lib/google-drive";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return new NextResponse("Missing file ID", {
        status: 400,
      });
    }

    const response = await driveClient.files.get(
      {
        fileId: id,
        alt: "media",
      },
      {
        responseType: "stream",
      }
    );

    const contentType =
      response.headers["content-type"] || "application/octet-stream";

    const stream = response.data as NodeJS.ReadableStream;

    const webStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => {
          controller.enqueue(chunk);
        });

        stream.on("end", () => {
          controller.close();
        });

        stream.on("error", (error) => {
          controller.error(error);
        });
      },
    });

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "Cache-Control":
          "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Media proxy error:", error);

    return new NextResponse("Unable to load media", {
      status: 500,
    });
  }
}