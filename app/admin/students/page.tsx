import { prisma } from '@/lib/prisma'
import StudentsClient from './StudentsClient'

export default async function AdminStudentsPage() {
  const students = await prisma.profiles.findMany({
    where: { role: 'student' },
    orderBy: { created_at: 'desc' },
    include: {
      _count: {
        select: { submissions: true, assignments: true }
      }
    }
  })

  return <StudentsClient students={students} />
}
