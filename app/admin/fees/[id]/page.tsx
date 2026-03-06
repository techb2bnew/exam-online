 'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, IndianRupee, CalendarDays } from 'lucide-react'

export default function FeeDetailPage() {
  const { id } = useParams() as { id?: string }
  const [fee, setFee] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!id) return
      try {
        const res = await fetch(`/api/admin/fees/${id}`, { cache: 'no-store' })
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        if (mounted) setFee(data)
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load fee')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }
  if (error || !fee) {
    return (
      <div className="space-y-6">
        <Link href="/admin/fees" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold text-sm">
          <ArrowLeft size={18} /> Back
        </Link>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">{error || 'Fee record not found.'}</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/admin/fees" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold text-sm">
          <ArrowLeft size={18} /> Back
        </Link>
        <h2 className="text-2xl font-black text-gray-900">Fee Detail</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-4">Student</h3>
          <p className="text-lg font-black text-gray-900">{fee.profiles?.name}</p>
          <p className="text-sm font-bold text-gray-500">{fee.profiles?.email}</p>

          <div className="grid grid-cols-2 gap-6 mt-6">
            <div>
              <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Course</h4>
              <p className="text-sm font-bold text-gray-800 mt-1">{fee.course_name}</p>
              <p className="text-xs text-gray-400 font-bold">Timing: {fee.course_timing_start} - {fee.course_timing_end}</p>
            </div>
            <div>
              <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Schedule</h4>
              <p className="text-xs text-gray-400 font-bold flex items-center gap-2">
                <CalendarDays size={14} /> {new Date(fee.course_start_date).toLocaleDateString()} → {new Date(fee.course_end_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-4">Payment Summary</h3>
          <div className="flex items-center gap-2 text-blue-600 font-black text-xl">
            <IndianRupee size={20} /> {fee.total_amount}
          </div>
          <p className="text-xs text-gray-400 font-bold mt-2">Course Fee: ₹{fee.course_fee}</p>
          <p className="text-xs text-gray-400 font-bold">Reference: {fee.reference_type} {fee.reference_value || '-'}</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-4">Installments</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="text-left">
                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(fee.installments || []).map((i: any) => (
                <tr key={i.id}>
                  <td className="px-6 py-4 font-black text-gray-800">₹{i.amount}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-600">{new Date(i.due_date).toLocaleDateString()}</td>
                </tr>
              ))}
              {(fee.installments || []).length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-gray-500 font-medium">
                    No installments
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
