import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAuthUrl } from "@/lib/google-drive";
import crypto from "crypto";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // Explicitly restrict to SUPER_ADMIN for security
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin access required." }, { status: 401 });
    }

    const state = crypto.randomBytes(32).toString("hex");
    const authUrl = getAuthUrl(state);
    
    const response = NextResponse.redirect(authUrl);
    
    // Set secure HttpOnly cookie for state validation in callback
    response.cookies.set("gdrive_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60, // 10 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error generating Google Auth URL:", error);
    return NextResponse.json({ error: "Failed to generate Auth URL" }, { status: 500 });
  }
}
