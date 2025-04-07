import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { user, error, newToken, tokenRefreshed } = await verifyAuth(request);
    
    if (error || !user) {
      return NextResponse.json(
        { error: error || 'No token provided' },
        { status: 401 }
      );
    }

    // Create response with user data
    const response = NextResponse.json({ user });

    // If token was refreshed, set the new token in the response
    if (tokenRefreshed && newToken) {
      response.cookies.set({
        name: 'token',
        value: newToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
    }

    return response;
  } catch (error) {
    console.error('[Auth/Me] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}
