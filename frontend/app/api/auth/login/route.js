import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authService } from '@/lib/auth-service';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  console.log('[Login API] Starting login process...');
  try {
    const body = await request.json();
    console.log('[Login API] Request body:', { 
      email: body.email,
      hasPassword: !!body.password,
      role: body.role 
    });
    
    const { email, password, role } = body;
    
    console.log('[Login API] Validating input...');
    if (!email || !password) {
      console.log('[Login API] Missing required fields:', { email: !!email, password: !!password });
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('[Login API] Looking up user:', { email, role });
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
        role: user.role 
      });

      console.log('[Login API] Verifying password...');
      const isValid = await authService.comparePassword(password, user.password);
      if (!isValid) {
        console.log('[Login API] Invalid password');
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      if (role && user.role !== role) {
        console.log('[Login API] Role mismatch:', { 
          expected: role, 
          actual: user.role 
        });
        return NextResponse.json(
          { error: 'Invalid role' },
          { status: 403 }
        );
      }

      console.log('[Login API] Creating session...');
      let session;
      try {
        session = await authService.createSession(user.id);
        if (!session) {
          console.log('[Login API] Failed to create session');
          return NextResponse.json(
            { error: 'Failed to create session' },
            { status: 500 }
          );
        }
      } catch (sessionError) {
        console.error('[Login API] Session creation error:', sessionError);
        return NextResponse.json(
          { error: 'Failed to create session' },
          { status: 500 }
        );
      }

      console.log('[Login API] Login successful:', { 
        userId: user.id,
        email: user.email,
        role: user.role 
      });

      const response = NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token: session.token
      }, {
        status: 200,
        headers: {
          'Set-Cookie': `token=${session.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
        }
      });

      return response;
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'An error occurred during login' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
