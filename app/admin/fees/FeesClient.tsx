 'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Search, Plus, IndianRupee, CalendarDays, User, Edit, Trash2 } from 'lucide-react'

export default function FeesClient() {
  const [searchQuery, setSearch] = useState('')
  const [fees, setFees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/admin/fees', { cache: 'no-store' })
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        if (mounted) setFees(data || [])
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load fees')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const filtered = fees.filter((f: any) => {
    const s = (f.profiles?.name || '') + (f.profiles?.email || '') + f.course_name
    return s.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Student Fee</h2>
          <p className="text-gray-500 font-medium mt-1">Manage course fees and installments.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-72 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search by student or course..."
              className="w-full pl-12 pr-10 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all text-sm font-medium shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link
            href="/admin/fees/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
          >
            <Plus size={16} />
            Add Fee
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        {loading && (
          <div className="p-8 text-center text-gray-500 font-medium">Loading fees...</div>
        )}
        {error && (
          <div className="p-4 text-red-700 bg-red-50 border border-red-100 rounded-xl font-bold text-sm">{error}</div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="text-left">
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Course</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timing</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Created</th>
                <th className="px-8 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((f: any) => (
                <tr key={f.id} className="hover:bg-gray-50/50">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold shadow-sm">
                        {(f.profiles?.name || 'S').charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">{f.profiles?.name}</p>
                        <p className="text-xs text-gray-400 font-bold">{f.profiles?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-gray-900">{f.course_name}</p>
                    <p className="text-xs text-gray-400 font-bold">Fee: ₹{f.course_fee}</p>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-gray-700">
                    {f.course_timing_start} - {f.course_timing_end}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-blue-600 font-black">
                      <IndianRupee size={16} />
                      {f.total_amount}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs text-gray-400 font-bold">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} />
                      {new Date(f.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/admin/fees/${f.id}`}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-200 transition-all duration-300"
                        title="View"
                      >
                        <User size={18} />
                      </Link>
                      <Link
                        href={`/admin/fees/edit/${f.id}`}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-orange-600 hover:text-white transition-all duration-300"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-600 hover:text-white transition-all duration-300"
                        title="Delete"
                        onClick={async () => {
                          if (!confirm('Delete this fee record?')) return
                          const res = await fetch(`/api/admin/fees/${f.id}`, { method: 'DELETE' })
                          if (res.ok) {
                            setFees(prev => prev.filter(x => x.id !== f.id))
                          } else {
                            const t = await res.text()
                            alert(t)
                          }
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!filtered || filtered.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Search size={40} className="text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">
                      {searchQuery ? `No fees found matching "${searchQuery}"` : 'No fee records yet.'}
                    </p>
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
