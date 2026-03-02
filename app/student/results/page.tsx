export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { FileText, Calendar, Trophy, CheckCircle2, ArrowRight, EyeOff, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function StudentResultsPage() {
  const session = await getSession()
  if (!session) return null

  const submissions = await prisma.submissions.findMany({
    where: { student_id: String(session.sub) },
    include: { tests: true },
    orderBy: { submitted_at: 'desc' }
  })

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Results History</h2>
          <p className="text-gray-500 font-medium mt-1">Track your performance across all completed exams.</p>
        </div>
        <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-2xl border border-purple-100">
          <Trophy size={16} className="text-purple-600" />
          <span className="text-xs font-black text-purple-700 uppercase tracking-widest">{submissions.length} Tests Completed</span>
        </div>
      </div>

      <div className="space-y-6">
        {submissions.map((submission) => {
          const isReviewed = submission.is_reviewed
          const percentage = (submission.marks_obtained / submission.tests.total_marks) * 100
          const isPassed = percentage >= 40

          return (
            <div key={submission.id} className="group relative bg-white rounded-[2.5rem] p-2 pr-8 border border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 flex flex-col md:flex-row md:items-center gap-6">
              {/* Left Status Icon Container */}
              <div className={`w-24 h-24 md:w-28 md:h-28 rounded-[2rem] flex flex-col items-center justify-center shrink-0 transition-colors ${
                !isReviewed 
                  ? 'bg-amber-50 text-amber-600' 
                  : isPassed ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
              }`}>
                {!isReviewed ? (
                  <>
                    <Clock size={32} className="mb-1" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">Pending</span>
                  </>
                ) : (
                  <>
                    <Trophy size={32} className="mb-1" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">{isPassed ? 'Passed' : 'Failed'}</span>
                  </>
                )}
              </div>

              {/* Main Content */}
              <div className="flex-1 py-4 md:py-0 px-6 md:px-0">
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {submission.tests.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-[11px] uppercase tracking-wider">
                      <Calendar size={14} />
                      {new Date(submission.submitted_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-[11px] uppercase tracking-wider">
                      <FileText size={14} />
                      Total {submission.tests.total_marks} Marks
                    </div>
                  </div>
                </div>
              </div>

              {/* Score / Status Section */}
              <div className="flex items-center gap-8 px-6 md:px-0 pb-6 md:pb-0">
                {isReviewed ? (
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Your Score</div>
                      <div className="flex items-baseline gap-1.5">
                        <span className={`text-4xl font-black tracking-tighter ${isPassed ? 'text-blue-600' : 'text-red-500'}`}>
                          {submission.marks_obtained}
                        </span>
                        <span className="text-sm font-black text-gray-300">/ {submission.tests.total_marks}</span>
                      </div>
                    </div>
                    <Link href={`/student/results/${submission.id}`}>
                      <button className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 active:scale-90">
                        <ArrowRight size={20} />
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col items-end">
                    <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">Assessment</div>
                    <div className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-black italic border border-amber-100/50">
                      Under Review
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {submissions.length === 0 && (
          <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Trophy size={40} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No Results Yet</h3>
            <p className="text-gray-500 font-medium max-w-xs mx-auto mb-8">Once you complete an exam, your detailed performance reports will appear here.</p>
            <Link href="/student/dashboard">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:translate-y-0">
                Browse Available Exams
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
