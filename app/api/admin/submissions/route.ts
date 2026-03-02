import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ message: 'ID is required' }, { status: 400 })

    const submission = await prisma.submissions.findUnique({
      where: { id },
      include: {
        profiles: {
          select: { name: true, email: true }
        },
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

    return NextResponse.json(submission)
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Error fetching submission' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { id, marks_obtained } = body

    if (!id) return NextResponse.json({ message: 'ID is required' }, { status: 400 })

    const updatedSubmission = await prisma.submissions.update({
      where: { id },
      data: {
        marks_obtained: parseInt(marks_obtained),
        is_reviewed: true
      }
    })

    return NextResponse.json(updatedSubmission)
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Error updating marks' }, { status: 500 })
  }
}
