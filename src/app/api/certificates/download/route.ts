import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { downloadFileFromDrive } from "@/lib/google-drive";

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

    let fileBuffer: Buffer;
    try {
      const stream = await downloadFileFromDrive(cert.storageKey);
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      fileBuffer = Buffer.concat(chunks);
    } catch (e) {
      console.error("Failed to read certificate from Google Drive:", e);
      return new NextResponse("File missing on server", { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", cert.mimeType);
    const ext = cert.mimeType.includes("pdf") ? ".pdf" : (cert.mimeType.includes("png") ? ".png" : (cert.mimeType.includes("webp") ? ".webp" : ".jpg"));
    const downloadName = `Algorhythm_Certificate_${cert.rollNumber || cert.studentName || 'Student'}${ext}`;
    headers.set("Content-Disposition", `inline; filename="${downloadName}"`);

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error("Error downloading certificate:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
