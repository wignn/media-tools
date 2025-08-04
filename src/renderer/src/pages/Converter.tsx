import { useState, useEffect } from 'react'
import {
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  File,
  Sparkles,
  FolderOpen,
  Trash2,
  Music
} from 'lucide-react'
import { useTheme } from '../contexts/theme-context'

interface ConversionLog {
  id: string
  fileName: string
  originalPath: string
  convertedPath?: string
  status: 'pending' | 'converting' | 'completed' | 'error'
  progress: number
  error?: string
  size?: string
  duration?: string
}

export function Converter() {
  const { isDarkMode } = useTheme()
  const [conversions, setConversions] = useState<ConversionLog[]>([])

  // Setup progress tracking
  useEffect(() => {
    const handleProgress = (data: { id: string; progress: number }) => {
      setConversions((prev) =>
        prev.map((conv) =>
          conv.id === data.id
            ? {
                ...conv,
                progress: Math.round(data.progress),
                status: 'converting' as const
              }
            : conv
        )
      )
    }

    window.api.on('conversion-progress', handleProgress)

    return () => {
      window.api.off('conversion-progress', handleProgress)
    }
  }, [])

  const handleFileSelect = async () => {
    const filePaths = await window.api.selectVideoFiles()
    if (!filePaths || filePaths.length === 0) return

    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i]
      const fileName = filePath.split('\\').pop() || filePath.split('/').pop() || 'unknown.mp4'

      if (!fileName.toLowerCase().endsWith('.mp4')) {
        alert('Please select only MP4 files')
        continue
      }

      const conversionId = Date.now().toString() + i

      const newConversion: ConversionLog = {
        id: conversionId,
        fileName: fileName,
        originalPath: filePath,
        status: 'pending',
        progress: 0,
        size: 'Processing...'
      }

      setConversions((prev) => [...prev, newConversion])

      // Start conversion with small delay
      setTimeout(() => startConversion(conversionId, filePath), i * 100)
    }
  }

  const startConversion = async (id: string, filePath: string) => {
    setConversions((prev) =>
      prev.map((conv) => (conv.id === id ? { ...conv, status: 'converting' as const } : conv))
    )

    try {
      const result = await window.api.convertVideoToAudio(filePath, id)

      setConversions((prev) =>
        prev.map((conv) =>
          conv.id === id
            ? {
                ...conv,
                status: 'completed' as const,
                progress: 100,
                convertedPath: result.outputPath
              }
            : conv
        )
      )
    } catch (error) {
      setConversions((prev) =>
        prev.map((conv) =>
          conv.id === id
            ? {
                ...conv,
                status: 'error' as const,
                error: error instanceof Error ? error.message : 'Conversion failed'
              }
            : conv
        )
      )
    }
  }

  const removeConversion = (id: string) => {
    setConversions((prev) => prev.filter((conv) => conv.id !== id))
  }

  const openOutputFolder = (filePath: string) => {
    window.api.openPath(filePath)
  }

  const getStatusIcon = (status: ConversionLog['status']) => {
    switch (status) {
      case 'pending':
        return <File className="w-5 h-5" />
      case 'converting':
        return <RefreshCw className="w-5 h-5 animate-spin" />
      case 'completed':
        return <CheckCircle2 className="w-5 h-5" />
      case 'error':
        return <AlertCircle className="w-5 h-5" />
    }
  }

  return (
    <div
      className={`justify-center flex min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800'
          : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'
      }`}
    >
      <div className="container mx-auto p-6 max-w-5xl">
        {/* Enhanced Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl">
              <RefreshCw className="w-10 h-10 text-white" />
            </div>
            <h1
              className={`text-4xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Video Converter
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
            Transform your MP4 videos into high-quality MP3 audio files
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
              }`}
            >
              <Music className="w-4 h-4" />
              High Quality MP3
            </div>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
              }`}
            >
              <File className="w-4 h-4" />
              Batch Processing
            </div>
          </div>
        </div>
        <br />

        <div
          className={`upload-area ${isDarkMode ? 'dark' : 'light'} mb-8 cursor-pointer group hover:scale-[1.02] transition-all duration-300`}
          onClick={handleFileSelect}
        >
          <div className="relative z-10">
            <div className="mb-6">
              <div className="relative">
                <Upload
                  className={`w-20 h-20 mx-auto transition-all duration-300 group-hover:scale-110 ${
                    isDarkMode
                      ? 'text-gray-400 group-hover:text-indigo-400'
                      : 'text-gray-500 group-hover:text-indigo-600'
                  }`}
                />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <File className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            <h3
              className={`text-2xl font-bold mb-3 transition-colors duration-300 ${
                isDarkMode
                  ? 'text-white group-hover:text-indigo-300'
                  : 'text-gray-900 group-hover:text-indigo-700'
              }`}
            >
              Select MP4 Files
            </h3>
            <p
              className={`text-lg mb-4 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Click here to browse and select your MP4 files for conversion
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-indigo-900/50 text-indigo-300 group-hover:bg-indigo-800/60'
                    : 'bg-indigo-100 text-indigo-700 group-hover:bg-indigo-200'
                }`}
              >
                <File className="w-4 h-4" />
                Multiple files supported
              </div>
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-purple-900/50 text-purple-300 group-hover:bg-purple-800/60'
                    : 'bg-purple-100 text-purple-700 group-hover:bg-purple-200'
                }`}
              >
                <Music className="w-4 h-4" />
                High quality output
              </div>
            </div>
          </div>
        </div>
        <br />
        {conversions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className={`card-container ${isDarkMode ? 'dark' : 'light'} text-center`}>
              <div
                className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
              >
                {conversions.length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Files
              </div>
            </div>
            <div className={`card-container ${isDarkMode ? 'dark' : 'light'} text-center`}>
              <div
                className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}
              >
                {conversions.filter((c) => c.status === 'completed').length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Completed
              </div>
            </div>
            <div className={`card-container ${isDarkMode ? 'dark' : 'light'} text-center`}>
              <div
                className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}
              >
                {conversions.filter((c) => c.status === 'converting').length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Processing
              </div>
            </div>
            <div className={`card-container ${isDarkMode ? 'dark' : 'light'} text-center`}>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                {conversions.filter((c) => c.status === 'error').length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Failed
              </div>
            </div>
          </div>
        )}
        <br />
        {conversions.length > 0 && (
          <div className={`form-container ${isDarkMode ? 'dark' : 'light'}`}>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-2xl font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Conversion Queue
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConversions([])}
                    className="icon-button danger"
                    title="Clear all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <br />
              <div className="space-y-4">
                {conversions.map((conversion) => (
                  <div
                    key={conversion.id}
                    className={`card-container ${isDarkMode ? 'dark' : 'light'} hover:scale-[1.01] transition-all duration-200`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`status-badge ${conversion.status} flex-shrink-0`}>
                          {getStatusIcon(conversion.status)}
                          {conversion.status}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-semibold text-lg transition-colors duration-300 truncate ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}
                            title={conversion.fileName}
                          >
                            {conversion.fileName}
                          </h3>
                          {conversion.size && (
                            <p
                              className={`text-sm transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}
                            >
                              Size: {conversion.size}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {conversion.status === 'completed' && conversion.convertedPath && (
                          <button
                            onClick={() => openOutputFolder(conversion.convertedPath!)}
                            className="icon-button primary"
                            title="Open in folder"
                          >
                            <FolderOpen className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => removeConversion(conversion.id)}
                          className="icon-button danger"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {conversion.status === 'converting' && (
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between items-center">
                          <span
                            className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            Converting • {conversion.progress}%
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              isDarkMode
                                ? 'bg-indigo-900/30 text-indigo-400'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            🎵 Processing
                          </span>
                        </div>
                        <div
                          className={`w-full rounded-full h-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                        >
                          <div
                            className="progress-bar bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-300 progress-animated"
                            style={
                              {
                                '--progress-width': `${conversion.progress}%`
                              } as React.CSSProperties
                            }
                          />
                        </div>
                      </div>
                    )}

                    {conversion.error && (
                      <div
                        className={`rounded-lg p-3 mt-3 ${
                          isDarkMode
                            ? 'bg-red-900/20 border border-red-800'
                            : 'bg-red-100 border border-red-200'
                        }`}
                      >
                        <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                          {conversion.error}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Enhanced Empty State */}
        {conversions.length === 0 && (
          <div className={`form-container ${isDarkMode ? 'dark' : 'light'} text-center`}>
            <div className="relative z-10">
              <div className="mb-8">
                <div className="relative inline-block">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-2xl">
                    <RefreshCw className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-pulse">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <h3
                className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                Ready to Convert Videos
              </h3>
              <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Select MP4 files above to start converting them to high-quality MP3 format
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                    isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  <File className="w-4 h-4" />
                  Supports MP4 files
                </div>
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                    isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                  }`}
                >
                  <Music className="w-4 h-4" />
                  320kbps Quality
                </div>
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                    isDarkMode
                      ? 'bg-purple-900/30 text-purple-400'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  Batch Processing
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
