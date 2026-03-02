import { prisma } from '@/lib/prisma'
import TestsClient from './TestsClient'

export default async function AdminTestsPage() {
  const tests = await prisma.tests.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      _count: {
        select: { questions: true }
      }
    }
  })

  return <TestsClient tests={tests} />
}
