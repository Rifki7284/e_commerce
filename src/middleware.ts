import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  // Jika belum login dan mencoba ke halaman admin
  if (!token && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Jika login tapi bukan admin, cegah akses ke /admin
  if (token && pathname.startsWith("/admin") && token.role !== "Admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Jika admin mencoba akses halaman client, redirect ke /admin
  if (token && token.role === "Admin") {
    const clientPaths = ["/home", "/product", "/search"];
    const isClientPath = clientPaths.some((p) => pathname.startsWith(p));

    if (isClientPath) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  // Jika user role Client dan mencoba akses selain halaman tertentu
  if (token && token.role === "Client") {
    const allowedForClient = ["/home", "/product", "/search"];
    const isAllowed = allowedForClient.some((p) => pathname.startsWith(p));

    if (!isAllowed && !pathname.startsWith("/api")) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
  }

  // Jika sudah login dan masih buka halaman login ("/")
  if (token && pathname === "/") {
    if (token.role === "Admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    } else if (token.role === "Client") {
      return NextResponse.redirect(new URL("/home", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",             // halaman utama (login)
    "/admin/:path*", // semua halaman admin
    "/home/:path*",  // halaman client
    "/product/:path*",
    "/search/:path*",
  ],
};
