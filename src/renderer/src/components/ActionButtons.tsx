'use client'

import { Download } from 'lucide-react'

interface ActionButtonsProps {
  onDownload: () => void
  isDownloading: boolean
  hasUrl: boolean
  isDarkMode?: boolean
}

export function ActionButtons({
  onDownload,
  isDownloading,
  hasUrl,
  isDarkMode = false
}: ActionButtonsProps) {
  return (
    <div
      className={`backdrop-blur-xl rounded-3xl border shadow-xl p-8 transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gray-800/80 border-gray-700/40 shadow-gray-900/20'
          : 'bg-white/80 border-slate-200/40 shadow-indigo-100/20'
      }`}
    >
      <div className="space-y-4">
        <button
          onClick={onDownload}
          disabled={isDownloading || !hasUrl}
          className={`w-full text-white py-5 px-8 rounded-2xl font-bold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 text-lg ${
            isDarkMode
              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-indigo-900/50'
              : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-indigo-200/50'
          }`}
        >
          <Download className="w-6 h-6" />
          {isDownloading ? '⏳ Downloading...' : 'Start Download'}
        </button>
      </div>
    </div>
  )
}
