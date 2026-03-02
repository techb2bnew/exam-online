import { prisma } from '@/lib/prisma'
import { FileText, Users, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  // Fetch stats and recent items using Prisma
  const [testsCount, studentsCount, submissionsCount, activeExamsCount, recentTests, recentSubmissions] = await Promise.all([
    prisma.tests.count(),
    prisma.profiles.count({ where: { role: 'student' } }),
    prisma.submissions.count(),
    prisma.tests.count({ where: { is_active: true } }),
    prisma.tests.findMany({
      orderBy: { created_at: 'desc' },
      take: 5,
      include: {
        _count: {
          select: { questions: true }
        }
      }
    }),
    prisma.submissions.findMany({
      orderBy: { submitted_at: 'desc' },
      take: 5,
      include: {
        profiles: { select: { name: true, email: true } },
        tests: { select: { title: true } }
      }
    })
  ])

  const stats = [
    {
      title: 'Total Tests',
      value: testsCount || 0,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      title: 'Active Exams',
      value: activeExamsCount || 0,
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      borderColor: 'border-orange-100',
    },
    {
      title: 'Submissions',
      value: submissionsCount || 0,
      icon: CheckCircle,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      borderColor: 'border-purple-100',
    },
    {
      title: 'Total Students',
      value: studentsCount || 0,
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-50',
      borderColor: 'border-green-100',
    },
  ]

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h2>
        <p className="text-gray-500 font-medium mt-1">Overview of the examination system performance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className={`bg-white p-6 rounded-[2rem] border ${stat.borderColor} shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.title}</p>
                <p className="text-3xl font-black text-gray-900 mt-1 tracking-tight group-hover:scale-110 transition-transform origin-left">{stat.value}</p>
              </div>
              <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm`}>
                <stat.icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Recent Tests</h3>
            <Link href="/admin/tests" className="text-xs font-black text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl transition-colors">View All</Link>
          </div>
          <div className="space-y-4">
            {recentTests.map((test) => (
              <div key={test.id} className="flex items-center justify-between p-4 hover:bg-gray-50/80 rounded-[1.5rem] transition-all border border-transparent hover:border-gray-100 group">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-800 group-hover:text-blue-600 transition-colors">{test.title}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-0.5">{test._count.questions} Questions • {test.total_marks} Marks</p>
                  </div>
                </div>
                <div className="text-[10px] font-black text-gray-300 uppercase tracking-wider bg-gray-50 px-3 py-1 rounded-lg">
                  {new Date(test.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            ))}
            {recentTests.length === 0 && (
              <div className="py-12 text-center">
                <FileText size={40} className="text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold text-sm italic">No recent tests found.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Recent Submissions</h3>
            <Link href="/admin/results" className="text-xs font-black text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl transition-colors">View All</Link>
          </div>
          <div className="space-y-4">
            {recentSubmissions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between p-4 hover:bg-gray-50/80 rounded-[1.5rem] transition-all border border-transparent hover:border-gray-100 group">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-all">
                    {sub.profiles.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-800 group-hover:text-purple-600 transition-colors">{sub.profiles.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-0.5 line-clamp-1">{sub.tests.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-purple-600 tracking-tighter">{sub.marks_obtained} Pts</p>
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-wider">{new Date(sub.submitted_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                </div>
              </div>
            ))}
            {recentSubmissions.length === 0 && (
              <div className="py-12 text-center">
                <CheckCircle size={40} className="text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold text-sm italic">No recent submissions found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
