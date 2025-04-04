import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createToken, setAuthCookies } from '@/lib/auth-service';

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
        { status: 400 }
      );
    }

    // Hash the password
    console.log('[Register] Hashing password...');
    const hashedPassword = await hashPassword(password);

    // Create the user
    console.log('[Register] Creating user...');
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });
    console.log('[Register] User created successfully:', { userId: user.id });

    // Create token
    console.log('[Register] Creating token...');
    const token = await createToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
    console.log('[Register] Token created successfully');

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

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
    console.log('[Register] Setting auth cookies...');
    return setAuthCookies(response, token);
  } catch (error) {
    console.error('[Register] Registration error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
