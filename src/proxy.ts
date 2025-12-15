import { NextResponse } from "next/server";
import { auth } from "./lib/auth";

export default auth((req) => {
  const session = req.auth;
  const { pathname } = req.nextUrl;

  /* ======================
     1. WAJIB LOGIN CLIENT (/orders)
  ====================== */
  if (pathname.startsWith("/orders") && (!session?.user || session.user.role !== "Client")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  /* ======================
     2. ADMIN AREA
  ====================== */
  if (pathname.startsWith("/admin")) {
    if (!session?.user || session.user.role !== "Admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  /* ======================
     3. ADMIN TIDAK BOLEH MASUK CLIENT PAGE
  ====================== */
  if (session?.user?.role === "Admin") {
    const clientPaths = ["/orders", "/home", "/product"];
    if (clientPaths.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }

  /* ======================
     4. CLIENT AREA
     client bebas akses home & product
     tidak boleh masuk admin
  ====================== */
  if (session?.user?.role === "Client") {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
  }

  /* ======================
     5. LOGIN PAGE REDIRECT
  ====================== */
  if (pathname === "/login" && session?.user) {
    if (session.user.role === "Admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    if (session.user.role === "Client") {
      return NextResponse.redirect(new URL("/home", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/login",
    "/admin/:path*",
    "/home/:path*",
    "/product/:path*",
    "/orders/:path*",
  ],
};
