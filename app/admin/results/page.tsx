export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
import { prisma } from '@/lib/prisma'
import SubmissionsClient from './SubmissionsClient'

export default async function AdminResultsPage() {
  // Fetch all submissions with student and test info using Prisma
  const submissions = await prisma.submissions.findMany({
    include: {
      profiles: true,
      tests: true,
    },
    orderBy: {
      submitted_at: 'desc',
    },
  })

  return <SubmissionsClient submissions={submissions} />
}
