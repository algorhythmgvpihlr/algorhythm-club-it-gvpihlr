"use server";

import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import AdmZip from "adm-zip";
import path from "path";
import { uploadFileToDrive, deleteFileFromDrive } from "@/lib/google-drive";

export async function getCertificateStats(eventId?: string) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  const where = eventId ? { eventId } : {};
  const total = await prisma.certificate.count({ where });
  
  const lastUploaded = await prisma.certificate.findFirst({
    where,
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  return {
    total,
    lastUploaded: lastUploaded?.createdAt || null,
  };
}

export async function getEventCertificates(eventId: string) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  return await prisma.certificate.findMany({
    where: { eventId },
    orderBy: { rollNumber: "asc" },
  });
}

export async function deleteCertificate(id: string) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  const cert = await prisma.certificate.findUnique({ where: { id } });
  if (!cert) throw new Error("Certificate not found");

  // Delete Google Drive file
  try {
    await deleteFileFromDrive(cert.storageKey);
  } catch (err) {
    console.error(`Failed to delete Google Drive file ${cert.storageKey}:`, err);
  }

  // Delete DB record
  await prisma.certificate.delete({ where: { id } });
  revalidatePath("/admin/certificates");
  return { success: true };
}

export async function replaceCertificate(id: string, formData: FormData) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No file provided");

  const cert = await prisma.certificate.findUnique({ where: { id } });
  if (!cert) throw new Error("Certificate not found");

  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are allowed");
  }

  // Delete old file from Google Drive
  try {
    await deleteFileFromDrive(cert.storageKey);
  } catch (err) {
    console.error(`Failed to delete old file ${cert.storageKey}:`, err);
  }

  // Save new file to Google Drive
  const buffer = Buffer.from(await file.arrayBuffer());
  const uniqueName = crypto.randomUUID() + ".pdf";
  
  const uploadResult = await uploadFileToDrive(
    buffer, 
    uniqueName, 
    "application/pdf", 
    `Certificates/${cert.eventId}`, 
    false // private
  );
  const storageKey = uploadResult.id;

  // Update DB
  await prisma.certificate.update({
    where: { id },
    data: {
      storageKey,
      fileSize: file.size,
      updatedAt: new Date(),
    },
  });

  revalidatePath("/admin/certificates");
  return { success: true };
}

