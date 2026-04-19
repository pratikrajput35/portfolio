import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Auth protection is handled client-side in admin/layout.tsx
// because the auth cookie is set by a cross-domain Express backend
// and cannot be read by Next.js middleware on a different domain.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};