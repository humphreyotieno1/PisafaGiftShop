import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    // Get token from cookies if available
    let cookieToken = null;
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});
      cookieToken = cookies['token'];
    }
    
    // Use whichever token is available
    const token = headerToken || cookieToken;

    // For development purposes, if no token is found but we're in development,
    // return a mock user to prevent 401 errors during development
    if (!token) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('No auth token found, but returning mock user for development');
        return NextResponse.json({ 
          user: { 
            id: 'dev-user-id',
            email: 'dev@example.com',
            name: 'Development User',
            role: 'CUSTOMER'
          } 
        });
      } else {
        return NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        );
      }
    }

    const user = await getUserFromToken(token);

    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Invalid token, but returning mock user for development');
        return NextResponse.json({ 
          user: { 
            id: 'dev-user-id',
            email: 'dev@example.com',
            name: 'Development User',
            role: 'CUSTOMER'
          } 
        });
      } else {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    
    // For development purposes, return a mock user on error
    if (process.env.NODE_ENV === 'development') {
      console.warn('Error in auth/me, but returning mock user for development');
      return NextResponse.json({ 
        user: { 
          id: 'dev-user-id',
          email: 'dev@example.com',
          name: 'Development User',
          role: 'CUSTOMER'
        } 
      });
    }
    
    return NextResponse.json(
      { error: 'An error occurred while fetching user data' },
      { status: 500 }
    );
  }
}
