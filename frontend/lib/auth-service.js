import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Password hashing using bcrypt
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10)
}

// Password verification using bcrypt
export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash)
}

// Create JWT token
export async function createToken(payload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(JWT_SECRET))
  
  return token
}

// Verify JWT token
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    )
    return payload
  } catch (error) {
    console.error('Token verification failed:', error)
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
    console.error('Invalid response object provided to setAuthCookies')
    return response
  }

  try {
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })
  } catch (error) {
    console.error('Error setting auth cookies:', error)
  }

  return response
} 