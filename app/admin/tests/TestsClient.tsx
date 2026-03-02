'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, FileText, Clock, Trophy, Trash2, Edit, Search, X, Power, PowerOff, CheckCircle2, XCircle } from 'lucide-react'

export default function AdminTestsPage({ tests }: { tests: any[] }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const filteredTests = tests.filter(test => 
    test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (test.description && test.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    setUpdatingId(id)
    try {
      const res = await fetch('/api/admin/tests/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !currentStatus })
      })
      if (res.ok) {
        router.refresh()
      } else {
        alert('Failed to update status')
      }
    } catch (err) {
      console.error(err)
      alert('An error occurred')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this test? This action cannot be undone.')) return

    try {
      const res = await fetch(`/api/admin/tests/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      } else {
        alert('Failed to delete test')
      }
    } catch (err) {
      console.error(err)
      alert('An error occurred while deleting the test')
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Manage Tests</h2>
          <p className="text-gray-500 font-medium mt-1">Create, update and manage your assessments.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-72 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search by title or description..."
              className="w-full pl-12 pr-10 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all text-sm font-medium shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <Link
            href="/admin/tests/new"
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-2xl hover:bg-blue-700 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 w-full sm:w-auto active:scale-95"
          >
            <Plus size={18} />
            New Test
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTests.map((test) => (
          <div key={test.id} className={`group relative bg-white rounded-[2.5rem] border transition-all duration-300 flex flex-col h-full ${
            !test.is_active 
              ? 'border-red-50 bg-gray-50/30' 
              : 'border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1'
          }`}>
            <div className="p-8 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl shadow-sm ${
                  test.is_active ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-red-500 text-white shadow-red-200 opacity-60'
                }`}>
                  <FileText size={24} />
                </div>
                <div className="flex gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100/50">
                  <button
                    onClick={() => toggleStatus(test.id, test.is_active)}
                    disabled={updatingId === test.id}
                    className={`p-2 rounded-lg transition-all ${
                      test.is_active 
                        ? 'text-green-600 hover:bg-green-100/50' 
                        : 'text-red-500 hover:bg-red-100/50'
                    }`}
                    title={test.is_active ? 'Make Inactive' : 'Make Active'}
                  >
                    {updatingId === test.id ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                    ) : test.is_active ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <XCircle size={18} />
                    )}
                  </button>
                  <Link 
                    href={`/admin/tests/edit/${test.id}`}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                  >
                    <Edit size={18} />
                  </Link>
                  <button 
                    onClick={() => handleDelete(test.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">{test.title}</h3>
                  {!test.is_active && (
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-red-100 text-red-600 rounded-lg">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 font-medium line-clamp-2 leading-relaxed">
                  {test.description || 'No description provided for this assessment.'}
                </p>
              </div>

              <div className="mt-auto pt-6 border-t border-gray-50 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    <Clock size={14} />
                  </div>
                  <span className="text-xs font-black text-gray-700 tracking-tight">{test.duration} Mins</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    <Trophy size={14} />
                  </div>
                  <span className="text-xs font-black text-gray-700 tracking-tight">{test.total_marks} Marks</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredTests.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Search size={40} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No Matches Found</h3>
            <p className="text-gray-500 font-medium max-w-xs mx-auto">Try adjusting your search query or create a new test instead.</p>
          </div>
        )}
      </div>
    </div>
  )
}
