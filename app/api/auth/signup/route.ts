import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { createSession } from '@/lib/auth/session'

export async function POST(req: Request) {
  try {
    const { email, password, name, role } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
    }

    const existing = await prisma.profiles.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }
    if (role === 'admin') {
      const adminExists = await prisma.profiles.findFirst({ where: { role: 'admin' } })
      if (adminExists) {
        return NextResponse.json({ error: 'Admin already exists' }, { status: 400 })
      }
    }
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.profiles.create({
      data: { email, name, role, hashed_password: hashed },
    })

    await createSession({ sub: user.id, role: user.role, name: user.name, email: user.email })
    return NextResponse.json({ ok: true, user }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Signup failed' }, { status: 500 })
  }
}
