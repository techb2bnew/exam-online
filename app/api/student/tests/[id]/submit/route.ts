export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { answers } = await req.json()
    const studentId = String(session.sub)

    // Fetch the test with its correct answers
    const test = await prisma.tests.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: {
              where: { is_correct: true }
            }
          }
        }
      }
    })

    if (!test) {
      return NextResponse.json({ message: 'Test not found' }, { status: 404 })
    }

    // Check if there is a pending assignment
    const assignment = await prisma.assignments.findFirst({
      where: {
        test_id: id,
        student_id: studentId,
        status: 'pending'
      }
    })

    if (!assignment) {
      return NextResponse.json({ message: 'No pending assignment found' }, { status: 400 })
    }

    // Simple Auto-grading logic (only for MCQ/Checkbox/TrueFalse)
    let totalMarksObtained = 0

    for (const question of test.questions) {
      const studentAnswer = answers[question.id]
      if (!studentAnswer) continue

      if (question.question_type === 'mcq' || question.question_type === 'true_false') {
        const correctOptionId = question.options[0]?.id
        if (studentAnswer === correctOptionId) {
          totalMarksObtained += question.marks
        }
      } else if (question.question_type === 'checkbox') {
        const correctOptionIds = question.options.map(o => o.id)
        const isCorrect = Array.isArray(studentAnswer) && 
                          studentAnswer.length === correctOptionIds.length &&
                          studentAnswer.every(id => correctOptionIds.includes(id))
        if (isCorrect) {
          totalMarksObtained += question.marks
        }
      }
      // Textarea answers cannot be auto-graded easily, they would need manual review
      // or simple keyword matching (not implemented here)
    }

    // Save submission and update assignment status in a transaction
    await prisma.$transaction([
      prisma.submissions.create({
        data: {
          test_id: id,
          student_id: studentId,
          answers: answers,
          marks_obtained: totalMarksObtained,
        }
      }),
      prisma.assignments.update({
        where: { id: assignment.id },
        data: { status: 'completed' }
      })
    ])

    return NextResponse.json({ message: 'Submitted successfully', score: totalMarksObtained })
  } catch (error) {
    console.error('Error submitting test:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
