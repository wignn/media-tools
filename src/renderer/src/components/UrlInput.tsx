'use client'

import { Link } from 'lucide-react'

interface URLInputProps {
  value: string
  setUrl: (value: string) => void
  isDarkMode?: boolean
}

export function URLInput({ value, setUrl, isDarkMode = false }: URLInputProps) {
  return (
    <div
      className={`backdrop-blur-xl rounded-3xl border shadow-xl p-8 transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gray-800/80 border-gray-700/40 shadow-gray-900/20'
          : 'bg-white/80 border-slate-200/40 shadow-indigo-100/20'
      }`}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200/50">
          <Link className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3
            className={`font-bold text-lg transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-slate-800'
            }`}
          >
            Video URL
          </h3>
          <p
            className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}
          >
            Paste your video link here to get started
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <label
          className={`block text-sm font-semibold transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-slate-700'
          }`}
        >
          Video URL
        </label>
        <input
          type="url"
          placeholder="Paste your video URL here (YouTube, Instagram, TikTok, etc.)"
          value={value}
          onChange={(e) => setUrl(e.target.value)}
          className={`w-full px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 shadow-sm ${
            isDarkMode
              ? 'text-white bg-gray-700/90 border border-gray-600/60 placeholder-gray-400 focus:bg-gray-700'
              : 'text-slate-800 bg-white/90 border border-slate-200/60 placeholder-slate-400 focus:bg-white'
          }`}
        />
      </div>
    </div>
  )
}
