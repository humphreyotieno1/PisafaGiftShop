import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

// Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Hash a password
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

/**
 * Compare a password with a hash
 */
export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token
 */
export function generateToken(user) {
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
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
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
    // First verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Use the same token generation as generateToken for consistency
    const token = generateToken(user);
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
      token: generateToken(user),
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
    const decoded = verifyToken(token);
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
    const decoded = jwt.verify(token, JWT_SECRET);
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
        // Even though the token is expired, we can still decode it to get the user ID
        const decoded = jwt.decode(token);
        const userId = decoded.id || decoded.userId;
        
        if (userId) {
          const user = await prisma.user.findUnique({
            where: { id: userId },
          });
          
          if (user) {
            // Generate a new token
            const newToken = generateToken(user);
            
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
    const decoded = jwt.verify(token, JWT_SECRET);
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
