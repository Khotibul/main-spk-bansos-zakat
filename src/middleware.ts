import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedRoutes = [
  "/",
  "/warga",
  "/dosen-laporan",
  "/keseluruhan-laporan",
  "/penilaian",
  "/umrs",
  "/ahpWeights",
  "/pengabdian-masyarakat-luaran",
];

const publicRoutes = ["/signin", "/signup"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Ambil cookie user
  const raw = request.cookies.get("user")?.value;

  // Parse cookie aman
  let user: any = null;
  if (raw && raw !== "undefined" && raw.trim() !== "") {
    try {
      user = JSON.parse(raw);
    } catch (err) {
      console.warn("Invalid user cookie:", err);
      user = null;
    }
  }

  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  // Jika belum login tetapi mengakses halaman protected → redirect
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // Jika sudah login, jangan kembali ke login/signup
  if (isPublicRoute && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/signin",
    "/signup",
    "/warga",
    "/umrs",
    "/validasi-laporan",
    "/Penilaian",
    "/warga-validasi",
    "/verifikasi-laporan",
  ],
};
