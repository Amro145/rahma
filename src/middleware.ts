import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { UserWithRole } from "@/lib/auth.client";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public pages, auth pages and static assets through
  if (
    pathname === "/" ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Detect the correct session cookie name (differs in HTTP vs HTTPS environments)
  const tokenName = request.cookies.has("__secure-better-auth.session_token")
    ? "__secure-better-auth.session_token"
    : "better-auth.session_token";

  const sessionCookie = request.cookies.get(tokenName)?.value;

  // No session cookie → redirect to sign in
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "https://backend.amroaltayeb14.workers.dev"}/api/auth/get-session`,
      {
        headers: {
          cookie: `${tokenName}=${sessionCookie}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }

    const session = (await response.json()) as { user: UserWithRole } | null;
    const role = session?.user?.role;

    if (!role) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }

    // Admins trying to access the student profile → redirect to admin dashboard
    if (pathname.startsWith("/profile") && role === "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Students trying to access admin-only pages → redirect to their profile
    const isAdminRoute =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/students") ||
      pathname.startsWith("/finance") ||
      pathname.startsWith("/help");

    if (isAdminRoute && role !== "admin") {
      return NextResponse.redirect(new URL("/profile", request.url));
    }
  } catch (err) {
    console.error("Middleware auth check failed:", err);
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on all app routes except API and static Cloudflare worker internals
  matcher: [
    "/dashboard/:path*",
    "/students/:path*",
    "/finance/:path*",
    "/help/:path*",
    "/profile/:path*",
  ],
};
