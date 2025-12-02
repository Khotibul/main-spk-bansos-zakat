import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import type { Credentials } from './type';

const ERR_MSG = 'Email atau Password tidak sesuai';

export async function signin({ email, password }: Credentials) {
  try {
    const users = await prisma.users.findFirst({ where: { email } });
    if (!users) throw ERR_MSG;

    const { password: storedPassword, ...kept } = users;

    const passwordMatch = await bcrypt.compare(password, storedPassword);
    if (!passwordMatch) throw ERR_MSG;

    return kept;
  } catch (error) {
    return error;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json() as Credentials;
  const result = await signin(body);

  if (typeof result === 'string') {
    return NextResponse.json({ message: result }, { status: 401 });
  }

  const cookieStore = await cookies();

  cookieStore.set('user', JSON.stringify(result), {
    path: '/',
    httpOnly: false, // jika mau dibaca React
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });

  console.log("SET COOKIE USER:", JSON.stringify(result));

  return NextResponse.json(result);
}
