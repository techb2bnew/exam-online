import { NextResponse } from 'next/server'
import { clearSession } from '@/lib/auth/session'

export async function POST(request: Request) {
  await clearSession()

  const url = new URL(request.url)
  return NextResponse.redirect(new URL('/login', url.origin), {
    status: 302,
  })
}
