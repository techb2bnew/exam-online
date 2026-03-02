export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'

export default async function HomePage() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  const profile = await prisma.profiles.findUnique({
    where: { id: String(session.sub) },
    select: { role: true },
  })

  if (profile?.role === 'admin') {
    redirect('/admin/dashboard')
  } else {
    redirect('/student/dashboard')
  }
}
