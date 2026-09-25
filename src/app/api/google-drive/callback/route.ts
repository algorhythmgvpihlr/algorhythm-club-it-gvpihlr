import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTokens } from "@/lib/google-drive";
import fs from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return new NextResponse("Unauthorized. Super Admin access required.", { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state");

    const cookieState = req.cookies.get("gdrive_oauth_state")?.value;

    if (error) {
      return new NextResponse("OAuth error: " + error, { status: 400 });
    }

    if (!code) {
      return new NextResponse("Authorization code missing", { status: 400 });
    }

    if (!state || !cookieState || state !== cookieState) {
      return new NextResponse("CSRF Validation Failed", { status: 403 });
    }

    const tokens = await getTokens(code);

    if (!tokens.refresh_token) {
      return new NextResponse(`
        <html>
          <head><title>OAuth Error</title></head>
          <body style="font-family: sans-serif; padding: 2rem; max-width: 800px; margin: auto;">
            <h1>Missing Refresh Token</h1>
            <p>Google did not return a refresh token. This usually happens if you have previously authorized this app.</p>
            <p>To fix this:</p>
            <ol>
              <li>Go to <a href="https://myaccount.google.com/permissions" target="_blank">Google Account Permissions</a>.</li>
              <li>Find "AlgoRhythm Website" (or your app name) and click <strong>Remove Access</strong>.</li>
              <li>Come back here and try again.</li>
            </ol>
            <a href="/api/google-drive/auth">Try Again</a>
          </body>
        </html>
      `, {
        status: 400,
        headers: { "Content-Type": "text/html" }
      });
    }

    // Securely write to a local ignored file rather than displaying in browser or logging
    const tokenPath = path.join(process.cwd(), ".env.gdrive");
    await fs.writeFile(tokenPath, `GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"\n`, { mode: 0o600 });

    const response = new NextResponse(`
      <html>
        <head><title>Google Drive OAuth Success</title></head>
        <body style="font-family: sans-serif; padding: 2rem; max-width: 800px; margin: auto;">
          <h1>OAuth Successful</h1>
          <p>The authentication was successful.</p>
          <p>Your refresh token has been securely saved to <code>.env.gdrive</code> in the root of the project.</p>
          <p>Please securely copy it to your actual <code>.env</code> file, then delete <code>.env.gdrive</code>.</p>
          <br/>
          <a href="/admin">Return to Admin Panel</a>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html" }
    });

    // Clear the state cookie
    response.cookies.delete("gdrive_oauth_state");
    return response;

  } catch (error: unknown) {
    // Avoid logging sensitive information
    console.error("Google Drive OAuth Callback Error occurred.");
    return new NextResponse("Failed to exchange tokens: " + (error instanceof Error ? error.message : "Unknown error"), { status: 500 });
  }
}
