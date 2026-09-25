import { google } from "googleapis";
import { Readable } from "stream";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/google-drive/callback";
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

// Initialize OAuth2 Client
const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

if (REFRESH_TOKEN) {
  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
}

export const driveClient = google.drive({ version: "v3", auth: oauth2Client });

export function getAuthUrl(state: string) {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive"],
    prompt: "consent",
    include_granted_scopes: true,
    state,
  });
}

export async function getTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

const ROOT_FOLDER_NAME = "AlgoRhythm Website";

// Helper to get or create a folder
export async function ensureFolder(name: string, parentId?: string): Promise<string> {
  const query = parentId
    ? `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
    : `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

  const res = await driveClient.files.list({
    q: query,
    fields: "files(id, name)",
    spaces: "drive",
  });

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id!;
  }

  const folderMetadata: Record<string, unknown> = {
    name: name,
    mimeType: "application/vnd.google-apps.folder",
  };
  if (parentId) {
    folderMetadata.parents = [parentId];
  }

  const file = await driveClient.files.create({
    requestBody: folderMetadata,
    fields: "id",
  });

  return file.data.id!;
}

// Caching folder IDs
const initializedFolderIds: Record<string, string> = {};

export async function getTargetFolderId(subFolderName: string): Promise<string> {
  // Clear cache if we have a new folder context, or just keep it simple in memory
  if (initializedFolderIds[subFolderName]) return initializedFolderIds[subFolderName];

  const rootId = await ensureFolder(ROOT_FOLDER_NAME);
  initializedFolderIds[ROOT_FOLDER_NAME] = rootId;

  // Support nested folders like Events/eventId
  const parts = subFolderName.split("/");
  let currentParentId = rootId;
  
  for (const part of parts) {
    if (!part) continue;
    const cacheKey = currentParentId + "_" + part;
    if (initializedFolderIds[cacheKey]) {
      currentParentId = initializedFolderIds[cacheKey];
    } else {
      currentParentId = await ensureFolder(part, currentParentId);
      initializedFolderIds[cacheKey] = currentParentId;
    }
  }

  initializedFolderIds[subFolderName] = currentParentId;
  return currentParentId;
}

export async function uploadFileToDrive(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  folderName: string,
  makePublic: boolean = false
): Promise<{ id: string; publicUrl?: string }> {
  if (!REFRESH_TOKEN) {
    throw new Error("GOOGLE_REFRESH_TOKEN is missing. Please configure Google Drive integration.");
  }
  
  const folderId = await getTargetFolderId(folderName);

  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  const fileMetadata = {
    name: filename,
    parents: [folderId],
  };

  const media = {
    mimeType: mimeType,
    body: stream,
  };

  const file = await driveClient.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: "id",
  });

  const fileId = file.data.id!;

  if (makePublic) {
    await driveClient.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
    return {
      id: fileId,
      publicUrl: `https://drive.google.com/uc?export=view&id=${fileId}`,
    };
  }

  return { id: fileId };
}

export async function getDriveAccessToken() {
  const tokenResp = await oauth2Client.getAccessToken();
  return tokenResp.token;
}

export async function createResumableUploadSession(
  filename: string,
  mimeType: string,
  folderName: string
) {
  if (!REFRESH_TOKEN) {
    throw new Error("GOOGLE_REFRESH_TOKEN is missing.");
  }
  
  const folderId = await getTargetFolderId(folderName);

  const tokenResp = await oauth2Client.getAccessToken();
  const token = tokenResp.token;
  if (!token) {
    throw new Error("Failed to retrieve access token from Google.");
  }

  const fileMetadata = {
    name: filename,
    parents: [folderId],
  };

  const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Upload-Content-Type": mimeType
    },
    body: JSON.stringify(fileMetadata)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to create Google Drive resumable session: ${errText}`);
  }

  const uploadUrl = response.headers.get("Location");
  if (!uploadUrl) {
    throw new Error("Missing Location header in resumable session response");
  }

  return uploadUrl;
}

export async function deleteFileFromDrive(fileId: string) {
  if (!REFRESH_TOKEN) return;
  try {
    await driveClient.files.delete({ fileId });
  } catch (err: unknown) {
    console.error(`Failed to delete Google Drive file ${fileId}:`, err instanceof Error ? err.message : err);
  }
}

export function extractDriveId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const match = urlOrId.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return match[1];
  }
  if (!urlOrId.includes("http") && !urlOrId.includes("/")) {
    return urlOrId;
  }
  return null;
}

export async function deleteByUrlOrId(urlOrId: string | null | undefined) {
  if (!urlOrId) return;
  const id = extractDriveId(urlOrId);
  if (id) {
    await deleteFileFromDrive(id);
  }
}

export async function downloadFileFromDrive(fileId: string, resourceKey?: string): Promise<Readable> {
  if (!REFRESH_TOKEN) {
    throw new Error("GOOGLE_REFRESH_TOKEN is missing.");
  }

  const params: any = { 
    fileId, 
    alt: "media",
    supportsAllDrives: true 
  };
  
  const options: any = { responseType: "stream" };
  
  if (resourceKey) {
    options.headers = {
      'X-Goog-Drive-Resource-Keys': `${fileId}/${resourceKey}`
    };
  }

  const res = await driveClient.files.get(params, options);

  return res.data as Readable;
}

