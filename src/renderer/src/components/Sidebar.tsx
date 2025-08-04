"use client"
import logo from '../assets/logo.png'
import { Download, Settings, Home, HelpCircle, RefreshCw, Scissors } from "lucide-react"
import { useEffect, useState } from "react"
import { NavLink } from "react-router-dom"
import { useTheme } from "../contexts/theme-context"
import { useDownloadHistoryStore } from "../store/downloadHistoryStore"

interface SidebarProps {
  isOpen: boolean
}

export function Sidebar({ isOpen }: SidebarProps) {
  const [diskSpace, setDiskSpace] = useState<{ total: number; free: number }>({ total: 0, free: 0 })
  const { isDarkMode, toggleTheme } = useTheme()
  const { logs } = useDownloadHistoryStore()
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme")
    if (storedTheme === "dark") {
      toggleTheme()
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "theme") {
        toggleTheme()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    window.api?.getDiskSpace().then(setDiskSpace).catch(console.error)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  if (!isOpen) return null

  return (
    <aside
      className={`w-64 backdrop-blur-xl border-r shadow-2xl flex flex-col transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-b from-gray-900/95 to-gray-800/95 border-gray-700/50"
          : "bg-gradient-to-b from-indigo-50/90 to-purple-50/90 border-indigo-200/30"
      }`}
      
    >
      <div
        className={`p-6 border-b transition-colors duration-300 ${
          isDarkMode ? "border-gray-700/50" : "border-indigo-200/30"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br  rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200/50">
            <img
              src={logo}
              alt="Logo"
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
          <div>
            <h1
              className={`text-lg font-bold transition-colors duration-300 ${
                isDarkMode ? "text-white" : "text-slate-800"
              }`}
            >
              wign
            </h1>
            <p
              className={`text-xs font-medium transition-colors duration-300 ${
                isDarkMode ? "text-indigo-400" : "text-indigo-600"
              }`}
            >
              Media Tool
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-8">
        <div>
          <h3
            className={`text-xs font-bold uppercase tracking-wider mb-4 transition-colors duration-300 ${
              isDarkMode ? "text-gray-400" : "text-slate-600"
            }`}
          >
            Main Menu
          </h3>
<nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? isDarkMode
                      ? "bg-gradient-to-r from-indigo-900/50 to-purple-900/50 text-indigo-300 border border-indigo-700/50 shadow"
                      : "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200/50 shadow"
                    : isDarkMode
                      ? "text-gray-300 hover:bg-gray-800/60 hover:text-indigo-400"
                      : "text-slate-600 hover:bg-white/60 hover:text-indigo-600"
                }`
              }
            >
              <Home className="w-5 h-5" />
              <span className="font-semibold">Dashboard</span>
            </NavLink>
            <NavLink
              to="/download"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? isDarkMode
                      ? "bg-gradient-to-r from-indigo-900/50 to-purple-900/50 text-indigo-300 border border-indigo-700/50 shadow"
                      : "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200/50 shadow"
                    : isDarkMode
                      ? "text-gray-300 hover:bg-gray-800/60 hover:text-indigo-400"
                      : "text-slate-600 hover:bg-white/60 hover:text-indigo-600"
                }`
              }
            >
              <Download className="w-5 h-5" />
              <span className="font-semibold">Downloads</span>
            </NavLink>
            <NavLink
              to="/converter"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? isDarkMode
                      ? "bg-gradient-to-r from-indigo-900/50 to-purple-900/50 text-indigo-300 border border-indigo-700/50 shadow"
                      : "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200/50 shadow"
                    : isDarkMode
                      ? "text-gray-300 hover:bg-gray-800/60 hover:text-indigo-400"
                      : "text-slate-600 hover:bg-white/60 hover:text-indigo-600"
                }`
              }
            >
              <RefreshCw className="w-5 h-5" />
              <span className="font-semibold">Converter</span>
            </NavLink>
            <NavLink
              to="/clip"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? isDarkMode
                      ? "bg-gradient-to-r from-indigo-900/50 to-purple-900/50 text-indigo-300 border border-indigo-700/50 shadow"
                      : "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200/50 shadow"
                    : isDarkMode
                      ? "text-gray-300 hover:bg-gray-800/60 hover:text-indigo-400"
                      : "text-slate-600 hover:bg-white/60 hover:text-indigo-600"
                }`
              }
            >
              <Scissors className="w-5 h-5" />
              <span className="font-semibold">Video Clip</span>
            </NavLink>

          </nav>
        </div>
      </div>

      <div
        className={`p-6 border-t space-y-2 transition-colors duration-300 ${
          isDarkMode ? "border-gray-700/50" : "border-indigo-200/30"
        }`}
      >
        <NavLink
          to="/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            isDarkMode
              ? "text-gray-300 hover:bg-gray-800/60 hover:text-indigo-400"
              : "text-slate-600 hover:bg-white/60 hover:text-indigo-600"
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </NavLink>
        <NavLink
          to="#"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            isDarkMode
              ? "text-gray-300 hover:bg-gray-800/60 hover:text-indigo-400"
              : "text-slate-600 hover:bg-white/60 hover:text-indigo-600"
          }`}
        >
          <HelpCircle className="w-5 h-5" />
          <span className="font-medium">Help & Support</span>
        </NavLink>

        <div
          className={`mt-4 backdrop-blur-sm rounded-2xl p-4 border transition-colors duration-300 ${
            isDarkMode ? "bg-gray-800/40 border-gray-700/60" : "bg-white/40 border-white/60"
          }`}
        >
          <h4
            className={`text-sm font-bold mb-3 transition-colors duration-300 ${
              isDarkMode ? "text-gray-200" : "text-slate-700"
            }`}
          >
            Quick Stats
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span
                className={`text-xs transition-colors duration-300 ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}
              >
                Total Downloads
              </span>
              <span
                className={`text-sm font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-indigo-400" : "text-indigo-600"
                }`}
              >
                {logs.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span
                className={`text-xs transition-colors duration-300 ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}
              >
                Storage Available
              </span>
              <span
                className={`text-sm font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-emerald-400" : "text-emerald-600"
                }`}
              >
                {(diskSpace.free / (1024 * 1024 * 1024)).toFixed(2)} GB
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span
                className={`text-xs transition-colors duration-300 ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}
              >
                Storage Used
              </span>
              <span
                className={`text-sm font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-purple-400" : "text-purple-600"
                }`}
              >
                {(
                  logs.reduce((acc, log) => acc + (log.fileSize ? Number.parseInt(log.fileSize) : 0), 0) /
                  (1024 * 1024 * 1024)
                ).toFixed(2)}{" "}
                GB
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
