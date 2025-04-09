import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Paths that require authentication
const protectedPaths = [
  '/admin',
  '/api/admin',
  '/profile',
  '/orders',
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

// Simple token verification function that works in Edge Runtime
async function verifyTokenEdge(token) {
  try {
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

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
    
    // Verify the token using the Edge-compatible function
    const payload = await verifyTokenEdge(token);
    
    if (!payload) {
      // If token verification failed, redirect to login
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
    
    // Check if the path is admin only
    const isAdminOnlyPath = adminOnlyPaths.some(path => pathname.startsWith(path));
    
    if (isAdminOnlyPath && payload.role !== 'ADMIN') {
      // Redirect to home if user is not an admin
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Add user info to request headers for API routes
    if (pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.id);
      requestHeaders.set('x-user-role', payload.role);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
