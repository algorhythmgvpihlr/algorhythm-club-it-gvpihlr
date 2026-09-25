import { google } from "googleapis";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function run() {
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/google-drive/callback";
  const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  if (REFRESH_TOKEN) {
    oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  } else {
    console.log("NO REFRESH TOKEN FOUND IN ENV");
    return;
  }
  
  const driveClient = google.drive({ version: "v3", auth: oauth2Client });
  
  console.log("--- GOOGLE DRIVE ACCESS DIAGNOSTIC ---");
  
  try {
    const tokenResp = await oauth2Client.getAccessToken();
    const token = tokenResp.token;
    
    // Check scopes of the current token
    const tokenInfoRes = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`);
    const tokenInfo = await tokenInfoRes.json();
    console.log("TOKEN SCOPES:", tokenInfo.scope);
  } catch (err) {
    console.error("Failed to get token scopes:", err.message);
  }

  try {
    console.log("\nAttempting to access file: 1YBlnGBAYvxrCg9EMj7kY4AY57T3J4IOj");
    const metaRes = await driveClient.files.get({
      fileId: "1YBlnGBAYvxrCg9EMj7kY4AY57T3J4IOj",
      fields: "id,name,mimeType,size,owners,permissions,driveId,webViewLink,shortcutDetails",
      supportsAllDrives: true,
    });
    console.log("SUCCESS! Metadata:");
    console.log(JSON.stringify(metaRes.data, null, 2));
  } catch (err) {
    console.log("FAILED to access file.");
    console.log("Error status:", err.status || err.code);
    console.log("Error message:", err.message);
    if (err.errors) console.log("Error details:", JSON.stringify(err.errors, null, 2));
  }
}

run();
