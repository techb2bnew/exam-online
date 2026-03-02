import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, duration, total_marks, instructions, questions } = body

    if (!title || !questions || questions.length === 0) {
      return NextResponse.json({ message: 'Title and questions are required' }, { status: 400 })
    }

    // Create the test and questions in a transaction
    const test = await prisma.$transaction(async (tx) => {
      const newTest = await tx.tests.create({
        data: {
          title,
          description,
          duration: parseInt(duration),
          total_marks: parseInt(total_marks),
          instructions,
          created_by: String(session.sub),
        }
      })

      // Create questions
      for (const [index, q] of questions.entries()) {
        const newQuestion = await tx.questions.create({
          data: {
            test_id: newTest.id,
            question_text: q.question_text,
            question_type: q.question_type,
            marks: parseInt(q.marks),
            order_index: index,
          }
        })

        // Create options if applicable
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

      // Create assignments for ALL existing students
      const students = await tx.profiles.findMany({
        where: { role: 'student' }
      })

      if (students.length > 0) {
        await tx.assignments.createMany({
          data: students.map(student => ({
            test_id: newTest.id,
            student_id: student.id,
            status: 'pending'
          }))
        })
      }

      return newTest
    })

    return NextResponse.json(test, { status: 201 })
  } catch (error: any) {
    console.error('Error creating test:', error)
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const tests = await prisma.tests.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    })
    return NextResponse.json(tests)
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
