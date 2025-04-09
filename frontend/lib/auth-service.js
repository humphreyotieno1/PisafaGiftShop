import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

// Import bcrypt conditionally to avoid Edge Runtime errors
let bcrypt;
if (typeof window === 'undefined') {
  // Server-side only
  bcrypt = require('bcryptjs');
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

// Password hashing using bcrypt
export async function hashPassword(password) {
  // Only available server-side
  if (!bcrypt) {
    throw new Error('bcrypt is only available on the server side');
  }
  return bcrypt.hash(password, 10)
}

// Password verification using bcrypt
export async function verifyPassword(password, hash) {
  // Only available server-side
  if (!bcrypt) {
    throw new Error('bcrypt is only available on the server side');
  }
  return bcrypt.compare(password, hash)
}

// Create JWT token
export async function createToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
}

// Verify JWT token
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

// Verify authentication from request
export async function verifyAuth() {
  try {
    // This function only works on the server
    if (typeof window !== 'undefined') {
      console.error('verifyAuth can only be called on the server');
      return { isAuthenticated: false, isAdmin: false };
    }

    const cookieStore = cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      console.log('No token found in cookies')
      return { isAuthenticated: false, isAdmin: false }
    }

    const payload = await verifyToken(token)
    if (!payload) {
      console.log('Token verification failed')
      return { isAuthenticated: false, isAdmin: false }
    }

    // Check if token is about to expire (within 1 hour)
    const tokenExp = payload.exp * 1000 // Convert to milliseconds
    const now = Date.now()
    const isExpiringSoon = tokenExp - now < 60 * 60 * 1000 // 1 hour

    const isAdmin = payload.role === 'ADMIN'
    console.log('Auth verification successful:', { 
      isAuthenticated: true, 
      isAdmin,
      userId: payload.id,
      role: payload.role,
      isExpiringSoon
    })

    return {
      isAuthenticated: true,
      isAdmin,
      user: payload,
      isExpiringSoon
    }
  } catch (error) {
    console.error('Auth verification failed:', error)
    return { isAuthenticated: false, isAdmin: false }
  }
}

// Set auth cookies
export function setAuthCookies(response, token) {
  // This function only works on the server
  if (typeof window !== 'undefined') {
    console.error('setAuthCookies can only be called on the server');
    return response;
  }

  if (!response || !response.cookies) {
    console.error('Invalid response object in setAuthCookies')
    return response
  }

  try {
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return response
  } catch (error) {
    console.error('Error setting auth cookies:', error)
    return response
  }
}

export function getTokenFromCookies() {
  // This function only works on the server
  if (typeof window !== 'undefined') {
    console.error('getTokenFromCookies can only be called on the server');
    return null;
  }

  const cookieStore = cookies()
  return cookieStore.get('token')?.value
}

export async function getUserFromToken(token) {
  if (!token) return null
  return verifyToken(token)
} 