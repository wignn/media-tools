import { Monitor } from 'lucide-react'
interface TypeSelectionProps {
  selectedType: string
  onTypeChange: (type: string) => void
  isDarkMode?: boolean
}

export function TypeSelection({
  selectedType,
  onTypeChange,
  isDarkMode = false
}: TypeSelectionProps) {
  return (
    <div
      className={`backdrop-blur-xl rounded-3xl border shadow-xl p-8 transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gray-800/80 border-gray-700/40 shadow-gray-900/20'
          : 'bg-white/80 border-slate-200/40 shadow-purple-100/20'
      }`}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200/50">
          <Monitor className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3
            className={`font-bold text-lg transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-slate-800'
            }`}
          >
            Format Selection
          </h3>
          <p
            className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}
          >
            Choose your preferred download format
          </p>
        </div>
      </div>
      <select
        title="Video Type"
        value={selectedType}
        onChange={(e) => onTypeChange(e.target.value)}
        className={`w-full px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 shadow-sm font-medium ${
          isDarkMode
            ? 'text-white bg-gray-700/90 border border-gray-600/60 focus:bg-gray-700'
            : 'text-slate-800 bg-white/90 border border-slate-200/60 focus:bg-white'
        }`}
      >
        <option value="mp4">🎥 Video (MP4)</option>
        <option value="mp3">🎵 Audio (MP3)</option>
      </select>
    </div>
  )
}
