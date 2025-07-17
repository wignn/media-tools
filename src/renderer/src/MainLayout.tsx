import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { TopNavigation } from './components/TopNavigation'
import { Outlet } from 'react-router-dom'
import { useTheme } from './contexts/theme-context'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { isDarkMode } = useTheme()

  return (
    <div className={`h-screen bg-gradient-to-br flex overflow-hidden ${isDarkMode ? 'bg-gray-800/80 border-gray-700/40 shadow-gray-900/20' : 'from-indigo-50 via-white to-purple-50'}`}>
      <Sidebar isOpen={sidebarOpen} />

      <div className="flex-1 flex flex-col">
        <TopNavigation
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-auto">
          <div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
