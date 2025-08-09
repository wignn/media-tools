import { Activity, Download, CheckCircle, AlertCircle } from 'lucide-react'
interface ProgressPanelProps {
  status: string
  percent?: number
  isDownloading: boolean
  isDarkMode?: boolean
}

export function ProgressPanel({
  status,
  percent = 0,
  isDownloading,
  isDarkMode = false
}: ProgressPanelProps) {
  const isCompleted =
    status.includes('Selesai') || status.includes('Complete') || status.includes('completed')
  const isError = status.includes('Error') || status.includes('Failed') || status.includes('failed')
  const normalizedPercent = Math.min(Math.max(percent, 0), 100)

  return (
    <div
      className={`backdrop-blur-xl rounded-3xl border shadow-xl p-8 transition-all duration-300 ${
        isDarkMode
          ? 'bg-gray-800/80 border-gray-700/40 shadow-gray-900/20'
          : 'bg-white/80 border-slate-200/40 shadow-emerald-100/20'
      }`}
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200/50">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3
            className={`font-bold text-lg transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-slate-800'
            }`}
          >
            Download Status
          </h3>
          <p
            className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}
          >
            Track your download progress
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center space-y-6">
        <div className="w-full flex justify-center gap-2" style={{ marginBottom: '1rem' }}>
          <span
            className={`text-sm font-semibold px-4 py-2 rounded-2xl transition-colors duration-300 ${
              isCompleted
                ? isDarkMode
                  ? 'text-emerald-300 bg-emerald-900/30 border border-emerald-800'
                  : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                : isError
                  ? isDarkMode
                    ? 'text-red-300 bg-red-900/30 border border-red-800'
                    : 'text-red-700 bg-red-50 border border-red-200'
                  : isDownloading
                    ? isDarkMode
                      ? 'text-blue-300 bg-blue-900/30 border border-blue-800'
                      : 'text-blue-700 bg-blue-50 border border-blue-200'
                    : isDarkMode
                      ? 'text-gray-300 bg-gray-700/30 border border-gray-600'
                      : 'text-slate-700 bg-slate-50 border border-slate-200'
            }`}
          >
            {status}
          </span>
        </div>
        {(isDownloading || isCompleted) && (
          <div className="w-full space-y-3">
            <div className="flex justify-between items-center">
              <span
                className={`text-sm font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-slate-600'
                }`}
              >
                Progress
              </span>
              <span
                className={`text-sm font-bold transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}
              >
                {normalizedPercent}%
              </span>
            </div>
            <div
              className={`w-full rounded-full h-3 overflow-hidden shadow-inner transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-700' : 'bg-slate-200'
              }`}
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isCompleted
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                }`}
                style={{ width: `${normalizedPercent}%` }}
              />
            </div>
          </div>
        )}
        <br />
        <div
          className={`w-full rounded-2xl p-10 min-h-[160px] flex items-center justify-center shadow-inner transition-colors duration-300 ${
            isDarkMode
              ? 'bg-gray-700/90 border border-gray-600/60'
              : 'bg-gradient-to-br from-slate-50/90 to-white/90 border border-slate-200/60'
          }`}
        >
          {isDownloading ? (
            <div className="flex flex-col items-center space-y-6">
              <div className="relative flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent shadow-lg"></div>
                <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-emerald-200/30 animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className={`text-sm font-bold transition-colors duration-300 ${
                      isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                    }`}
                  >
                    {normalizedPercent}%
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <p
                  className={`text-base font-semibold text-center transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-slate-700'
                  }`}
                >
                  Downloading your media...
                </p>
                <p
                  className={`text-xs text-center transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-slate-500'
                  }`}
                >
                  {normalizedPercent < 100
                    ? 'Please wait while we process your request'
                    : 'Almost done...'}
                </p>
              </div>
            </div>
          ) : isCompleted ? (
            <div className="flex flex-col items-center space-y-6">
              <div className="relative flex items-center justify-center">
                <div className="rounded-full h-16 w-16 bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg flex items-center justify-center animate-bounce">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -inset-2 rounded-full bg-emerald-200/30 animate-ping"></div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <p
                  className={`text-base font-bold text-center transition-colors duration-300 ${
                    isDarkMode ? 'text-emerald-400' : 'text-emerald-700'
                  }`}
                >
                  🎉 Download Completed!
                </p>
                <p
                  className={`text-xs text-center transition-colors duration-300 ${
                    isDarkMode ? 'text-emerald-500' : 'text-emerald-600'
                  }`}
                >
                  Your file has been saved successfully (100%)
                </p>
              </div>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center space-y-6">
              <div className="flex items-center justify-center">
                <div className="rounded-full h-16 w-16 bg-gradient-to-r from-red-500 to-rose-500 shadow-lg flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <p
                  className={`text-base font-bold text-center transition-colors duration-300 ${
                    isDarkMode ? 'text-red-400' : 'text-red-700'
                  }`}
                >
                  ❌ Download Failed
                </p>
                <p
                  className={`text-xs text-center transition-colors duration-300 ${
                    isDarkMode ? 'text-red-500' : 'text-red-600'
                  }`}
                >
                  Please check your URL and try again
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-6">
              <div className="flex items-center justify-center">
                <div
                  className={`rounded-full h-16 w-16 shadow-lg flex items-center justify-center hover:scale-105 transition-transform duration-200 ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-gray-600 to-gray-700'
                      : 'bg-gradient-to-r from-slate-400 to-slate-500'
                  }`}
                >
                  <Download className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <p
                  className={`text-base font-semibold text-center transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-slate-600'
                  }`}
                >
                  Ready to Download
                </p>
                <p
                  className={`text-xs text-center transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-slate-500'
                  }`}
                >
                  Enter a URL and click start to begin
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
