import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(req: NextRequest, event: any) {
  if (req.nextUrl.pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }
  
  // Apply NextAuth middleware to all other /admin routes
  const authMiddleware = withAuth(
    function middleware(req) {
      return NextResponse.next();
    },
    {
      callbacks: {
        authorized: ({ token }) => !!token,
      },
      pages: {
        signIn: "/admin/login",
      },
    }
  );
  
  return (authMiddleware as any)(req, event);
}

export const config = {
  matcher: ["/admin/:path*"],
};
