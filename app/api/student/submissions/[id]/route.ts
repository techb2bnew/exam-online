export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const studentId = String(session.sub)

    const submission = await prisma.submissions.findUnique({
      where: { id },
      include: {
        tests: {
          include: {
            questions: {
              orderBy: { order_index: 'asc' },
              include: { options: true }
            }
          }
        }
      }
    })

    if (!submission) return NextResponse.json({ message: 'Submission not found' }, { status: 404 })

    // Security check: ensure the submission belongs to the student
    if (submission.student_id !== studentId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    // Security check: only show details if it's reviewed
    if (!submission.is_reviewed) {
      return NextResponse.json({ message: 'Results are under review' }, { status: 403 })
    }

    return NextResponse.json(submission)
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Error fetching submission' }, { status: 500 })
  }
}
