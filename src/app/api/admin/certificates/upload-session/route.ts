import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { createResumableUploadSession } from "@/lib/google-drive";
import crypto from "crypto";
import path from "path";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, fileName, mimeType, fileSize } = await req.json();

    if (!eventId || !fileName || !mimeType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Determine safe extension
    const ext = path.extname(fileName).toLowerCase();
    const uniqueName = crypto.randomUUID() + (ext || "");

    const folderName = `Certificates/${eventId}`;
    const uploadUrl = await createResumableUploadSession(uniqueName, mimeType, folderName);

    return NextResponse.json({ uploadUrl, uniqueName });
  } catch (error: any) {
    console.error("Failed to create upload session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create upload session" },
      { status: 500 }
    );
  }
}
