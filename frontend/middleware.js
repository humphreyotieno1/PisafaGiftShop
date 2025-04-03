import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

// Paths that require authentication
const protectedPaths = [
  '/admin',
  '/api/admin',
];

// Paths that are only accessible to admins
const adminOnlyPaths = [
  '/admin',
  '/api/admin',
];

// Paths that don't require authentication
const publicPaths = [
  '/',
  '/shop',
  '/auth/login',
  '/auth/register',
  '/api/auth/login',
  '/api/auth/register',
  '/about',
  '/contact',
  '/blog',
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is public
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtectedPath) {
    // Get the token from the cookies
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      // Redirect to login if no token is found
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
    
    // Verify the token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      // Redirect to login if token is invalid
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
    
    // Check if the path is admin only
    const isAdminOnlyPath = adminOnlyPaths.some(path => pathname.startsWith(path));
    
    if (isAdminOnlyPath && decoded.role !== 'ADMIN') {
      // Redirect to home if user is not an admin
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
