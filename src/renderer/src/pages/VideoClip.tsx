import { useState, useEffect } from 'react'
import {
  Scissors,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  Link,
  Sparkles,
  Play,
  Timer,
  Zap
} from 'lucide-react'
import { useTheme } from '../contexts/theme-context'
import { useClipStore, type ClipProcess } from '../store/clipStore'
import { useGlobalProcessStore } from '../store/globalProcessStore'

interface ClipJob {
  id: string
  url: string
  title: string
  startTime: string
  endTime: string
  outputPath?: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
}

export function VideoClip() {
  const { isDarkMode } = useTheme()
  const { activeClipProcess, clipHistory, setActiveClipProcess, updateClipProcess, addToHistory } =
    useClipStore()
  const { addProcess, updateProcess, removeProcess } = useGlobalProcessStore()

  const [clipJobs, setClipJobs] = useState<ClipJob[]>([])
  const [url, setUrl] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const historyJobs: ClipJob[] = clipHistory.map((process) => ({
      id: process.id,
      url: process.url,
      title: process.title || 'YouTube Video',
      startTime: process.startTime,
      endTime: process.endTime,
      outputPath: process.outputPath,
      status: process.isClipping
        ? 'processing'
        : process.status.includes('Completed') || process.status.includes('Selesai')
          ? 'completed'
          : process.status.includes('Error') || process.status.includes('Failed')
            ? 'error'
            : 'pending',
      progress: process.percent,
      error: process.status.includes('Error') ? process.status : undefined
    }))

    setClipJobs(historyJobs)
  }, [clipHistory])

  // Add active clip process to jobs if exists
  useEffect(() => {
    if (activeClipProcess) {
      const activeJob: ClipJob = {
        id: activeClipProcess.id,
        url: activeClipProcess.url,
        title: activeClipProcess.title || 'YouTube Video',
        startTime: activeClipProcess.startTime,
        endTime: activeClipProcess.endTime,
        outputPath: activeClipProcess.outputPath,
        status: activeClipProcess.isClipping
          ? 'processing'
          : activeClipProcess.status.includes('Completed') ||
              activeClipProcess.status.includes('Selesai')
            ? 'completed'
            : activeClipProcess.status.includes('Error') ||
                activeClipProcess.status.includes('Failed')
              ? 'error'
              : 'pending',
        progress: activeClipProcess.percent,
        error: activeClipProcess.status.includes('Error') ? activeClipProcess.status : undefined
      }

      setClipJobs((prev) => {
        const filtered = prev.filter((job) => job.id !== activeClipProcess.id)
        return [activeJob, ...filtered]
      })
    }
  }, [activeClipProcess])

  // Setup progress tracking
  useEffect(() => {
    const handleProgress = (data: {
      id: string
      percent: number
      stage: string
      frame?: number
      size?: string
      timeProcessed?: string
      speed?: string
      eta?: string
    }) => {
      // Update clip store
      updateClipProcess(data.id, {
        percent: Math.round(data.percent),
        status: `Clipping... ${data.stage}`,
        speed: data.speed,
        eta: data.eta,
        isClipping: true
      })

      // Update global progress
      updateProcess(data.id, {
        percent: Math.round(data.percent),
        speed: data.speed,
        eta: data.eta,
        status: 'processing'
      })

      // Update local state
      setClipJobs((prev) =>
        prev.map((job) =>
          job.id === data.id
            ? {
                ...job,
                progress: Math.round(data.percent),
                status: 'processing' as const
              }
            : job
        )
      )
    }

    window.api.onClipProgress(handleProgress)

    return () => {
      window.api.removeClipProgressListener()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url.trim() || !startTime.trim() || !endTime.trim()) {
      alert('Please fill in all fields')
      return
    }

    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    if (!youtubeRegex.test(url)) {
      alert('Please enter a valid YouTube URL')
      return
    }

    // Validate time format (HH:MM:SS or MM:SS)
    const timeRegex = /^(\d{1,2}:)?(\d{1,2}):(\d{1,2})$/
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      alert('Please use time format MM:SS or HH:MM:SS')
      return
    }

    setIsLoading(true)

    try {
      // Get video title first
      let videoTitle: string | undefined
      try {
        videoTitle = await window.api.getVideoTitle(url)
      } catch (error) {
        console.error('Failed to get video title:', error)
      }
      const clipId = Date.now().toString()

      // Create clip process for global store
      const clipProcess: ClipProcess = {
        id: clipId,
        url: url,
        title: videoTitle || 'YouTube Video',
        startTime: startTime,
        endTime: endTime,
        status: 'Pending',
        percent: 0,
        isClipping: false,
        createdAt: Date.now()
      }

      // Add to clip store
      setActiveClipProcess(clipProcess)
      addToHistory(clipProcess)

      // Add to global progress
      addProcess({
        id: clipId,
        type: 'clip',
        title: videoTitle || 'YouTube Video',
        url: url,
        status: 'pending',
        percent: 0,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        clipData: {
          startTime: startTime,
          endTime: endTime
        }
      })

      const newClip: ClipJob = {
        id: clipId,
        url: url,
        title: videoTitle || 'YouTube Video',
        startTime: startTime,
        endTime: endTime,
        status: 'pending',
        progress: 0
      }

      setClipJobs((prev) => [...prev, newClip])

      // Start clipping process
      startClipping(clipId, url, startTime, endTime)

      // Reset form
      setUrl('')
      setStartTime('')
      setEndTime('')
    } catch (error) {
      alert('Failed to get video information. Please check the URL.')
    } finally {
      setIsLoading(false)
    }
  }

  const startClipping = async (id: string, videoUrl: string, start: string, end: string) => {
    // Update clip store - mark as clipping
    updateClipProcess(id, {
      status: 'Processing...',
      isClipping: true,
      percent: 0
    })

    // Update global progress
    updateProcess(id, {
      status: 'processing',
      isActive: true,
      percent: 0
    })

    setClipJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, status: 'processing' as const } : job))
    )

    try {
      const result = await window.api.clipVideo(videoUrl, start, end, id)

      // Update clip store - completed
      updateClipProcess(id, {
        status: 'Completed successfully',
        isClipping: false,
        percent: 100,
        outputPath: result.outputPath
      })

      // Complete process in global store
      updateProcess(id, {
        status: 'completed',
        isActive: false,
        percent: 100,
        outputPath: result.outputPath
      })

      // Auto-remove from global progress after delay
      setTimeout(() => {
        removeProcess(id)
      }, 5000)

      setClipJobs((prev) =>
        prev.map((job) =>
          job.id === id
            ? {
                ...job,
                status: 'completed' as const,
                progress: 100,
                outputPath: result.outputPath
              }
            : job
        )
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      // Update clip store - error
      updateClipProcess(id, {
        status: `Error: ${errorMessage}`,
        isClipping: false,
        percent: 0
      })

      // Update global progress - error
      updateProcess(id, {
        status: 'error',
        isActive: false,
        percent: 0,
        error: errorMessage
      })

      setClipJobs((prev) =>
        prev.map((job) =>
          job.id === id
            ? {
                ...job,
                status: 'error' as const,
                error: error instanceof Error ? error.message : 'Clipping failed'
              }
            : job
        )
      )
    }
  }

  const removeClipJob = (id: string) => {
    setClipJobs((prev) => prev.filter((job) => job.id !== id))
  }

  const openOutputFolder = (filePath: string) => {
    window.api.openPath(filePath)
  }

  const getStatusIcon = (status: ClipJob['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />
      case 'processing':
        return <Scissors className="w-5 h-5 animate-pulse" />
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
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
              <Scissors className="w-8 h-8 text-white" />
            </div>
            <h1
              className={`text-4xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Video Clipper
            </h1>
            <Sparkles className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
          <p
            className={`text-lg transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Clip YouTube videos by specifying start and end times
          </p>
        </div>

        <div className={`form-container ${isDarkMode ? 'dark' : 'light'} mb-8`}>
          <div className="relative z-10">
            <h2
              className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Create Video Clip
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  YouTube URL
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className={`input-field ${isDarkMode ? 'dark' : 'light'} pl-10`}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setUrl('')}
                    className="icon-button danger"
                    title="Clear URL"
                    disabled={!url}
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Start Time (MM:SS or HH:MM:SS)
                  </label>
                  <div className="relative flex gap-2">
                    <input
                      type="text"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      placeholder="0:30"
                      className={`input-field ${isDarkMode ? 'dark' : 'light'} flex-1`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setStartTime('0:00')}
                      className="icon-button primary"
                      title="Set to start"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    End Time (MM:SS or HH:MM:SS)
                  </label>
                  <div className="relative flex gap-2">
                    <input
                      type="text"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      placeholder="2:30"
                      className={`input-field ${isDarkMode ? 'dark' : 'light'} flex-1`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setEndTime('5:00')}
                      className="icon-button primary"
                      title="Set default duration"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <span
                  className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                >
                  Quick Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStartTime('0:00')
                      setEndTime('0:30')
                    }}
                    className="preset-button blue"
                  >
                    <Timer className="w-4 h-4" />
                    30s clip
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStartTime('0:00')
                      setEndTime('1:00')
                    }}
                    className="preset-button green"
                  >
                    <Clock className="w-4 h-4" />
                    1min clip
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStartTime('0:00')
                      setEndTime('5:00')
                    }}
                    className="preset-button purple"
                  >
                    <Zap className="w-4 h-4" />
                    5min clip
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={isLoading} className="action-button primary flex-1">
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Scissors className="w-5 h-5" />
                      Create Clip
                    </div>
                  )}
                </button>

                {url && (
                  <button
                    type="button"
                    onClick={() => window.open(url, '_blank')}
                    className="icon-button primary"
                    title="Preview Video"
                  >
                    <Play className="w-5 h-5" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
        <br />

        {clipJobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className={`card-container ${isDarkMode ? 'dark' : 'light'} text-center`}>
              <div
                className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
              >
                {clipJobs.length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Clips
              </div>
            </div>
            <div className={`card-container ${isDarkMode ? 'dark' : 'light'} text-center`}>
              <div
                className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}
              >
                {clipJobs.filter((c) => c.status === 'completed').length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Completed
              </div>
            </div>
            <div className={`card-container ${isDarkMode ? 'dark' : 'light'} text-center`}>
              <div
                className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}
              >
                {clipJobs.filter((c) => c.status === 'processing').length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Processing
              </div>
            </div>
            <div className={`card-container ${isDarkMode ? 'dark' : 'light'} text-center`}>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                {clipJobs.filter((c) => c.status === 'error').length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Failed
              </div>
            </div>
          </div>
        )}

        {clipJobs.length > 0 && (
          <div className={`form-container ${isDarkMode ? 'dark' : 'light'}`}>
            <div className="relative z-10">
              <h2
                className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Clip Jobs
              </h2>
              <div className="space-y-4">
                {clipJobs.map((job) => (
                  <div key={job.id} className={`card-container ${isDarkMode ? 'dark' : 'light'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className={`status-badge ${job.status}`}>
                          {getStatusIcon(job.status)}
                          {job.status}
                        </div>
                        <div>
                          <h3
                            className={`font-semibold text-lg transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {job.title}
                          </h3>
                          <p
                            className={`text-sm transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            {job.startTime} - {job.endTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.status === 'completed' && job.outputPath && (
                          <button
                            onClick={() => openOutputFolder(job.outputPath!)}
                            className="icon-button primary"
                            title="Open in folder"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => removeClipJob(job.id)}
                          className="icon-button danger"
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    {job.status === 'processing' && (
                      <div className="space-y-2 mb-3">
                        <div
                          className={`w-full rounded-full h-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                        >
                          <div
                            className={`progress-bar h-3 rounded-full transition-all duration-300 progress-animated ${
                              job.progress < 70
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                : 'bg-gradient-to-r from-purple-500 to-pink-600'
                            }`}
                            style={
                              { '--progress-width': `${job.progress}%` } as React.CSSProperties
                            }
                          />
                        </div>
                      </div>
                    )}

                    {job.error && (
                      <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mt-3">
                        <p className="text-red-600 dark:text-red-400 text-sm">{job.error}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {clipJobs.length === 0 && (
          <div className={`form-container ${isDarkMode ? 'dark' : 'light'} text-center`}>
            <div className="relative z-10">
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4">
                  <Scissors className="w-12 h-12 text-white" />
                </div>
              </div>
              <h3
                className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                Ready to Create Clips
              </h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Enter a YouTube URL and time range above to create your first clip
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
