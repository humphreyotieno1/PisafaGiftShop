import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authService } from '@/lib/auth-service';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  console.log('[Register] Starting registration process...');
  try {
    const { email, password, name, role = 'CUSTOMER' } = await request.json();
    console.log('[Register] Registration attempt for:', { email, role });

    // Validate input
    if (!email || !password || !name) {
      console.log('[Register] Missing required fields:', { email, name: !!name });
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    console.log('[Register] Checking if user exists:', email);
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('[Register] User already exists:', email);
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash the password
    console.log('[Register] Hashing password...');
    const hashedPassword = await authService.hashPassword(password);

    // Create the user
    console.log('[Register] Creating user...');
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER',
      },
    });
    console.log('[Register] User created successfully:', { userId: user.id });

    // Create a session
    console.log('[Register] Creating session...');
    const session = await authService.createSession(user.id);
    
    if (!session || !session.token) {
      console.error('[Register] Failed to create session');
      throw new Error('Failed to create session');
    }
    console.log('[Register] Session created successfully');

    // Create response with user data
    const { password: _, ...userWithoutPassword } = user;
    const response = NextResponse.json({
      user: userWithoutPassword,
      token: session.token,
      message: 'Registration successful',
    });

    // Set auth cookies
    console.log('[Register] Setting auth cookies...');
    authService.setAuthCookies(session.token);

    console.log('[Register] Registration completed successfully');
    return response;
  } catch (error) {
    console.error('[Register] Registration error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    let errorMessage = 'An error occurred during registration';
    let statusCode = 500;

    if (error.message.includes('Failed to create session')) {
      errorMessage = 'Failed to create login session';
    } else if (error.message.includes('User not found')) {
      errorMessage = 'User not found';
      statusCode = 404;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
