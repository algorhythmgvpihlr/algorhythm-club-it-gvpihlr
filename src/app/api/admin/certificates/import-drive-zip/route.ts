import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { uploadFileToDrive } from "@/lib/google-drive";
import { prisma } from "@/lib/prisma";
import { google } from "googleapis";
import AdmZip from "adm-zip";
import crypto from "crypto";
import path from "path";
import { Readable } from "stream";

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { eventId, driveFileId, resourceKey, accessToken, manualRollNumber, manualStudentName } = await req.json();
  if (!eventId || !driveFileId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let finalFileId = driveFileId;
  let finalResourceKey = resourceKey;

  // Create temporary client using the Picker's token
  const oauth2Client = new google.auth.OAuth2();
  if (accessToken) {
    oauth2Client.setCredentials({ access_token: accessToken });
  }
  const pickerDriveClient = google.drive({ version: "v3", auth: oauth2Client });

  try {
    console.log("[Drive Import] Selected file ID:", finalFileId);

    // Try fetching file metadata using picker client
    const metaParams: any = {
      fileId: finalFileId,
      fields: "id,name,mimeType,size,parents,owners(emailAddress),webViewLink,shortcutDetails",
      supportsAllDrives: true,
    };

    const metaOptions: any = {};
    if (finalResourceKey) {
      metaOptions.headers = {
        'X-Goog-Drive-Resource-Keys': `${finalFileId}/${finalResourceKey}`
      };
    }

    let metaRes = await pickerDriveClient.files.get(metaParams, metaOptions);
    let fileMeta: any = metaRes.data;

    // Resolve shortcut if needed
    if (fileMeta.mimeType === "application/vnd.google-apps.shortcut" && fileMeta.shortcutDetails?.targetId) {
      console.log("File is a shortcut. Resolving target ID:", fileMeta.shortcutDetails.targetId);
      finalFileId = fileMeta.shortcutDetails.targetId;
      finalResourceKey = fileMeta.shortcutDetails.targetResourceKey || undefined;
      
      const targetParams: any = {
        fileId: finalFileId,
        fields: "id,name,mimeType,size,parents,owners(emailAddress),webViewLink",
        supportsAllDrives: true,
      };
      
      const targetOptions: any = {};
      if (finalResourceKey) {
        targetOptions.headers = {
          'X-Goog-Drive-Resource-Keys': `${finalFileId}/${finalResourceKey}`
        };
      }
      
      metaRes = await pickerDriveClient.files.get(targetParams, targetOptions);
      fileMeta = metaRes.data;
    }
    
    console.log("[Drive Import] Selected file name:", fileMeta.name);
    console.log("[Drive Import] Selected MIME type:", fileMeta.mimeType);

    const isZip = 
      fileMeta.mimeType === "application/zip" || 
      fileMeta.mimeType === "application/x-zip-compressed" || 
      fileMeta.name?.toLowerCase().endsWith(".zip");
      
    if (!isZip) {
      return NextResponse.json({ error: "Please select a ZIP file." }, { status: 400 });
    }
  } catch (err: any) {
    console.log("[Drive Import] ACCESS: NO");
    console.log("[Drive Import] API Error:", err.message);

    const is404 = err.code === 404 || err.status === 404 || err.message.includes("File not found") || err.message.includes("404");
    
    if (is404) {
      return NextResponse.json(
        { 
          error: `Diagnostic Report:\nFile access: NOT ACCESSIBLE\n\nError: ${err.message}\n\nUnable to access this Google Drive ZIP. Please make sure you selected the ZIP from the Google Drive account connected to AlgoRhythm.`,
          diagnostic: true
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ error: `Failed to access Google Drive file: ${err.message}` }, { status: 500 });
  }

  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = (data: any) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
      };

      try {
        console.log("[Drive Import] Downloading selected file using Picker authorization...");
        
        const params: any = { 
          fileId: finalFileId, 
          alt: "media",
          supportsAllDrives: true 
        };
        const options: any = { responseType: "stream" };
        if (finalResourceKey) {
          options.headers = {
            'X-Goog-Drive-Resource-Keys': `${finalFileId}/${finalResourceKey}`
          };
        }
        
        const downloadRes = await pickerDriveClient.files.get(params, options);
        const fileStream = downloadRes.data as Readable;
        
        console.log("[Drive Import] Download stream initialized successfully.");
        
        const MAX_SIZE = 100 * 1024 * 1024; // 100 MB
        const chunks: Buffer[] = [];
        let size = 0;
        
        for await (const chunk of fileStream) {
          size += chunk.length;
          if (size > MAX_SIZE) {
            sendUpdate({ error: "ZIP file is too large. Max size is 100MB." });
            controller.close();
            return;
          }
          chunks.push(Buffer.from(chunk));
        }
        const zipBuffer = Buffer.concat(chunks);
        
        const zip = new AdmZip(zipBuffer);
        const entries = zip.getEntries();
        
        const validEntries = entries.filter(e => {
          if (e.isDirectory) return false;
          const baseName = path.basename(e.entryName);
          if (baseName.startsWith("._") || baseName === ".DS_Store") return false;
          return /\.(pdf|jpg|jpeg|png|webp)$/i.test(baseName);
        });

        const total = validEntries.length;
        sendUpdate({ type: "start", total });

        let successful = 0;
        let duplicates = 0;
        let failed = 0;
        let processed = 0;

        for (const entry of validEntries) {
          processed++;
          const originalName = entry.entryName;
          const baseName = path.basename(originalName);

          let rollNumber = manualRollNumber?.trim() || null;
          let studentName = manualStudentName?.trim() || null;

          const nameWithoutExt = baseName.replace(/\.(pdf|jpg|jpeg|png|webp)$/i, "");
          const rollMatch = nameWithoutExt.match(/\b([0-9]{2}[A-Z0-9]{8})\b/i);
          if (!rollNumber && rollMatch) rollNumber = rollMatch[1].toUpperCase();
          
          if (!studentName) {
            let cleanName = nameWithoutExt.replace(/certificate_?/i, "");
            if (rollNumber) cleanName = cleanName.replace(new RegExp(rollNumber, 'i'), "");
            cleanName = cleanName.replace(/_+/g, " ").replace(/\s+/g, " ").trim();
            cleanName = cleanName.replace(/^[-_ ]+/, "");
            if (cleanName.length > 0 && !/^[\d]+$/.test(cleanName)) studentName = cleanName;
          }

          const existing = await prisma.certificate.findFirst({
            where: { eventId, fileName: baseName },
          });

          if (existing) {
            duplicates++;
            sendUpdate({ type: "progress", processed, successful, duplicates, failed });
            continue;
          }

          const fileBuffer = entry.getData();
          
          let mimeType = "application/octet-stream";
          const ext = path.extname(baseName).toLowerCase();
          if (ext === '.pdf') mimeType = 'application/pdf';
          else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
          else if (ext === '.png') mimeType = 'image/png';
          else if (ext === '.webp') mimeType = 'image/webp';

          const uniqueName = crypto.randomUUID() + ext;
          let storageKey: string | null = null;
          
          try {
            const uploadResult = await uploadFileToDrive(fileBuffer, uniqueName, mimeType, `Certificates/${eventId}`, false);
            storageKey = uploadResult.id;

            await prisma.certificate.create({
              data: {
                eventId,
                rollNumber,
                studentName,
                fileName: baseName,
                originalFileName: originalName,
                storageKey,
                mimeType,
                fileSize: fileBuffer.length,
              }
            });
            successful++;
          } catch (err: any) {
            if (storageKey) {
              try {
                const { deleteFileFromDrive } = await import("@/lib/google-drive");
                await deleteFileFromDrive(storageKey);
              } catch (e) {}
            }
            failed++;
          }

          sendUpdate({ type: "progress", processed, successful, duplicates, failed });
        }
        
        sendUpdate({ type: "complete", total, processed, successful, duplicates, failed });
      } catch (error: any) {
        console.error("ZIP import stream error:", error);
        sendUpdate({ error: error.message || "Failed to process ZIP" });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
}
