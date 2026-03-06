 'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Save, ArrowLeft, Plus } from 'lucide-react'

type Installment = { amount: string; due_date: string }

export default function EditFeePage() {
  const router = useRouter()
  const { id } = useParams() as { id?: string }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [student_email, setStudentEmail] = useState('')
  const [course_name, setCourseName] = useState('')
  const [course_fee, setCourseFee] = useState('')
  const [course_timing_start, setStart] = useState('09:00')
  const [duration_minutes, setDuration] = useState(60)
  const [course_start_date, setStartDate] = useState('')
  const [course_end_date, setEndDate] = useState('')
  const [total_amount, setTotal] = useState('')
  const [reference_type, setRefType] = useState<'by' | 'to'>('by')
  const [reference_value, setRefVal] = useState('')
  const [installments, setInst] = useState<Installment[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        if (!id) return
        const res = await fetch(`/api/admin/fees/${id}`, { cache: 'no-store' })
        if (!res.ok) throw new Error(await res.text())
        const f = await res.json()
        if (!mounted) return
        setStudentEmail(f.profiles?.email || '')
        setCourseName(f.course_name || '')
        setCourseFee(String(f.course_fee || ''))
        setStart(f.course_timing_start || '09:00')
        setDuration(f.duration_minutes || 60)
        setStartDate(f.course_start_date?.slice(0,10) || '')
        setEndDate(f.course_end_date?.slice(0,10) || '')
        setTotal(String(f.total_amount || ''))
        setRefType((f.reference_type as any) || 'by')
        setRefVal(f.reference_value || '')
        setInst((f.installments || []).map((i:any)=>({ amount: String(i.amount), due_date: i.due_date?.slice(0,10) })))
      } catch (e:any) {
        setError(e?.message || 'Failed to load fee')
      } finally {
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id])

  const addInst = () => setInst([...installments, { amount: '', due_date: '' }])
  const removeInst = (idx: number) => setInst(installments.filter((_, i) => i !== idx))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (!id) throw new Error('Missing ID')
      const res = await fetch(`/api/admin/fees/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_email,
          course_name,
          course_fee,
          course_timing_start,
          duration_minutes,
          course_start_date,
          course_end_date,
          total_amount,
          reference_type,
          reference_value,
          installments: installments.filter(i => i.amount && i.due_date),
        })
      })
      if (!res.ok) throw new Error(await res.text())
      router.push('/admin/fees')
    } catch (err:any) {
      setError(err?.message || 'Failed to update fee')
    } finally {
      setLoading(false)
    }
  }

  const endLabel = (() => {
    const [h, m] = course_timing_start.split(':').map(Number)
    const start = new Date()
    start.setHours(h, m, 0, 0)
    const end = new Date(start.getTime() + duration_minutes * 60 * 1000)
    return `${course_timing_start} — ${String(end.getHours()).padStart(2,'0')}:${String(end.getMinutes()).padStart(2,'0')}`
  })()

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/admin/fees" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold text-sm">
          <ArrowLeft size={18} /> Back
        </Link>
        <button
          onClick={(e)=>{const f=document.getElementById('feeEditForm') as HTMLFormElement; f?.requestSubmit()}}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          <Save size={16} />
          Update Fee
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-700 border border-red-100 p-3 rounded-xl font-bold text-sm">{error}</div>}

      <form id="feeEditForm" onSubmit={onSubmit} className="space-y-8">
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-4">Course Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Course Name</label>
              <input className="mt-2 w-full border border-gray-100 rounded-xl px-4 py-3 text-sm" value={course_name} onChange={e=>setCourseName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Course Fee (₹)</label>
              <input type="number" className="mt-2 w-full border border-gray-100 rounded-xl px-4 py-3 text-sm" value={course_fee} onChange={e=>setCourseFee(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Timing Start (HH:MM)</label>
              <input type="time" className="mt-2 w-full border border-gray-100 rounded-xl px-4 py-3 text-sm" value={course_timing_start} onChange={e=>setStart(e.target.value)} />
              <p className="text-[11px] text-gray-400 font-bold mt-1">Duration {duration_minutes} mins • {endLabel}</p>
            </div>
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Duration (mins)</label>
              <input type="number" className="mt-2 w-full border border-gray-100 rounded-xl px-4 py-3 text-sm" value={duration_minutes} onChange={e=>setDuration(parseInt(e.target.value || '60'))} />
            </div>
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Course Start Date</label>
              <input type="date" className="mt-2 w-full border border-gray-100 rounded-xl px-4 py-3 text-sm" value={course_start_date} onChange={e=>setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Course End Date</label>
              <input type="date" className="mt-2 w-full border border-gray-100 rounded-xl px-4 py-3 text-sm" value={course_end_date} onChange={e=>setEndDate(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-4">Student & Payment</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Student Email</label>
              <input className="mt-2 w-full border border-gray-100 rounded-xl px-4 py-3 text-sm" value={student_email} onChange={e=>setStudentEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Total Amount (₹)</label>
              <input type="number" className="mt-2 w-full border border-gray-100 rounded-xl px-4 py-3 text-sm" value={total_amount} onChange={e=>setTotal(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Reference Type</label>
              <select className="mt-2 w-full border border-gray-100 rounded-xl px-4 py-3 text-sm" value={reference_type} onChange={e=>setRefType(e.target.value as any)}>
                <option value="by">Reference By</option>
                <option value="to">Reference To</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Reference Value</label>
              <input className="mt-2 w-full border border-gray-100 rounded-xl px-4 py-3 text-sm" value={reference_value} onChange={e=>setRefVal(e.target.value)} />
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-gray-700">Installments</h4>
              <button type="button" onClick={addInst} className="inline-flex items-center gap-2 text-blue-600 font-black text-xs">
                <Plus size={16} /> Add Installment
              </button>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-6">
              {installments.map((inst, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-3 items-end">
                  <div className="col-span-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Amount (₹)</label>
                    <input type="number" className="mt-2 w-full border border-gray-100 rounded-xl px-4 py-3 text-sm" value={inst.amount} onChange={e=>{
                      const copy = [...installments]; copy[idx].amount = e.target.value; setInst(copy)
                    }} />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Due Date</label>
                    <input type="date" className="mt-2 w-full border border-gray-100 rounded-xl px-3 py-3 text-sm" value={inst.due_date} onChange={e=>{
                      const copy = [...installments]; copy[idx].due_date = e.target.value; setInst(copy)
                    }} />
                  </div>
                  <button type="button" onClick={()=>removeInst(idx)} className="text-xs font-black text-red-600">Remove</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
