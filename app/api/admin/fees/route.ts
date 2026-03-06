export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'
import bcrypt from 'bcrypt'

const addMinutes = (timeStr: string, minutes: number) => {
  const [h, m] = timeStr.split(':').map(Number)
  const start = new Date()
  start.setHours(h, m, 0, 0)
  const end = new Date(start.getTime() + minutes * 60 * 1000)
  const hh = String(end.getHours()).padStart(2, '0')
  const mm = String(end.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const rows: any[] = await prisma.$queryRaw`
      SELECT f.*,
             json_build_object('name', p.name, 'email', p.email) as profiles,
             COALESCE(
               (SELECT json_agg(i.*) FROM fee_installments i WHERE i.fee_id = f.id),
               '[]'::json
             ) as installments
      FROM fees f
      LEFT JOIN profiles p ON p.id = f.student_id
      ORDER BY f.created_at DESC
    `
    return NextResponse.json(rows)
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Error fetching fees' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      student_email,
      course_name,
      course_fee,
      course_timing_start,
      duration_minutes,
      course_start_date,
      course_end_date,
      total_amount,
      reference_type,
      reference_value,
      installments
    } = body

    if (!student_email || !course_name || !course_fee) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    let student = await prisma.profiles.findUnique({ where: { email: String(student_email) } })
    if (!student) {
      const hashed = await bcrypt.hash(String(Math.random()), 10)
      student = await prisma.profiles.create({
        data: {
          email: String(student_email),
          name: 'Student',
          role: 'student',
          hashed_password: hashed,
        }
      })
    }

    const dup = await prisma.fees.findFirst({ where: { student_id: student.id } })
    if (dup) {
      return NextResponse.json({ message: 'Fee already exists for this email' }, { status: 409 })
    }

    const course_timing_end = addMinutes(course_timing_start, parseInt(duration_minutes || 60))

    const inserted: any[] = await prisma.$queryRaw`
      INSERT INTO fees (
        id, student_id, course_name, course_fee, course_timing_start, course_timing_end,
        duration_minutes, course_start_date, course_end_date, total_amount,
        reference_type, reference_value, created_at
      ) VALUES (
        gen_random_uuid(), ${student.id}, ${course_name}, ${parseInt(course_fee)}, ${course_timing_start}, ${course_timing_end},
        ${parseInt(duration_minutes || 60)}, ${new Date(course_start_date)}, ${new Date(course_end_date)}, ${parseInt(total_amount)},
        ${reference_type || ''}, ${reference_value || null}, now()
      ) RETURNING *
    `
    const fee = inserted[0]

    if (installments && Array.isArray(installments) && installments.length > 0) {
      for (const it of installments) {
        await prisma.$executeRaw`
          INSERT INTO fee_installments (id, fee_id, amount, due_date, created_at)
          VALUES (gen_random_uuid(), ${fee.id}, ${parseInt(it.amount)}, ${new Date(it.due_date)}, now())
        `
      }
    }

    return NextResponse.json(fee, { status: 201 })
  } catch (error: any) {
    const msg = typeof error?.message === 'string' ? error.message : 'Error creating fee'
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
