import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadFileToDrive } from "@/lib/google-drive";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["SUPER_ADMIN", "CONTENT_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;
    const folder: string = (data.get("folder") as string) || "misc";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize file name
    const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFilename = `${Date.now()}-${filename}`;

    // Map internal folder to Google Drive folder structure
    const folderMapping: Record<string, string> = {
      team: "Team",
      events: "Events",
      magazines: "Magazines",
      misc: "Branding"
    };
    
    const driveFolder = folderMapping[folder] || "Branding";

    try {
      const { publicUrl, id } = await uploadFileToDrive(
        buffer, 
        uniqueFilename, 
        file.type || "application/octet-stream", 
        driveFolder, 
        true // make public
      );
      
      if (!publicUrl) throw new Error("Missing public URL from Drive API");

      return NextResponse.json({ 
        success: true, 
        url: publicUrl,
        id: id
      });
    } catch (uploadError: unknown) {
      console.error("Google Drive upload failed:", uploadError);
      return NextResponse.json({ error: "Upload failed: " + (uploadError instanceof Error ? uploadError.message : "Unknown error") }, { status: 500 });
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