export async function uploadCertificates(eventId: string, formData: FormData) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  const files = formData.getAll("files") as File[];
  if (!files || files.length === 0) throw new Error("No files provided");

  const manualRollNumber = formData.get("rollNumber") as string | null;
  const manualStudentName = formData.get("studentName") as string | null;

  const results = {
    total: 0,
    successful: 0,
    duplicates: 0,
    invalid: 0,
    failed: 0,
    messages: [] as string[],
  };

  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
  ];

  const processingQueue: Array<{
    buffer: Buffer;
    originalName: string;
    baseName: string;
    mimeType: string;
  }> = [];

  for (const file of files) {
    if (file.name.toLowerCase().endsWith(".zip") || file.type === "application/zip" || file.type === "application/x-zip-compressed") {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const zip = new AdmZip(buffer);
        const entries = zip.getEntries();
        
        for (const entry of entries) {
          if (entry.isDirectory) continue;
          
          const originalName = entry.entryName;
          const baseName = path.basename(originalName);
          
          if (baseName.startsWith("._") || baseName === ".DS_Store") continue;
          
          results.total++;
          
          if (!/\.(pdf|jpg|jpeg|png|webp)$/i.test(baseName)) {
            results.invalid++;
            results.messages.push(`${baseName}: Unsupported file type in ZIP.`);
            continue;
          }
          
          const entryBuffer = entry.getData();
          let mimeType = "application/octet-stream";
          const ext = path.extname(baseName).toLowerCase();
          if (ext === '.pdf') mimeType = 'application/pdf';
          else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
          else if (ext === '.png') mimeType = 'image/png';
          else if (ext === '.webp') mimeType = 'image/webp';
          
          processingQueue.push({
            buffer: entryBuffer,
            originalName,
            baseName,
            mimeType
          });
        }
      } catch (err) {
        results.failed++;
        results.messages.push(`${file.name}: Failed to read ZIP file.`);
      }
    } else {
      const originalName = file.name;
      const baseName = path.basename(originalName);

      if (baseName.startsWith("._") || baseName === ".DS_Store") continue;

      results.total++;

      if (!allowedTypes.includes(file.type) && !/\.(pdf|jpg|jpeg|png|webp)$/i.test(baseName)) {
        results.invalid++;
        results.messages.push(`${baseName}: Unsupported file type. Please upload PDF, JPG, JPEG, PNG, WEBP, or ZIP.`);
        continue;
      }

      let mimeType = file.type;
      if (!mimeType || mimeType === "application/octet-stream") {
        const ext = path.extname(baseName).toLowerCase();
        if (ext === '.pdf') mimeType = 'application/pdf';
        else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
        else if (ext === '.png') mimeType = 'image/png';
        else if (ext === '.webp') mimeType = 'image/webp';
      }

      processingQueue.push({
        buffer: Buffer.from(await file.arrayBuffer()),
        originalName,
        baseName,
        mimeType
      });
    }
  }

  for (const item of processingQueue) {
    const { buffer, originalName, baseName, mimeType } = item;

    let rollNumber = manualRollNumber?.trim() || null;
    let studentName = manualStudentName?.trim() || null;

    const nameWithoutExt = baseName.replace(/\.(pdf|jpg|jpeg|png|webp)$/i, "");
    
    const rollMatch = nameWithoutExt.match(/\b([0-9]{2}[A-Z0-9]{8})\b/i);
    if (!rollNumber && rollMatch) {
      rollNumber = rollMatch[1].toUpperCase();
    }
    
    if (!studentName) {
      let cleanName = nameWithoutExt.replace(/certificate_?/i, "");
      if (rollNumber) {
        cleanName = cleanName.replace(new RegExp(rollNumber, 'i'), "");
      }
      // Replace multiple spaces/underscores with single space, preserve existing spaces
      cleanName = cleanName.replace(/_+/g, " ").replace(/\s+/g, " ").trim();
      
      // Remove leading hyphens or special chars that might remain
      cleanName = cleanName.replace(/^[-_ ]+/, "");
      
      if (cleanName.length > 0 && !/^[\d]+$/.test(cleanName)) {
        studentName = cleanName;
      }
    }

    const existing = await prisma.certificate.findFirst({
      where: {
        eventId,
        fileName: baseName,
      },
    });

    if (existing) {
      results.duplicates++;
      results.messages.push(`${baseName}: Certificate with this name already exists`);
      continue;
    }

    if (buffer.length > 15 * 1024 * 1024) { // Increased to 15MB to be safe for big images
      results.failed++;
      results.messages.push(`${baseName}: File exceeds 15MB limit`);
      continue;
    }

    let storageKey: string | null = null;
    try {
      const uniqueName = crypto.randomUUID() + path.extname(baseName);
      
      const uploadResult = await uploadFileToDrive(
        buffer, 
        uniqueName, 
        mimeType, 
        `Certificates/${eventId}`, 
        false
      );
      storageKey = uploadResult.id;

      await prisma.certificate.create({
        data: {
          eventId,
          rollNumber: rollNumber || null,
          studentName: studentName || null,
          fileName: baseName,
          originalFileName: originalName,
          storageKey,
          mimeType,
          fileSize: buffer.length,
        },
      });

      results.successful++;
    } catch (err: any) {
      if (storageKey) {
        try {
          await deleteFileFromDrive(storageKey);
        } catch (cleanupError) {
          console.error("Failed to cleanup orphaned Drive file", cleanupError);
        }
      }
      
      results.failed++;
      results.messages.push(`${baseName}: Database or upload error`);
      
      console.error("CERTIFICATE DB ERROR", {
        file: baseName,
        rollNumber,
        studentName,
        error: err?.message || String(err),
        code: err?.code,
        meta: err?.meta
      });
    }
  }

  revalidatePath("/admin/certificates");
  return results;
}

