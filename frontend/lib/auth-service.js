import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

// Password hashing using bcrypt
export async function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

// Password verification using bcrypt
export async function verifyPassword(password, hash) {
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
    return null
  }
}

// Verify authentication from request
export async function verifyAuth() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    return { isAuthenticated: false }
  }

  const payload = await verifyToken(token)
  if (!payload) {
    return { isAuthenticated: false }
  }

  return {
    isAuthenticated: true,
    isAdmin: payload.role === 'ADMIN',
    user: payload
  }
}

// Set auth cookies
export function setAuthCookies(response, token) {
  if (!response || !response.cookies) {
    console.error('Invalid response object in setAuthCookies')
    return response
  }

  try {
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return response
  } catch (error) {
    console.error('Error setting auth cookies:', error)
    return response
  }
}

export function getTokenFromCookies() {
  const cookieStore = cookies()
  return cookieStore.get('token')?.value
}

export async function getUserFromToken(token) {
  if (!token) return null
  return verifyToken(token)
} 