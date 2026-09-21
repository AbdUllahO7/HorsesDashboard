import { NextResponse, type NextRequest } from "next/server";
import { apiConfig } from "@/config/api.config";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get(apiConfig.cookieNames.auth)?.value;

  // Public routes that don't require authentication
  const isAuthPage = pathname.startsWith("/login");
  const isApiRoute = pathname.startsWith("/api");
  const isStaticFile =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/icons") ||
    pathname.includes("favicon.ico");

  if (isStaticFile || isApiRoute) {
    return NextResponse.next();
  }

  // Redirect unauthenticated admin to /login
  if (!authToken && !isAuthPage) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated admin from /login to dashboard root /
  if (authToken && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
