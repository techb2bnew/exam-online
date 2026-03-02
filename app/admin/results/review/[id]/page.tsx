'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, XCircle, Clock, Trophy, User, Mail, HelpCircle, Save } from 'lucide-react'
import Link from 'next/link'

export default function ReviewSubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [submission, setSubmission] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [manualMarks, setManualMarks] = useState<number>(0)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function fetchSubmission() {
      try {
        const res = await fetch(`/api/admin/submissions?id=${id}`)
        if (res.ok) {
          const data = await res.json()
          setSubmission(data)
          setManualMarks(data.marks_obtained)
        } else {
          router.push('/admin/results')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSubmission()
  }, [id, router])

  const handleUpdateMarks = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/submissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, marks_obtained: manualMarks })
      })
      if (res.ok) {
        alert('Marks updated successfully!')
        router.refresh()
      } else {
        alert('Failed to update marks')
      }
    } catch (err) {
      console.error(err)
      alert('Error updating marks')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading submission details...</div>
  if (!submission) return null

  const studentAnswers = submission.answers as Record<string, any>

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/results" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Review Submission</h1>
            <p className="text-sm text-gray-500">Submitted on {new Date(submission.submitted_at).toLocaleString()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Update Marks Manually</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={manualMarks}
                onChange={(e) => setManualMarks(parseInt(e.target.value))}
                className="w-20 px-3 py-2 border border-gray-200 rounded-xl text-lg font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button 
                onClick={handleUpdateMarks}
                disabled={isSaving}
                className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                title="Save Marks"
              >
                <Save size={20} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100">
            <Trophy className="text-blue-600" size={24} />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Current Score</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-blue-700">{submission.marks_obtained}</span>
                <span className="text-sm font-bold text-blue-400">/ {submission.tests.total_marks}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student & Test Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Student Info</h3>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                {submission.profiles.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-gray-800 truncate">{submission.profiles.name}</p>
                <p className="text-xs text-gray-500 truncate">{submission.profiles.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Test Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Title</span>
                <span className="font-bold text-gray-800">{submission.tests.title}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Duration</span>
                <span className="font-bold text-gray-800">{submission.tests.duration} mins</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Questions</span>
                <span className="font-bold text-gray-800">{submission.tests.questions.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Question Review List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-gray-800">Answer Review</h2>
          {submission.tests.questions.map((question: any, idx: number) => {
            const answer = studentAnswers[question.id]
            const isCorrect = question.question_type === 'mcq' || question.question_type === 'true_false' 
              ? question.options.find((o: any) => o.is_correct)?.id === answer
              : question.question_type === 'checkbox'
                ? Array.isArray(answer) && 
                  answer.length === question.options.filter((o: any) => o.is_correct).length &&
                  answer.every((id: string) => question.options.find((o: any) => o.id === id)?.is_correct)
                : null

            return (
              <div key={question.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Question {idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{question.marks} Marks</span>
                    {isCorrect !== null && (
                      isCorrect 
                        ? <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full"><CheckCircle2 size={12}/> Correct</span>
                        : <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full"><XCircle size={12}/> Incorrect</span>
                    )}
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <p className="font-medium text-gray-800">{question.question_text}</p>
                  
                  {question.question_type === 'textarea' ? (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 italic text-gray-600 text-sm whitespace-pre-wrap">
                      {answer || 'No answer provided.'}
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {question.options.map((opt: any) => {
                        const isStudentChoice = Array.isArray(answer) ? answer.includes(opt.id) : answer === opt.id
                        return (
                          <div 
                            key={opt.id} 
                            className={`flex items-center justify-between p-3 rounded-xl border text-sm ${
                              opt.is_correct 
                                ? 'bg-green-50 border-green-100 text-green-700 font-bold' 
                                : isStudentChoice 
                                  ? 'bg-red-50 border-red-100 text-red-700 font-bold'
                                  : 'border-gray-50 text-gray-500'
                            }`}
                          >
                            <span>{opt.option_text}</span>
                            {isStudentChoice && <span className="text-[8px] uppercase tracking-widest bg-white/50 px-2 py-0.5 rounded-full">Student's Choice</span>}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
