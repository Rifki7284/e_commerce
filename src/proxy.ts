import { NextResponse } from "next/server";
import { auth } from "./lib/auth";

export default auth((req) => {
  const session = req.auth;
  const { pathname } = req.nextUrl;

  /* ======================
     1. WAJIB LOGIN
  ====================== */
  const protectedPaths = ["/orders", "/home", "/product"];

  if (
    protectedPaths.some((p) => pathname.startsWith(p)) &&
    !session?.user
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  /* ======================
     2. ADMIN AREA
  ====================== */
  if (pathname.startsWith("/admin")) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (session.user.role !== "Admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  /* ======================
     3. ADMIN DILARANG MASUK CLIENT PAGE
  ====================== */
  if (session?.user?.role === "Admin") {
    const clientPaths = ["/orders"];

    if (clientPaths.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(
        new URL("/admin/dashboard", req.url)
      );
    }
  }

  /* ======================
     4. CLIENT AREA
  ====================== */
  if (session?.user?.role === "Client") {
    const allowedForClient = ["/orders", "/home", "/product"];

    if (!allowedForClient.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
  }

  /* ======================
     5. ROOT REDIRECT
  ====================== */
  if (pathname === "/" && session?.user) {
    if (session.user.role === "Admin") {
      return NextResponse.redirect(
        new URL("/admin/dashboard", req.url)
      );
    }

    if (session.user.role === "Client") {
      return NextResponse.redirect(new URL("/home", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/home/:path*",
    "/product/:path*",
    "/orders/:path*",
  ],
};
