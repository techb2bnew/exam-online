export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const studentId = String(session.sub)

    const test = await prisma.tests.findUnique({
      where: { id: id },
      include: {
        questions: {
          orderBy: { order_index: 'asc' },
          include: {
            options: true
          }
        }
      }
    })

    if (!test) {
      return NextResponse.json({ message: 'Test not found' }, { status: 404 })
    }

    // Check if assignment exists, if not, create a 'pending' one to track progress
    let assignment = await prisma.assignments.findFirst({
      where: {
        test_id: id,
        student_id: studentId
      }
    })

    if (!assignment) {
      assignment = await prisma.assignments.create({
        data: {
          test_id: id,
          student_id: studentId,
          status: 'pending'
        }
      })
    } else if (assignment.status === 'completed') {
      return NextResponse.json({ message: 'You have already completed this test' }, { status: 403 })
    }

    return NextResponse.json(test)
  } catch (error) {
    console.error('Error fetching test:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
