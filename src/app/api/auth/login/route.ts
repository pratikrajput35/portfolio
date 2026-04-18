import { NextRequest, NextResponse } from 'next/server';
import { signToken, COOKIE_NAME } from '@/lib/auth';
import crypto from 'crypto';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@pratikrajput.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  // Compare credentials — use timing-safe comparison when available
  const emailMatch = email === ADMIN_EMAIL;
  const passMatch = password === ADMIN_PASSWORD;

  if (!emailMatch || !passMatch) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = await signToken({ email: ADMIN_EMAIL, role: 'admin' });

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return response;
}
