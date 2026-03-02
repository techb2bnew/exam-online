import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret')
const cookieName = 'session'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  // Public paths
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next()
  }
  const token = req.cookies.get(cookieName)?.value
  if (!token) {
    const url = new URL('/login', req.url)
    return NextResponse.redirect(url)
  }
  try {
    const { payload } = await jwtVerify(token, secret)
    const role = payload.role as string | undefined
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/student/dashboard', req.url))
    }
    if (pathname.startsWith('/student') && !role) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

