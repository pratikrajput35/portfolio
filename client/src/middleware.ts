// Middleware temporarily disabled for testing
// import { NextRequest, NextResponse } from 'next/server';
// import { verifyToken, COOKIE_NAME } from '@/lib/auth';

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   // Protect all /admin routes except login
//   if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
//     const token = request.cookies.get(COOKIE_NAME)?.value;

//     if (!token) {
//       return NextResponse.redirect(new URL('/admin/login', request.url));
//     }

//     const payload = await verifyToken(token);
//     if (!payload) {
//       return NextResponse.redirect(new URL('/admin/login', request.url));
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ['/admin/:path*'],
// };