export async function commitCertificate(data: {
  eventId: string,
  fileName: string,
  originalFileName: string,
  mimeType: string,
  fileSize: number,
  storageKey: string,
  manualRollNumber?: string | null,
  manualStudentName?: string | null
}) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  const { eventId, fileName, originalFileName, mimeType, fileSize, storageKey, manualRollNumber, manualStudentName } = data;
  const baseName = path.basename(fileName);

  let rollNumber = manualRollNumber?.trim() || null;
  let studentName = manualStudentName?.trim() || null;

  const nameWithoutExt = baseName.replace(/\.(pdf|jpg|jpeg|png|webp)$/i, "");
  
  const rollMatch = nameWithoutExt.match(/\b([0-9]{2}[A-Z0-9]{8})\b/i);
  if (!rollNumber && rollMatch) {
    rollNumber = rollMatch[1].toUpperCase();
  }
  
  if (!studentName) {
    let cleanName = nameWithoutExt.replace(/certificate_?/i, "");
    if (rollNumber) {
      cleanName = cleanName.replace(new RegExp(rollNumber, 'i'), "");
    }
    cleanName = cleanName.replace(/_+/g, " ").replace(/\s+/g, " ").trim();
    cleanName = cleanName.replace(/^[-_ ]+/, "");
    
    if (cleanName.length > 0 && !/^[\d]+$/.test(cleanName)) {
      studentName = cleanName;
    }
  }

  const existing = await prisma.certificate.findFirst({
    where: {
      eventId,
      fileName: baseName,
    },
  });

  if (existing) {
    try {
      await deleteFileFromDrive(storageKey);
    } catch (err) {
      console.error("Failed to delete orphaned Drive file on duplicate:", err);
    }
    return { success: false, duplicate: true, message: `${baseName}: Certificate with this name already exists` };
  }

  try {
    const cert = await prisma.certificate.create({
      data: {
        eventId,
        rollNumber: rollNumber || null,
        studentName: studentName || null,
        fileName: baseName,
        originalFileName: originalFileName,
        storageKey,
        mimeType,
        fileSize,
      },
    });

    revalidatePath("/admin/certificates");
    return { success: true, duplicate: false, id: cert.id };
  } catch (err: any) {
    try {
      await deleteFileFromDrive(storageKey);
    } catch (cleanupError) {
      console.error("Failed to cleanup orphaned Drive file", cleanupError);
    }
    
    console.error("CERTIFICATE DB ERROR (commit)", {
      file: baseName,
      error: err?.message || String(err)
    });
    return { success: false, duplicate: false, message: "Database creation failed" };
  }
}

export async function verifyCertificate(eventId: string, query: string) {
  const normQuery = query.trim();
  if (!normQuery) return [];

  const certs = await prisma.certificate.findMany({
    where: {
      eventId,
      OR: [
        { rollNumber: { equals: normQuery, mode: "insensitive" } },
        { studentName: { contains: normQuery, mode: "insensitive" } },
      ],
    },
    include: {
      event: { select: { title: true } },
    },
    orderBy: {
      studentName: "asc",
    },
  });

  console.log(
    "[Certificate Search]",
    normQuery,
    "matches:",
    certs.length,
    certs.map((c) => c.studentName)
  );

  return certs.map((cert) => ({
    id: cert.id,
    rollNumber: cert.rollNumber,
    studentName: cert.studentName,
    eventTitle: cert.event.title,
    createdAt: cert.createdAt,
  }));
}
