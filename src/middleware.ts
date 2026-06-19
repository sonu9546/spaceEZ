import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTES } from "./routerKeys";

export function middleware(req: NextRequest) {
  const isAuth = req.cookies.get("auth")?.value || null;
  const pathname = req.nextUrl.pathname;

  // Guest-only routes
  const AUTH_PAGES: string[] = [
    ROUTES.WELCOME.WELCOME,
    ROUTES.AUTH.LOGIN,
    ROUTES.AUTH.REGISTER,
    ROUTES.AUTH.VERIFY_OTP,
  ];

  // Protected routes
  const PROTECTED_ROUTES: string[] = [
    ROUTES.PRIVATE.HOME,
    ROUTES.PRIVATE.PROFILE,
    ROUTES.PRIVATE.SETTING,
    ROUTES.PRIVATE.DASHBOARD,
    ROUTES.PRIVATE.PARKS,
    ROUTES.PRIVATE.ADD_PARK,
  ];

  // Logged-in user visiting auth pages → redirect home
  if (isAuth && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL(ROUTES.PRIVATE.HOME, req.url));
  }

  // Guest visiting protected pages or welcome page -> redirect login
  if (!isAuth && (PROTECTED_ROUTES.includes(pathname) || pathname === ROUTES.WELCOME.WELCOME)) {
    return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, req.url));
  }

  // COMMON routes are untouched → accessible to everyone
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Welcome page
    '/',

    // Auth pages
    '/login',
    '/register',
    '/otp-verify',

    // Common pages
    '/terms',
    '/privacy',
    '/delete-account',

    // Private pages
    '/home',
    '/profile',
    '/setting',
    '/dashboard',
    '/parks',
    '/parks/:path*',
  ],
};

