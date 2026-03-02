import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import StudentSidebar from './StudentSidebar'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const profile = await prisma.profiles.findUnique({
    where: { id: String(session.sub) },
    select: { role: true, name: true },
  })

  if (profile?.role !== 'student') {
    redirect('/admin')
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      <StudentSidebar userName={profile?.name || ''} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 md:hidden">
          <h1 className="text-xl font-black text-blue-600 tracking-tight">ExamPortal</h1>
          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">
            {profile?.name?.charAt(0)}
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6 md:p-10">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
