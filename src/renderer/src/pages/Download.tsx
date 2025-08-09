import {
  DownloadIcon,
  Play,
  Music,
  FileText,
  ImageIcon,
  FolderOpen,
  Search,
  Filter,
  ExternalLink,
  Sparkles,
  Clock,
  Archive,
  Trash2
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from '../contexts/theme-context'
import { useDownloadHistoryStore } from '../store/downloadHistoryStore'

function DownloadPage() {
  const { isDarkMode } = useTheme()
  const {
    logs,
    isLoading: loading,
    fetchLogs,
    getVideoLogs,
    getAudioLogs,
    getTodayLogs
  } = useDownloadHistoryStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState('all')

  useEffect(() => {
    fetchLogs()
  }, [])

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return '🎥'
      case 'instagram':
        return '📷'
      case 'tiktok':
        return '🎵'
      case 'twitter':
        return '🐦'
      case 'facebook':
        return '📘'
      default:
        return '🌐'
    }
  }

  const getFileIcon = (filePath: string) => {
    const ext = filePath.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'mp4':
      case 'avi':
      case 'mov':
        return <Play className="w-4 h-4 text-red-500" />
      case 'mp3':
      case 'wav':
      case 'flac':
        return <Music className="w-4 h-4 text-green-500" />
      case 'jpg':
      case 'png':
      case 'gif':
        return <ImageIcon className="w-4 h-4 text-blue-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.platform.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPlatform =
      selectedPlatform === 'all' || log.platform.toLowerCase() === selectedPlatform
    return matchesSearch && matchesPlatform
  })

  const platforms = [...new Set(logs.map((log) => log.platform.toLowerCase()))]

  if (loading) {
    return (
      <div
        className={`justify-center flex min-h-screen transition-colors duration-300 ${
          isDarkMode
            ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800'
            : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'
        }`}
      >
        <div className="container mx-auto p-6 max-w-5xl">
          <div className="animate-pulse space-y-8">
            <div className="flex items-center gap-6 mb-8">
              <div
                className={`w-16 h-16 rounded-3xl ${isDarkMode ? 'bg-gray-700' : 'bg-slate-200'}`}
              />
              <div className="space-y-2">
                <div
                  className={`h-8 rounded-lg w-64 ${isDarkMode ? 'bg-gray-700' : 'bg-slate-200'}`}
                />
                <div
                  className={`h-5 rounded w-48 ${isDarkMode ? 'bg-gray-700' : 'bg-slate-200'}`}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`card-container ${isDarkMode ? 'dark' : 'light'} p-6`}>
                  <div className="space-y-3">
                    <div
                      className={`w-12 h-12 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-slate-200'}`}
                    />
                    <div
                      className={`h-6 rounded w-3/4 ${isDarkMode ? 'bg-gray-700' : 'bg-slate-200'}`}
                    />
                    <div
                      className={`h-4 rounded w-1/2 ${isDarkMode ? 'bg-gray-700' : 'bg-slate-200'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`card-container ${isDarkMode ? 'dark' : 'light'} p-8`}>
                <div className="space-y-4">
                  <div
                    className={`h-6 rounded w-3/4 ${isDarkMode ? 'bg-gray-700' : 'bg-slate-200'}`}
                  />
                  <div
                    className={`h-4 rounded w-1/2 ${isDarkMode ? 'bg-gray-700' : 'bg-slate-200'}`}
                  />
                  <div
                    className={`h-4 rounded w-2/3 ${isDarkMode ? 'bg-gray-700' : 'bg-slate-200'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`justify-center flex min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800'
          : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'
      }`}
    >
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Enhanced Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl">
              <DownloadIcon className="w-10 h-10 text-white" />
            </div>
            <h1
              className={`text-4xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Download History
            </h1>
            <Sparkles
              className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} animate-pulse`}
            />
          </div>
          <p
            className={`text-lg transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Manage and view all your downloaded files
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            className={`card-container ${isDarkMode ? 'dark' : 'light'} group hover:scale-105 transition-all duration-300`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Archive className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {logs.length}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Downloads
                </p>
              </div>
            </div>
          </div>

          <div
            className={`card-container ${isDarkMode ? 'dark' : 'light'} group hover:scale-105 transition-all duration-300`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getVideoLogs().length}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Video Files
                </p>
              </div>
            </div>
          </div>

          <div
            className={`card-container ${isDarkMode ? 'dark' : 'light'} group hover:scale-105 transition-all duration-300`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getAudioLogs().length}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Audio Files
                </p>
              </div>
            </div>
          </div>

          <div
            className={`card-container ${isDarkMode ? 'dark' : 'light'} group hover:scale-105 transition-all duration-300`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getTodayLogs().length}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Today</p>
              </div>
            </div>
          </div>
        </div>

        <br />
        <div className={`mb-8`}>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                  searchTerm ? 'text-indigo-500' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or platform..."
                className={`input-field ${isDarkMode ? 'dark' : 'light'} pl-12 w-full transition-all duration-300 ${
                  searchTerm ? 'ring-2 ring-indigo-500/50' : ''
                }`}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            <div className="relative min-w-[200px]">
              <Filter
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                  selectedPlatform !== 'all'
                    ? 'text-indigo-500'
                    : isDarkMode
                      ? 'text-gray-400'
                      : 'text-gray-500'
                }`}
              />
              <select
                title="Filter by platform"
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className={`input-field ${isDarkMode ? 'dark' : 'light'} pl-12 w-full transition-all duration-300 ${
                  selectedPlatform !== 'all' ? 'ring-2 ring-indigo-500/50' : ''
                }`}
              >
                <option value="all">All Platforms ({logs.length})</option>
                {platforms.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)} (
                    {logs.filter((l) => l.platform.toLowerCase() === p).length})
                  </option>
                ))}
              </select>
            </div>

            {(searchTerm || selectedPlatform !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedPlatform('all')
                }}
                className="icon-button danger group"
                title="Clear all filters"
              >
                <Trash2 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              </button>
            )}
          </div>

          <br />
          {(searchTerm || selectedPlatform !== 'all') && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {searchTerm && (
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm">
                  <Search className="w-3 h-3" />
                  <span>Search: "{searchTerm}"</span>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
              {selectedPlatform !== 'all' && (
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                  <Filter className="w-3 h-3" />
                  <span>
                    Platform: {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}
                  </span>
                  <button
                    onClick={() => setSelectedPlatform('all')}
                    className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <br />
        {filteredLogs.length === 0 ? (
          <div
            className={`form-container ${isDarkMode ? 'dark' : 'light'} text-center relative overflow-hidden`}
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-10 left-10 w-20 h-20 bg-indigo-500 rounded-full animate-pulse" />
              <div className="absolute top-32 right-16 w-16 h-16 bg-purple-500 rounded-full animate-pulse animation-delay-1000" />
              <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-500 rounded-full animate-pulse animation-delay-2000" />
              <div className="absolute bottom-32 right-1/3 w-8 h-8 bg-blue-500 rounded-full animate-pulse animation-delay-3000" />
            </div>

            <div className="relative z-10 py-8">
              <div className="mb-8">
                <div className="relative inline-block">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center mb-6 shadow-2xl animate-float">
                    <DownloadIcon className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center animate-bounce">
                    <Archive className="w-6 h-6 text-white" />
                  </div>
                  {/* Floating particles */}
                  <div className="absolute -top-4 -left-4 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-ping" />
                  <div className="absolute -bottom-4 -right-4 w-4 h-4 bg-gradient-to-br from-green-400 to-blue-500 rounded-full animate-ping animation-delay-500" />
                </div>
              </div>

              <h3
                className={`text-3xl font-bold mb-4 bg-gradient-to-r ${
                  isDarkMode
                    ? 'from-white via-indigo-200 to-purple-200 text-transparent bg-clip-text'
                    : 'from-gray-900 via-indigo-900 to-purple-900 text-transparent bg-clip-text'
                }`}
              >
                {searchTerm || selectedPlatform !== 'all'
                  ? '🔍 No Results Found'
                  : '📁 No Downloads Yet'}
              </h3>

              <p className={`text-lg mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {searchTerm || selectedPlatform !== 'all'
                  ? 'Try adjusting your search terms or clear the filters to see all downloads'
                  : 'Ready to start downloading? Your downloaded files will appear here with beautiful cards!'}
              </p>

              {searchTerm || selectedPlatform !== 'all' ? (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedPlatform('all')
                  }}
                  className="action-button primary group hover:shadow-2xl transition-all duration-300"
                >
                  <Trash2 className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  Clear All Filters
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <div
                    className={`px-6 py-3 rounded-2xl border ${
                      isDarkMode
                        ? 'bg-gray-800/50 border-gray-700 text-gray-300'
                        : 'bg-white/50 border-gray-200 text-gray-600'
                    }`}
                  >
                    <span className="text-sm font-medium">
                      💡 Tip: Try downloading from YouTube, Instagram, or TikTok
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {filteredLogs.map((log, index) => (
                <div
                  key={index}
                  className={`card-container ${isDarkMode ? 'dark' : 'light'} hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden`}
                >
                  {/* Background gradient on hover */}
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
                      isDarkMode
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                        : 'bg-gradient-to-br from-indigo-200 to-purple-300'
                    }`}
                  />

                  <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-6">
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                          isDarkMode
                            ? 'bg-gray-700 group-hover:bg-gray-600'
                            : 'bg-gradient-to-br from-indigo-100 to-purple-100 group-hover:from-indigo-200 group-hover:to-purple-200'
                        }`}
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                          {getPlatformIcon(log.platform)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-bold text-lg mb-2 line-clamp-2 transition-colors duration-300 group-hover:text-indigo-600 ${
                            isDarkMode ? 'text-white group-hover:text-indigo-400' : 'text-gray-900'
                          }`}
                        >
                          {log.title}
                        </h3>
                        <div
                          className={`flex items-center gap-3 text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          <span
                            className={`status-badge ${log.platform.toLowerCase()} transition-transform duration-300 group-hover:scale-105`}
                          >
                            {log.platform.toUpperCase()}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(log.downloadedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`card-container ${isDarkMode ? 'dark' : 'light'} mb-6 transition-all duration-300 group-hover:shadow-lg`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="transition-transform duration-300 group-hover:scale-110">
                          {getFileIcon(log.filePath)}
                        </div>
                        <span
                          className={`text-sm font-medium truncate transition-colors duration-300 ${
                            isDarkMode
                              ? 'text-gray-200 group-hover:text-white'
                              : 'text-gray-700 group-hover:text-gray-900'
                          }`}
                        >
                          {log.filePath.split('/').pop() || log.filePath.split('\\').pop()}
                        </span>
                      </div>
                      <p
                        className={`text-xs truncate flex items-center gap-1 ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}
                      >
                        <FolderOpen className="w-3 h-3" />
                        {log.filePath.replace(/\\/g, '/')}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => window.api?.openPath(log.filePath)}
                        className="action-button primary flex-1 group-hover:shadow-xl transition-shadow duration-300"
                      >
                        <FolderOpen className="w-4 h-4" />
                        Open File
                      </button>
                      <button
                        onClick={() => window.open(log.url, '_blank')}
                        className="icon-button primary group-hover:shadow-xl transition-shadow duration-300"
                        title="Open in Browser"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <br />
            <div className="text-center mt-12">
              <div
                className={`inline-flex items-center gap-3 px-8 py-4 rounded-3xl border ${
                  isDarkMode
                    ? 'bg-gray-800/50 border-gray-700 text-gray-300'
                    : 'bg-white/50 border-gray-200 text-gray-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="font-medium">
                    Showing {filteredLogs.length} of {logs.length} downloads
                  </span>
                </div>
                {filteredLogs.length !== logs.length && (
                  <>
                    <span>•</span>
                    <span className="text-sm">
                      {logs.length - filteredLogs.length} hidden by filters
                    </span>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default DownloadPage
