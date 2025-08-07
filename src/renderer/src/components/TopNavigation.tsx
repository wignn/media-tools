'use client'

import { Menu, X } from 'lucide-react'
import { useTheme } from '../contexts/theme-context'
interface TopNavigationProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function TopNavigation({ sidebarOpen, onToggleSidebar }: TopNavigationProps) {
  const { isDarkMode } = useTheme()

  return (
    <header
      className={`h-18 backdrop-blur-xl border-b shadow-sm flex items-center justify-between px-8 py-4 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900/80 border-gray-700/40' : 'bg-white/80 border-slate-200/40'
      }`}
    >
      <div className="flex items-center gap-6">
        <button
          onClick={onToggleSidebar}
          className={`p-3 rounded-xl transition-all duration-200 hover:shadow-md ${
            isDarkMode
              ? 'hover:bg-gray-800 text-gray-300 hover:text-white'
              : 'hover:bg-indigo-50 text-slate-600 hover:text-slate-800'
          }`}
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Media Tool
          </h2>
        </div>
      </div>
    </header>
  )
}
