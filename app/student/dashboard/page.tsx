export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText, Clock, Trophy, ArrowRight, CheckCircle2 } from 'lucide-react'

export default async function StudentDashboard() {
  const session = await getSession()
  const studentId = String(session?.sub)

  // 1. Fetch all available tests (only active ones)
  const allTests = await prisma.tests.findMany({
    where: { is_active: true },
    orderBy: { created_at: 'desc' },
  })

  // 2. Fetch student's assignments to check status
  const assignments = await prisma.assignments.findMany({
    where: { student_id: studentId },
    select: { test_id: true, status: true }
  })

  // Create a map for quick lookup
  const assignmentMap = new Map(assignments.map(a => [a.test_id, a.status]))

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Available Exams</h2>
          <p className="text-gray-500 font-medium mt-1">Browse and attempt any of the following tests.</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
          <span className="text-xs font-black text-blue-700 uppercase tracking-widest">{allTests.length} Live Exams</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allTests.map((test) => {
          const status = assignmentMap.get(test.id) || 'not_started'
          const isCompleted = status === 'completed'
          
          return (
            <div key={test.id} className={`group relative bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden flex flex-col h-full ${
              isCompleted 
                ? 'border-green-100 hover:shadow-2xl hover:shadow-green-100/50' 
                : 'border-gray-100 hover:shadow-2xl hover:shadow-blue-100/50 hover:-translate-y-1'
            }`}>
              {/* Card Header Background Decor */}
              <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full transition-transform duration-500 group-hover:scale-110 ${
                isCompleted ? 'bg-green-50/50' : 'bg-blue-50/50'
              }`} />

              <div className="p-8 relative flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-3 rounded-2xl shadow-sm ${
                    isCompleted ? 'bg-green-600 text-white shadow-green-200' : 'bg-blue-600 text-white shadow-blue-200'
                  }`}>
                    <FileText size={24} />
                  </div>
                  {isCompleted ? (
                    <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      <CheckCircle2 size={12} />
                      Completed
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      <Clock size={12} />
                      {test.duration} Mins
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                  {test.title}
                </h3>
                <p className="text-sm text-gray-500 font-medium line-clamp-2 mb-6 leading-relaxed">
                  {test.description || 'Take this challenge to test your knowledge and improve your skills.'}
                </p>

                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Total Score</span>
                    <span className="text-lg font-black text-gray-900">{test.total_marks} Marks</span>
                  </div>

                  {isCompleted ? (
                    <Link href={`/student/results`}>
                      <button className="bg-white border-2 border-green-600 text-green-600 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all duration-200 active:scale-95 shadow-lg shadow-green-100">
                        View Result
                      </button>
                    </Link>
                  ) : (
                    <Link href={`/student/tests/${test.id}`}>
                      <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all duration-200 active:scale-95 shadow-lg shadow-blue-200 flex items-center gap-2">
                        {status === 'pending' ? 'Resume' : 'Start Now'}
                        <ArrowRight size={16} />
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {allTests.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FileText size={40} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No Exams Found</h3>
            <p className="text-gray-500 font-medium max-w-xs mx-auto">Check back later for newly assigned tests and assessments.</p>
          </div>
        )}
      </div>
    </div>
  )
}
