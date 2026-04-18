import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Define protected routes
  const isProtectedRoute = pathname.startsWith("/dashboard") || 
                           pathname.startsWith("/students") || 
                           pathname.startsWith("/finance");

  if (isProtectedRoute) {
    // Check for Better Auth session cookie
    // Note: The actual cookie name might vary based on your Better Auth config (default: better-auth.session-token)
    const sessionToken = request.cookies.get("better-auth.session-token");

    if (!sessionToken) {
      const url = new URL("/signin", request.url);
      url.searchParams.set("callbackUrl", encodeURI(pathname));
      return NextResponse.redirect(url);
    }
  }

  // Redirect logged-in users away from auth pages
  const isAuthPage = pathname.startsWith("/signin") || pathname.startsWith("/signup");
  if (isAuthPage) {
    const sessionToken = request.cookies.get("better-auth.session-token");
    if (sessionToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/students/:path*",
    "/finance/:path*",
    "/signin",
    "/signup",
  ],
};
