import { NextResponse } from "next/server";
import { auth } from "./lib/auth";

export default auth((req) => {
  const session = req.auth;

  const { pathname } = req.nextUrl;
  if (!session?.user && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (
    session?.user &&
    pathname.startsWith("/admin") &&
    session?.user.role !== "Admin"
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (session?.user && session?.user.role === "Admin") {
    const clientPaths = ["/home", "/product", "/search"];
    const isClientPath = clientPaths.some((p) => pathname.startsWith(p));

    if (isClientPath) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }
  if (session?.user && session?.user.role === "Client") {
    const allowedForClient = ["/home", "/product", "/search"];
    const isAllowed = allowedForClient.some((p) => pathname.startsWith(p));

    if (!isAllowed && !pathname.startsWith("/")) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
  }
  if (session?.user && pathname === "/") {
    if (session?.user.role === "Admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    } else if (session?.user.role === "Client") {
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
    "/search/:path*",
  ],
};
