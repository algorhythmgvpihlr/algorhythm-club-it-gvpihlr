import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const certId = searchParams.get("id");

  if (!certId) {
    return new NextResponse("Missing certificate ID", { status: 400 });
  }

  try {
    const cert = await prisma.certificate.findUnique({
      where: { id: certId },
    });

    if (!cert) {
      return new NextResponse("Certificate not found", { status: 404 });
    }

    // Resolve storage path securely
    const STORAGE_DIR = path.join(process.cwd(), "storage", "certificates");
    const filePath = path.join(STORAGE_DIR, cert.storageKey);

    // Verify it doesn't escape STORAGE_DIR
    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith(STORAGE_DIR)) {
      return new NextResponse("Invalid file path", { status: 403 });
    }

    let fileBuffer;
    try {
      fileBuffer = await fs.readFile(normalizedPath);
    } catch (e) {
      console.error("Failed to read certificate file:", e);
      return new NextResponse("File missing on server", { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", cert.mimeType);
    headers.set("Content-Disposition", `attachment; filename="Algorhythm_Certificate_${cert.rollNumber}.pdf"`);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error("Error downloading certificate:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
