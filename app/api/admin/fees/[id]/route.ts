export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const url = new URL(req.url)
    const id = params?.id || url.pathname.split('/').pop() || ''
    if (!id) return NextResponse.json({ message: 'Invalid id' }, { status: 400 })
    const fee = await prisma.fees.findUnique({
      where: { id },
      include: {
        profiles: { select: { name: true, email: true } },
        installments: true,
      }
    })
    if (!fee) return NextResponse.json({ message: 'Fee not found' }, { status: 404 })
    return NextResponse.json(fee)
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Error fetching fee' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    const url = new URL(req.url)
    const id = params?.id || url.pathname.split('/').pop() || ''
    if (!id) return NextResponse.json({ message: 'Invalid id' }, { status: 400 })
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

    const data: any = {}
    if (student_email) {
      const student = await prisma.profiles.findUnique({ where: { email: String(student_email) } })
      if (student) data.student_id = student.id
    }
    if (course_name) data.course_name = course_name
    if (course_fee) data.course_fee = parseInt(course_fee)
    if (duration_minutes) data.duration_minutes = parseInt(duration_minutes)
    if (course_timing_start) {
      data.course_timing_start = course_timing_start
      const mins = data.duration_minutes || parseInt(duration_minutes || '0')
      if (mins) {
        const [h, m] = String(course_timing_start).split(':').map(Number)
        const start = new Date()
        start.setHours(h, m, 0, 0)
        const end = new Date(start.getTime() + mins * 60 * 1000)
        const hh = String(end.getHours()).padStart(2, '0')
        const mm = String(end.getMinutes()).padStart(2, '0')
        data.course_timing_end = `${hh}:${mm}`
      }
    }
    if (course_start_date) data.course_start_date = new Date(course_start_date)
    if (course_end_date) data.course_end_date = new Date(course_end_date)
    if (total_amount) data.total_amount = parseInt(total_amount)
    if (reference_type) data.reference_type = reference_type
    if (reference_value !== undefined) data.reference_value = reference_value || null

    await prisma.fees.update({ where: { id }, data })

    if (Array.isArray(installments)) {
      await prisma.fee_installments.deleteMany({ where: { fee_id: id } })
      if (installments.length > 0) {
        await prisma.fee_installments.createMany({
          data: installments
            .filter(i => i?.amount && i?.due_date)
            .map(i => ({
              fee_id: id,
              amount: parseInt(i.amount),
              due_date: new Date(i.due_date)
            }))
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Error updating fee' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    const url = new URL(req.url)
    const id = params?.id || url.pathname.split('/').pop() || ''
    if (!id) return NextResponse.json({ message: 'Invalid id' }, { status: 400 })
    try {
      await prisma.fees.delete({ where: { id } })
      return NextResponse.json({ ok: true })
    } catch (e: any) {
      return NextResponse.json({ message: 'Fee not found' }, { status: 404 })
    }
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Error deleting fee' }, { status: 500 })
  }
}
