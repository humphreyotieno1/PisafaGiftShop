import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

const JWT_SECRET = process.env.JWT_SECRET;

class AuthService {
  /**
   * Hash a password
   */
  async hashPassword(password) {
    console.log('[AuthService] Hashing password...');
    return await bcrypt.hash(password, 10);
  }

  /**
   * Compare a password with a hash
   */
  async comparePassword(password, hash) {
    console.log('[AuthService] Comparing password with hash...');
    return await bcrypt.compare(password, hash);
  }

  /**
   * Generate a JWT token
   */
  generateToken(user) {
    console.log('[AuthService] Generating token for user:', { userId: user.id, email: user.email });
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }

  /**
   * Verify a JWT token
   */
  verifyToken(token) {
    console.log('[AuthService] Verifying token...');
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('[AuthService] Token verified successfully:', { userId: decoded.id });
      return decoded;
    } catch (error) {
      console.error('[AuthService] Token verification failed:', error.message);
      return null;
    }
  }

  /**
   * Create a session for a user
   */
  async createSession(userId) {
    console.log('[AuthService] Creating session for user:', userId);
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        console.error('[AuthService] User not found for session creation:', userId);
        throw new Error('User not found');
      }

      console.log('[AuthService] Generating token...');
      const token = this.generateToken(user);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      console.log('[AuthService] Creating session in database...');
      try {
        const session = await prisma.session.create({
          data: {
            userId,
            token,
            expiresAt,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
              },
            },
          },
        });

        console.log('[AuthService] Session created successfully:', { 
          sessionId: session.id,
          userId: session.user.id,
          role: session.user.role
        });
        return session;
      } catch (dbError) {
        console.error('[AuthService] Database error creating session:', dbError);
        throw new Error('Failed to create session in database');
      }
    } catch (error) {
      console.error('[AuthService] Error creating session:', error);
      throw error;
    }
  }

  /**
   * Get user from token
   */
  async getUserFromToken(token) {
    console.log('[AuthService] Getting user from token...');
    if (!token) {
      console.log('[AuthService] No token provided');
      return null;
    }

    try {
      const decoded = this.verifyToken(token);
      if (!decoded) {
        console.log('[AuthService] Token verification failed');
        return null;
      }

      const userId = decoded.id;
      if (!userId) {
        console.log('[AuthService] No user ID in token');
        return null;
      }

      console.log('[AuthService] Fetching user from database:', userId);
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        console.log('[AuthService] User not found in database');
        return null;
      }

      console.log('[AuthService] User found:', { userId: user.id, email: user.email });
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('[AuthService] Error getting user from token:', error);
      return null;
    }
  }

  /**
   * Set authentication cookies
   */
  setAuthCookies(token) {
    console.log('[AuthService] Setting auth cookies...');
    if (typeof window !== 'undefined') {
      document.cookie = `token=${token}; path=/; max-age=604800; samesite=lax`;
    } else {
      cookies().set({
        name: 'token',
        value: token,
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
    }
  }

  /**
   * Clear authentication cookies
   */
  clearAuthCookies() {
    console.log('[AuthService] Clearing auth cookies...');
    if (typeof window !== 'undefined') {
      document.cookie = 'token=; path=/; max-age=0';
    } else {
      cookies().delete('token');
    }
  }
}

export const authService = new AuthService(); 