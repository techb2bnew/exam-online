import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const alg = 'HS256'
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret')
const cookieName = 'session'

export async function createSession(payload: Record<string, any>) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
  const c = await cookies()
  c.set(cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function getSession() {
  const c = await cookies()
  const token = c.get(cookieName)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

export async function clearSession() {
  const c = await cookies()
  c.delete(cookieName)
}

