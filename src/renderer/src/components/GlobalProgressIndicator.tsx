import { useGlobalProcessStore, type GlobalProcess } from '../store/globalProcessStore'
import { useClipStore } from '../store/clipStore'
import { useTheme } from '../contexts/theme-context'
import { Scissors, Download, RefreshCw, X } from 'lucide-react'

interface GlobalProgressIndicatorProps {
  className?: string
}

export function GlobalProgressIndicator({ className = '' }: GlobalProgressIndicatorProps) {
  const { activeProcesses, removeProcess } = useGlobalProcessStore()
  const { activeClipProcess } = useClipStore()
  const { isDarkMode } = useTheme()

  // Combine all active processes
  const allActiveProcesses: GlobalProcess[] = [
    ...activeProcesses.filter(p => p.isActive),
  ]

  // Add active clip process if exists and not already in global processes
  if (activeClipProcess && activeClipProcess.isClipping) {
    const exists = allActiveProcesses.find(p => p.id === activeClipProcess.id)
    if (!exists) {
      const clipProgress: GlobalProcess = {
        id: activeClipProcess.id,
        type: 'clip',
        title: activeClipProcess.title || 'Video Clip',
        url: activeClipProcess.url,
        status: activeClipProcess.isClipping ? 'processing' : 'completed',
        percent: activeClipProcess.percent,
        isActive: activeClipProcess.isClipping,
        eta: activeClipProcess.eta,
        speed: activeClipProcess.speed,
        createdAt: activeClipProcess.createdAt,
        updatedAt: Date.now(),
        clipData: {
          startTime: activeClipProcess.startTime,
          endTime: activeClipProcess.endTime,
          quality: activeClipProcess.quality
        }
      }
      allActiveProcesses.push(clipProgress)
    }
  }

  if (allActiveProcesses.length === 0) {
    return null
  }

  const getIcon = (type: GlobalProcess['type']) => {
    switch (type) {
      case 'clip':
        return <Scissors className="w-4 h-4" />
      case 'convert':
        return <RefreshCw className="w-4 h-4" />
      case 'download':
      default:
        return <Download className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: GlobalProcess['type']) => {
    switch (type) {
      case 'clip':
        return 'Clipping'
      case 'convert':
        return 'Converting'
      case 'download':
      default:
        return 'Downloading'
    }
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 space-y-2 ${className}`}>
      {allActiveProcesses.map((process) => (
        <div
          key={process.id}
          className={`backdrop-blur-xl rounded-2xl border shadow-xl p-4 min-w-[320px] transition-all duration-300 ${
            isDarkMode
              ? 'bg-gray-800/90 border-gray-700/40 shadow-gray-900/20'
              : 'bg-white/90 border-slate-200/40 shadow-emerald-100/20'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                process.type === 'clip' 
                  ? 'bg-gradient-to-br from-purple-500 to-indigo-500'
                  : process.type === 'convert'
                  ? 'bg-gradient-to-br from-orange-500 to-red-500' 
                  : 'bg-gradient-to-br from-emerald-500 to-cyan-500'
              }`}>
                {getIcon(process.type)}
              </div>
              <div>
                <p className={`font-semibold text-sm ${
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}>
                  {getTypeLabel(process.type)}
                </p>
                <p className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-slate-500'
                }`}>
                  {process.title || 'Processing...'}
                </p>
              </div>
            </div>
            <button
              onClick={() => removeProcess(process.id)}
              className={`w-6 h-6 rounded-full flex items-center justify-center hover:scale-110 transition-transform ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                  : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
              }`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className={`text-xs font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-slate-600'
              }`}>
                Progress
              </span>
              <span className={`text-xs font-bold ${
                isDarkMode ? 'text-white' : 'text-slate-800'
              }`}>
                {Math.min(Math.max(process.percent, 0), 100)}%
              </span>
            </div>
            
            <div className={`w-full rounded-full h-2 overflow-hidden shadow-inner ${
              isDarkMode ? 'bg-gray-700' : 'bg-slate-200'
            }`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out progress-width ${
                  process.type === 'clip'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                    : process.type === 'convert'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500'
                    : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                }`}
                style={{ '--progress-percent': `${Math.min(Math.max(process.percent, 0), 100)}%` } as React.CSSProperties}
              ></div>
            </div>
            
            {(process.eta || process.speed) && (
              <div className="flex justify-between items-center text-xs">
                {process.speed && (
                  <span className={isDarkMode ? 'text-gray-400' : 'text-slate-500'}>
                    {process.speed}
                  </span>
                )}
                {process.eta && (
                  <span className={isDarkMode ? 'text-gray-400' : 'text-slate-500'}>
                    ETA: {process.eta}
                  </span>
                )}
              </div>
            )}
            
            <p className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-slate-500'
            }`}>
              {process.status}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
