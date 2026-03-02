export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'

// Delete Test
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    await prisma.tests.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Test deleted successfully' })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Error deleting test' }, { status: 500 })
  }
}

// Get Single Test for Editing
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const test = await prisma.tests.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order_index: 'asc' },
          include: { options: true }
        }
      }
    })

    if (!test) return NextResponse.json({ message: 'Test not found' }, { status: 404 })

    return NextResponse.json(test)
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Error fetching test' }, { status: 500 })
  }
}

// Update Test
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const { title, description, duration, total_marks, instructions, questions } = body

    const updatedTest = await prisma.$transaction(async (tx) => {
      // 1. Delete old questions (options will be deleted by Cascade)
      await tx.questions.deleteMany({ where: { test_id: id } })

      // 2. Update test details
      const test = await tx.tests.update({
        where: { id },
        data: {
          title,
          description,
          duration: parseInt(duration),
          total_marks: parseInt(total_marks),
          instructions,
        }
      })

      // 3. Create new questions and options
      for (const [index, q] of questions.entries()) {
        const newQuestion = await tx.questions.create({
          data: {
            test_id: test.id,
            question_text: q.question_text,
            question_type: q.question_type,
            marks: parseInt(q.marks),
            order_index: index,
          }
        })

        if (q.options && q.options.length > 0) {
          await tx.options.createMany({
            data: q.options.map((opt: any) => ({
              question_id: newQuestion.id,
              option_text: opt.option_text,
              is_correct: opt.is_correct,
            }))
          })
        }
      }
      return test
    })

    return NextResponse.json(updatedTest)
  } catch (error: any) {
    console.error('Update error:', error)
    return NextResponse.json({ message: error.message || 'Error updating test' }, { status: 500 })
  }
}
