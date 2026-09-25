import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { getDriveAccessToken } from "@/lib/google-drive";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = await getDriveAccessToken();
    return NextResponse.json({ token });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get token" }, { status: 500 });
  }
}
