import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'

export async function PATCH(req: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id, is_active } = body

    if (!id) {
      return NextResponse.json({ message: 'Test ID is required' }, { status: 400 })
    }

    const updatedTest = await prisma.tests.update({
      where: { id },
      data: { is_active }
    })

    return NextResponse.json(updatedTest)
  } catch (error: any) {
    console.error('Error updating test status:', error)
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
