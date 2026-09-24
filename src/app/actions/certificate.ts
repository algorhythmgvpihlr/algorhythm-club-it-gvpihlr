"use server";

import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import AdmZip from "adm-zip";

// Define the secure storage path outside the public directory
const STORAGE_DIR = path.join(process.cwd(), "storage", "certificates");

// Helper to ensure the storage directory exists
async function ensureStorageDir() {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  } catch (err) {
    console.error("Failed to create storage directory:", err);
  }
}

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

  // Delete physical file
  const filePath = path.join(STORAGE_DIR, cert.storageKey);
  try {
    await fs.unlink(filePath);
  } catch (err) {
    console.error(`Failed to delete file ${filePath}:`, err);
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

  await ensureStorageDir();

  // Delete old file
  const oldPath = path.join(STORAGE_DIR, cert.storageKey);
  try {
    await fs.unlink(oldPath);
  } catch (err) {
    console.error(`Failed to delete old file ${oldPath}:`, err);
  }

  // Save new file
  const buffer = Buffer.from(await file.arrayBuffer());
  const storageKey = crypto.randomUUID() + ".pdf";
  const newPath = path.join(STORAGE_DIR, storageKey);
  await fs.writeFile(newPath, buffer);

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

export async function uploadCertificatesZip(eventId: string, formData: FormData) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No file provided");

  // Basic limits
  if (file.size > 50 * 1024 * 1024) {
    throw new Error("ZIP file exceeds 50MB limit");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  
  let zip;
  try {
    zip = new AdmZip(buffer);
  } catch (err) {
    throw new Error("Invalid ZIP file format");
  }

  const entries = zip.getEntries();
  if (entries.length > 500) {
    throw new Error("ZIP contains more than 500 files. Please batch uploads.");
  }

  await ensureStorageDir();

  const results = {
    total: entries.length,
    successful: 0,
    duplicates: 0,
    invalid: 0,
    failed: 0,
    messages: [] as string[],
  };

  for (const entry of entries) {
    if (entry.isDirectory) continue;

    const originalName = entry.entryName;
    const baseName = path.basename(originalName);

    // Skip MacOS hidden files
    if (baseName.startsWith("._") || baseName === ".DS_Store") continue;

    // Must be PDF
    if (!baseName.toLowerCase().endsWith(".pdf")) {
      results.invalid++;
      results.messages.push(`${baseName}: Invalid file type (must be .pdf)`);
      continue;
    }

    const rollNumber = baseName.replace(/\.pdf$/i, "").trim().toUpperCase();
    if (!rollNumber) {
      results.invalid++;
      results.messages.push(`${baseName}: Invalid roll number`);
      continue;
    }

    // Check duplicate
    const existing = await prisma.certificate.findUnique({
      where: {
        eventId_rollNumber: { eventId, rollNumber },
      },
    });

    if (existing) {
      results.duplicates++;
      results.messages.push(`${baseName}: Certificate for ${rollNumber} already exists`);
      continue;
    }

    // Process and save
    try {
      const data = entry.getData();
      if (data.length > 10 * 1024 * 1024) {
        results.failed++;
        results.messages.push(`${baseName}: File exceeds 10MB limit`);
        continue;
      }

      const storageKey = crypto.randomUUID() + ".pdf";
      const filePath = path.join(STORAGE_DIR, storageKey);
      
      // Save physical file
      await fs.writeFile(filePath, data);

      // Save to DB
      await prisma.certificate.create({
        data: {
          eventId,
          rollNumber,
          fileName: baseName,
          originalFileName: originalName,
          storageKey,
          mimeType: "application/pdf",
          fileSize: data.length,
        },
      });

      results.successful++;
    } catch (err) {
      results.failed++;
      results.messages.push(`${baseName}: Error saving file`);
      console.error(err);
    }
  }

  revalidatePath("/admin/certificates");
  return results;
}

export async function verifyCertificate(eventId: string, rollNumber: string) {
  const normRoll = rollNumber.trim().toUpperCase();
  if (!normRoll) return null;

  const cert = await prisma.certificate.findUnique({
    where: {
      eventId_rollNumber: { eventId, rollNumber: normRoll },
    },
    include: {
      event: { select: { title: true } },
    },
  });

  if (!cert) return null;

  // We do NOT return the storageKey or full path to the client.
  return {
    id: cert.id, // Only use the unique ID for safe retrieval
    rollNumber: cert.rollNumber,
    eventTitle: cert.event.title,
    createdAt: cert.createdAt,
  };
}
