import { Folder } from 'lucide-react'

interface DownloadLocationProps {
  path: string
  onPathChange: (path: string) => void
  onBrowse: () => void
  isDarkMode?: boolean
}

export function DownloadLocation({
  path,
  onPathChange,
  onBrowse,
  isDarkMode = false
}: DownloadLocationProps) {
  return (
    <div
      className={`backdrop-blur-xl rounded-3xl border shadow-xl p-8 transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gray-800/80 border-gray-700/40 shadow-gray-900/20'
          : 'bg-white/80 border-slate-200/40 shadow-orange-100/20'
      }`}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200/50">
          <Folder className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3
            className={`font-bold text-lg transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-slate-800'
            }`}
          >
            Save Location
          </h3>
          <p
            className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}
          >
            Select where to save your downloaded files
          </p>
        </div>
      </div>
      <div className="flex gap-4">
        <input
          title="Download Path"
          type="text"
          value={path}
          onChange={(e) => onPathChange(e.target.value)}
          className={`flex-1 px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 shadow-sm ${
            isDarkMode
              ? 'text-white bg-gray-700/90 border border-gray-600/60 placeholder-gray-400 focus:bg-gray-700'
              : 'text-slate-800 bg-white/90 border border-slate-200/60 placeholder-slate-400 focus:bg-white'
          }`}
          readOnly
        />
        <button
          onClick={onBrowse}
          className={`px-8 py-4 rounded-2xl border transition-all duration-200 flex items-center gap-3 font-semibold shadow-sm ${
            isDarkMode
              ? 'text-gray-300 bg-gray-700/90 border-gray-600/60 hover:bg-gray-600/90 hover:border-gray-500'
              : 'text-slate-700 bg-white/90 border-slate-200/60 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 hover:border-orange-300'
          }`}
        >
          <Folder className="w-5 h-5" />
          Browse
        </button>
      </div>
    </div>
  )
}
