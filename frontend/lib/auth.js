// Import bcrypt conditionally to avoid Edge Runtime errors
let bcrypt;
let jwt;
if (typeof window === 'undefined') {
  // Server-side only
  bcrypt = require('bcryptjs');
  jwt = require('jsonwebtoken');
}

import { jwtVerify, SignJWT } from 'jose';
import { prisma } from './prisma';

// Ensure JWT_SECRET is set
if (typeof process !== 'undefined' && !process.env.JWT_SECRET) {
  console.warn('JWT_SECRET environment variable is not set');
}

const JWT_SECRET = typeof process !== 'undefined' ? process.env.JWT_SECRET : 'your-secret-key';
const JWT_SECRET_BUFFER = new TextEncoder().encode(JWT_SECRET);

/**
 * Hash a password
 */
export async function hashPassword(password) {
  // Only available server-side
  if (!bcrypt) {
    throw new Error('bcrypt is only available on the server side');
  }
  return await bcrypt.hash(password, 10);
}

/**
 * Compare a password with a hash
 */
export async function comparePassword(password, hash) {
  // Only available server-side
  if (!bcrypt) {
    throw new Error('bcrypt is only available on the server side');
  }
  return await bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token
 */
export async function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  // Use jose in Edge Runtime, jsonwebtoken in Node.js
  if (jwt) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  } else {
    // Edge-compatible JWT signing
    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET_BUFFER);
  }
}

/**
 * Verify a JWT token
 */
export async function verifyToken(token) {
  try {
    // Use jose in Edge Runtime, jsonwebtoken in Node.js
    if (jwt) {
      return jwt.verify(token, JWT_SECRET);
    } else {
      // Edge-compatible JWT verification
      const { payload } = await jwtVerify(token, JWT_SECRET_BUFFER);
      return payload;
    }
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

/**
 * Create a session
 */
export async function createSession(userId) {
  try {
    // This function should only be called server-side
    if (typeof window !== 'undefined') {
      throw new Error('createSession can only be called on the server side');
    }
    
    // First verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Use the same token generation as generateToken for consistency
    const token = await generateToken(user);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

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

    return session;
  } catch (error) {
    console.error('Error creating session:', error);
    // If we can't create a session in the database, still return a token
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return { 
      token: await generateToken(user),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
  }
}

/**
 * Get user from token
 */
export async function getUserFromToken(token) {
  if (!token) return null;
  
  try {
    const decoded = await verifyToken(token);
    if (!decoded) return null;
    
    const userId = decoded.id;
    if (!userId) return null;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;

    // Don't return the password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

/**
 * Check if user is authenticated and has admin role
 */
export async function isAdmin(req) {
  const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];
  if (!token) return false;

  try {
    const user = await getUserFromToken(token);
    return user?.role === 'ADMIN';
  } catch (error) {
    return false;
  }
}

/**
 * Verify authentication from request
 */
export async function verifyAuth(request) {
  // Try to get token from cookies first, then from authorization header
  const cookieToken = request.cookies?.get?.('token')?.value;
  const headerAuth = request.headers?.get?.('authorization');
  const headerToken = headerAuth?.split(' ')[1];
  const token = cookieToken || headerToken;
  
  if (!token) {
    return { user: null, error: 'No token provided' };
  }

  try {
    const decoded = await verifyToken(token);
    if (!decoded) {
      return { user: null, error: 'Invalid token' };
    }
    
    const userId = decoded.id || decoded.userId;
    
    if (!userId) {
      return { user: null, error: 'Invalid token format' };
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { user: null, error: 'User not found' };
    }

    // Don't return the password
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, error: null };
  } catch (error) {
    // If token is expired but we can extract the user ID, try to refresh
    if (error.name === 'TokenExpiredError' && token) {
      try {
        // Even though the token is expired, we can still decode it
        let userId;
        
        if (jwt) {
          // Node.js environment
          const decoded = jwt.decode(token);
          userId = decoded.id || decoded.userId;
        } else {
          // Edge environment - we can't easily decode without verification in jose
          // This is a simplified approach
          try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              userId = payload.id || payload.userId;
            }
          } catch (e) {
            console.error('Error decoding token:', e);
          }
        }
        
        if (userId) {
          const user = await prisma.user.findUnique({
            where: { id: userId },
          });
          
          if (user) {
            // Generate a new token
            const newToken = await generateToken(user);
            
            // Don't return the password
            const { password, ...userWithoutPassword } = user;
            
            // Return the user and the new token
            return { 
              user: userWithoutPassword, 
              error: null,
              newToken,
              tokenRefreshed: true
            };
          }
        }
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError);
      }
    }
    
    console.error('Auth verification error:', error);
    return { user: null, error: error.message };
  }
}

/**
 * Get token from request
 */
export async function getToken(request) {
  // Try to get token from cookies first
  const cookieToken = request.cookies?.get?.('token')?.value;
  
  // Then try to get from Authorization header
  const headerAuth = request.headers?.get?.('authorization');
  const headerToken = headerAuth?.startsWith('Bearer ') ? headerAuth.substring(7) : null;
  
  // Use whichever token is available
  const token = cookieToken || headerToken;
  
  if (!token) {
    return null;
  }

  try {
    const decoded = await verifyToken(token);
    if (!decoded) return null;
    
    return {
      token,
      userId: decoded.id || decoded.userId,
      role: decoded.role
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}
