import prisma from "@/lib/prisma";
import type { Users } from "@prisma/client";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function signup(data: Users) {
  const { password, ...kept } = data;
  const salt = await bcrypt.genSalt(10);
  const saltedPassword = await bcrypt.hash(password, salt);
  return prisma.users.create({
    data: { password: saltedPassword, ...kept },
    select: { id: true, email: true, username: true, role: true },
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Users;
  const result = await signup(body);

  if (typeof result === "string") {
    return NextResponse.json({ message: result }, { status: 400 });
  }

  const cookieStore = await cookies();

  cookieStore.set("user", JSON.stringify(result), {
    path: "/",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",     // 🔥 wajib untuk Next.js App Router
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json(result);
}
