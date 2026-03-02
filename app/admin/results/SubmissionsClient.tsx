'use client'

import { useState } from 'react'
import { CheckCircle2, FileText, User, Calendar, Trophy, ArrowRight, Search, X } from 'lucide-react'
import Link from 'next/link'

export default function SubmissionsClient({ submissions }: { submissions: any[] }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSubmissions = submissions.filter(sub => 
    sub.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.tests?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Exam Submissions</h2>
          <p className="text-gray-500 font-medium mt-1">Monitor and review student performances in real-time.</p>
        </div>
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search by student, email or test..."
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
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Student</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Test Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Performance</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Submission Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSubmissions?.map((sub) => (
                <tr key={sub.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-lg shadow-blue-100">
                        {sub.profiles?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors">{sub.profiles?.name}</p>
                        <p className="text-[11px] text-gray-400 font-bold">{sub.profiles?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-white transition-colors">
                        <FileText size={16} />
                      </div>
                      <span className="text-sm font-bold text-gray-700">{sub.tests?.title}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl group-hover:bg-white transition-colors ${
                        (sub.marks_obtained / sub.tests?.total_marks) >= 0.4 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                      }`}>
                        <Trophy size={16} />
                      </div>
                      <div>
                        <span className="text-sm font-black text-gray-900">{sub.marks_obtained}</span>
                        <span className="text-[11px] font-bold text-gray-300 ml-1">/ {sub.tests?.total_marks}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                      <Calendar size={14} className="text-gray-300" />
                      {new Date(sub.submitted_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <Link 
                      href={`/admin/results/review/${sub.id}`}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 group-hover:scale-110"
                    >
                      <ArrowRight size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
              {(!filteredSubmissions || filteredSubmissions.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Search size={40} className="text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">
                      {searchQuery ? `No submissions found matching "${searchQuery}"` : 'No exam submissions yet.'}
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
