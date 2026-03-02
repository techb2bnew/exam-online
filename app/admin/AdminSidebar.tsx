'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Users, LogOut, CheckCircle, GraduationCap, ChevronRight } from 'lucide-react'

export default function AdminSidebar() {
  const pathname = usePathname()

  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Manage Tests',
      href: '/admin/tests',
      icon: FileText,
    },
    {
      label: 'Submissions',
      href: '/admin/results',
      icon: CheckCircle,
    },
    {
      label: 'Students',
      href: '/admin/students',
      icon: Users,
    },
  ]

  return (
    <aside className="w-72 bg-white border-r border-gray-100 flex-shrink-0 flex flex-col h-full shadow-sm">
      {/* Brand Section */}
      <div className="p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-black text-gray-900 tracking-tight">ExamPortal</span>
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Admin Panel</p>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between group px-4 py-3 rounded-2xl transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600 transition-colors'} />
                <span className="font-bold text-sm tracking-wide">{item.label}</span>
              </div>
              {isActive && <ChevronRight size={16} className="text-white/70" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer / Logout Section */}
      <div className="p-4 mt-auto border-t border-gray-50 bg-gray-50/50">
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-200 font-bold text-sm group"
          >
            <LogOut size={20} className="text-gray-400 group-hover:text-red-600 transition-colors" />
            <span>Logout Account</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
