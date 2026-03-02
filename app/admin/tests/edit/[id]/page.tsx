'use client'

import { useState, useEffect, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Save, ArrowLeft, AlertCircle, Trophy } from 'lucide-react'
import Link from 'next/link'

type QuestionType = 'mcq' | 'textarea' | 'checkbox' | 'true_false'

interface Option {
  id: string
  option_text: string
  is_correct: boolean
}

interface Question {
  id: string
  question_text: string
  question_type: QuestionType
  marks: number
  options: Option[]
}

export default function EditTestPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const testId = resolvedParams.id
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const questionRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})

  const [testData, setTestData] = useState({
    title: '',
    description: '',
    duration: 60,
    total_marks: 100,
    instructions: ''
  })

  const [questions, setQuestions] = useState<Question[]>([])

  const currentTotalMarks = questions.reduce((acc, q) => acc + (q.marks || 0), 0)

  useEffect(() => {
    async function fetchTest() {
      try {
        const res = await fetch(`/api/admin/tests/${testId}`)
        if (res.ok) {
          const data = await res.json()
          setTestData({
            title: data.title,
            description: data.description || '',
            duration: data.duration,
            total_marks: data.total_marks,
            instructions: data.instructions || ''
          })
          setQuestions(data.questions)
        } else {
          router.push('/admin/tests')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchTest()
  }, [testId, router])

  const validateLastQuestion = () => {
    const lastQuestion = questions[questions.length - 1]
    if (!lastQuestion) return true

    let errorMessage = null

    if (!lastQuestion.question_text.trim()) {
      errorMessage = `Question ${questions.length} text is missing!`
      questionRefs.current[lastQuestion.id]?.focus()
    } else if (['mcq', 'checkbox', 'true_false'].includes(lastQuestion.question_type)) {
      const hasCorrect = lastQuestion.options.some(o => o.is_correct)
      if (!hasCorrect) {
        errorMessage = `Please select a correct answer for Question ${questions.length}`
      } else {
        const allOptionsFilled = lastQuestion.options.every(o => o.option_text.trim())
        if (!allOptionsFilled) {
          errorMessage = `Please fill all options for Question ${questions.length}`
        }
      }
    }

    if (errorMessage) {
      setError(errorMessage)
      // Auto hide error after 3 seconds
      setTimeout(() => setError(null), 3000)
      return false
    }

    setError(null)
    return true
  }

  const addQuestion = () => {
    if (!validateLastQuestion()) return

    const newId = crypto.randomUUID()
    setQuestions([...questions, {
      id: newId,
      question_text: '',
      question_type: 'mcq',
      marks: 1,
      options: [
        { id: crypto.randomUUID(), option_text: '', is_correct: false },
        { id: crypto.randomUUID(), option_text: '', is_correct: false }
      ]
    }])

    // Auto focus new question after state update
    setTimeout(() => {
      questionRefs.current[newId]?.focus()
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      })
    }, 100)
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        const updated = { ...q, ...updates }
        // If switching to True/False, ensure options are set to True and False
        if (updates.question_type === 'true_false') {
          updated.options = [
            { id: crypto.randomUUID(), option_text: 'True', is_correct: false },
            { id: crypto.randomUUID(), option_text: 'False', is_correct: false }
          ]
        } else if (updates.question_type === 'mcq' && q.question_type === 'true_false') {
          // If switching back from true_false to mcq, reset to empty options
          updated.options = [
            { id: crypto.randomUUID(), option_text: '', is_correct: false },
            { id: crypto.randomUUID(), option_text: '', is_correct: false }
          ]
        }
        return updated
      }
      return q
    }))
  }

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: [...q.options, { id: crypto.randomUUID(), option_text: '', is_correct: false }]
        }
      }
      return q
    }))
  }

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.filter(o => o.id !== optionId)
        }
      }
      return q
    }))
  }

  const updateOption = (questionId: string, optionId: string, updates: Partial<Option>) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.map(o => {
            if (o.id === optionId) {
              if ((q.question_type === 'mcq' || q.question_type === 'true_false') && updates.is_correct) {
                return { ...o, ...updates }
              }
              return { ...o, ...updates }
            }
            if ((q.question_type === 'mcq' || q.question_type === 'true_false') && updates.is_correct) {
              return { ...o, is_correct: false }
            }
            return o
          })
        }
      }
      return q
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate Total Marks match
    if (currentTotalMarks !== testData.total_marks) {
      setError(`Total marks mismatch! Test needs ${testData.total_marks} marks, but you have assigned ${currentTotalMarks}.`)
      setTimeout(() => setError(null), 5000)
      return
    }

    if (!validateLastQuestion()) return

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/tests/${testId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...testData, questions })
      })
      if (res.ok) {
        router.push('/admin/tests')
        router.refresh()
      } else {
        const error = await res.json()
        alert(error.message || 'Failed to update test')
      }
    } catch (err) {
      console.error(err)
      alert('An error occurred while updating the test')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8">Loading test details...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      {/* Error Popup */}
      {error && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in zoom-in slide-in-from-top-4 duration-300">
          <div className="bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-red-500/20 backdrop-blur-md">
            <AlertCircle size={20} className="animate-pulse" />
            <span className="font-bold tracking-wide">{error}</span>
            <button onClick={() => setError(null)} className="ml-2 hover:bg-white/20 p-1 rounded-full transition-colors">
              <Plus size={16} className="rotate-45" />
            </button>
          </div>
        </div>
      )}

      {/* Fixed Controls Header */}
      <div className="fixed top-0 right-0 left-64 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-8 py-4 shadow-sm flex justify-between items-center transition-all">
        <div className="flex items-center gap-6">
          <Link href="/admin/tests" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-xl font-black text-gray-800 tracking-tight">Edit Test</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className={`flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${currentTotalMarks === testData.total_marks ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                <Trophy size={10} />
                Marks: {currentTotalMarks} / {testData.total_marks}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center gap-2 bg-white text-blue-600 px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-all font-bold border-2 border-blue-100 shadow-sm active:scale-95"
          >
            <Plus size={20} />
            Add Question
          </button>
          <button
            onClick={(e) => {
              const form = document.querySelector('form')
              if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
            }}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded-xl hover:bg-blue-700 transition-all font-bold disabled:opacity-50 shadow-lg shadow-blue-200 active:scale-95"
          >
            <Save size={20} />
            {saving ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-16"></div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-4">Test Details</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Test Title</label>
              <input
                required
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={testData.title}
                onChange={e => setTestData({ ...testData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={testData.description}
                onChange={e => setTestData({ ...testData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Duration (Minutes)</label>
                <input
                  required
                  type="number"
                  min="1"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={testData.duration}
                  onChange={e => setTestData({ ...testData, duration: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Total Marks</label>
                <input
                  required
                  type="number"
                  min="1"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={testData.total_marks}
                  onChange={e => setTestData({ ...testData, total_marks: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-semibold"
            >
              <Plus size={20} />
              Add Question
            </button>
          </div>

          {questions.map((question, qIndex) => (
            <div key={question.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
                <span className="text-sm font-bold text-gray-500">QUESTION {qIndex + 1}</span>
                <button
                  type="button"
                  onClick={() => removeQuestion(question.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Question Text</label>
                    <textarea
                      required
                      ref={el => { questionRefs.current[question.id] = el }}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={question.question_text}
                      onChange={e => updateQuestion(question.id, { question_text: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={question.question_type}
                      onChange={e => updateQuestion(question.id, { question_type: e.target.value as QuestionType })}
                    >
                      <option value="mcq">MCQ (Single Choice)</option>
                      <option value="checkbox">Checkbox (Multi Choice)</option>
                      <option value="textarea">Textarea (Essay)</option>
                      <option value="true_false">True / False</option>
                    </select>
                  </div>
                </div>

                {(question.question_type === 'mcq' || question.question_type === 'checkbox' || question.question_type === 'true_false') && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-gray-700">Options</label>
                      {question.question_type !== 'true_false' && (
                        <button
                          type="button"
                          onClick={() => addOption(question.id)}
                          className="text-sm text-blue-600 font-semibold hover:underline"
                        >
                          + Add Option
                        </button>
                      )}
                    </div>
                    <div className="grid gap-3">
                      {question.options.map((option) => (
                        <div key={option.id} className="flex items-center gap-4">
                          <input
                            type={question.question_type === 'mcq' || question.question_type === 'true_false' ? 'radio' : 'checkbox'}
                            name={`correct-${question.id}`}
                            checked={option.is_correct}
                            onChange={e => updateOption(question.id, option.id, { is_correct: e.target.checked })}
                            className="w-5 h-5 text-blue-600 rounded-full border-gray-300 focus:ring-blue-500"
                          />
                          <input
                            required
                            disabled={question.question_type === 'true_false'}
                            type="text"
                            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={option.option_text}
                            onChange={e => updateOption(question.id, option.id, { option_text: e.target.value })}
                          />
                          {question.question_type !== 'true_false' && (
                            <button
                              type="button"
                              onClick={() => removeOption(question.id, option.id)}
                              className="text-gray-300 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {question.question_type === 'textarea' && (
                  <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center">
                    <p className="text-sm text-gray-500 italic">Students will be provided with a text area to type their answer.</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Marks</label>
                  <input
                    required
                    type="number"
                    min="1"
                    className="w-32 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={question.marks}
                    onChange={e => updateQuestion(question.id, { marks: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          ))}
        </section>

        <div className="flex justify-end gap-4 border-t pt-8">
          <Link
            href="/admin/tests"
            className="px-6 py-2 border border-gray-200 rounded-lg text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition-colors font-bold disabled:opacity-50 shadow-lg shadow-blue-200"
          >
            <Save size={20} />
            {saving ? 'Updating...' : 'Update Test'}
          </button>
        </div>
      </form>
    </div>
  )
}
