'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Send, AlertTriangle, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react'

import { use } from 'react'

export default function TestTakingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const testId = resolvedParams.id
  const [test, setTest] = useState<any>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchTest() {
      try {
        const res = await fetch(`/api/student/tests/${testId}`)
        if (res.ok) {
          const data = await res.json()
          setTest(data)
          setTimeLeft(data.duration * 60)
        } else {
          router.push('/student/dashboard')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchTest()
  }, [testId, router])

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0) handleSubmit()
      return
    }
    const timer = setInterval(() => setTimeLeft(prev => (prev !== null ? prev - 1 : null)), 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/student/tests/${testId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      })
      if (res.ok) {
        router.push('/student/dashboard?submitted=true')
      } else {
        alert('Failed to submit test')
      }
    } catch (err) {
      console.error(err)
      alert('An error occurred during submission')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading test...</div>
  if (!test) return null

  const currentQuestion = test.questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{test.title}</h1>
            <p className="text-sm text-gray-500">{test.questions.length} Questions</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold ${timeLeft !== null && timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-600'}`}>
            <Clock size={20} />
            {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
          </div>
          <button
            onClick={() => { if (confirm('Are you sure you want to submit?')) handleSubmit() }}
            disabled={submitting}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-bold disabled:opacity-50"
          >
            <Send size={18} />
            {submitting ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Question Navigator */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Questions</h3>
              <div className="grid grid-cols-4 gap-2">
                {test.questions.map((_: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                      currentQuestionIndex === idx
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : answers[test.questions[idx].id]
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'
                    } border`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 text-amber-700">
              <AlertTriangle size={20} className="shrink-0" />
              <p className="text-xs leading-relaxed">
                Do not refresh the page. Your progress will be lost if you leave.
              </p>
            </div>
          </div>

          {/* Question Display */}
          <div className="md:col-span-3 space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm min-h-[400px] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">
                    Question {currentQuestionIndex + 1}
                  </span>
                  <span className="text-sm text-gray-400">{currentQuestion.marks} Marks</span>
                </div>
                
                <h2 className="text-xl font-medium text-gray-800 mb-8 whitespace-pre-wrap">
                  {currentQuestion.question_text}
                </h2>

                <div className="space-y-4">
                  {currentQuestion.question_type === 'mcq' || currentQuestion.question_type === 'true_false' ? (
                    currentQuestion.options.map((option: any) => (
                      <label key={option.id} className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all hover:border-blue-200 ${answers[currentQuestion.id] === option.id ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-gray-100'}`}>
                        <input
                          type="radio"
                          name={`q-${currentQuestion.id}`}
                          checked={answers[currentQuestion.id] === option.id}
                          onChange={() => handleAnswerChange(currentQuestion.id, option.id)}
                          className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-gray-700 font-medium">{option.option_text}</span>
                      </label>
                    ))
                  ) : currentQuestion.question_type === 'checkbox' ? (
                    currentQuestion.options.map((option: any) => (
                      <label key={option.id} className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all hover:border-blue-200 ${answers[currentQuestion.id]?.includes(option.id) ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-gray-100'}`}>
                        <input
                          type="checkbox"
                          checked={answers[currentQuestion.id]?.includes(option.id)}
                          onChange={(e) => {
                            const current = answers[currentQuestion.id] || []
                            if (e.target.checked) {
                              handleAnswerChange(currentQuestion.id, [...current, option.id])
                            } else {
                              handleAnswerChange(currentQuestion.id, current.filter((id: string) => id !== option.id))
                            }
                          }}
                          className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-gray-700 font-medium">{option.option_text}</span>
                      </label>
                    ))
                  ) : (
                    <textarea
                      rows={6}
                      placeholder="Type your answer here..."
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-8 border-t mt-12">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 font-semibold"
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>
                <button
                  disabled={currentQuestionIndex === test.questions.length - 1}
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-30 font-bold"
                >
                  Next Question
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
