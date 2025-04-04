export const runtime = 'nodejs'

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createToken, setAuthCookies } from '@/lib/auth-service';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  console.log('[Login API] Starting login process...');
  try {
    const { email, password } = await request.json();
    console.log('[Login API] Request body:', { 
      email: email,
      hasPassword: !!password,
    });
    
    if (!email || !password) {
      console.log('[Login API] Missing required fields:', { email: !!email, password: !!password });
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('[Login API] Looking up user:', { email });
    try {
      // Test database connection
      await prisma.$queryRaw`SELECT 1`;
      
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        console.log('[Login API] User not found');
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      console.log('[Login API] User found:', { 
        userId: user.id,
        email: user.email,
      });

      console.log('[Login API] Verifying password...');
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        console.log('[Login API] Invalid password');
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Create token
      const token = await createToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;

      console.log('[Login API] Login successful:', { 
        userId: user.id,
        email: user.email,
      });

      // Create response with user data and token
      const response = new NextResponse(
        JSON.stringify({
          user: userWithoutPassword,
          token
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Set auth cookies
      return setAuthCookies(response, token);
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'An error occurred during login' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
