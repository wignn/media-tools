import { useEffect, useState, useCallback, useRef } from 'react'
import { URLInput } from '../components/UrlInput'
import { TypeSelection } from '../components/TypeSelection'
import { DownloadLocation } from '../components/DownloadLocation'
import { ProgressPanel } from '../components/ProgressPanel'
import { ActionButtons } from '../components/ActionButtons'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { useTheme } from '../contexts/theme-context'
import { QueueDisplay } from '../components/QueueDisplay'
import { QueueManager, type QueueItem, type DownloadHandler } from '../utils/queue-manager'
import { useGlobalProcessStore } from '@renderer/store/globalProcessStore'
import { useQueueStore } from '@renderer/store/legacyQueueStore'
import { DownloadStatsPanel } from '@renderer/components/DownloadStatsPanel'

export default function Download() {
  const [url, setUrl] = useState('')
  const [downloadPath, setDownloadPath] = useState('C:\\Users')
  const [type, setType] = useState('mp4')
  const [loading, setLoading] = useState(true)
  const {
    queueManager,
    setQueueManager,
    queue: downloadQueue,
    setQueue: setDownloadQueue
  } = useQueueStore()
  const { addProcess, updateProcess, completeProcess, removeProcess } = useGlobalProcessStore()
  const queueManagerRef = useRef<QueueManager | null>(null)
  const { isDarkMode } = useTheme()

  const downloadHandler: DownloadHandler = useCallback(async (item: QueueItem) => {
    let savedPath: string | undefined
    if (item.type === 'mp4') {
      savedPath = await window.api?.downloadVideo(item.url, item.downloadPath, {
        id: item.id,
        limit: item.limit
      })
    } else {
      savedPath = await window.api?.downloadAudio(item.url, item.downloadPath, {
        id: item.id,
        limit: item.limit
      })
    }
    if (!savedPath) {
      throw new Error('Download path not returned or download failed.')
    }
  }, [])

  useEffect(() => {
    if (!queueManager) {
      const newManager = new QueueManager(downloadHandler)
      newManager.subscribe(setDownloadQueue)
      setQueueManager(newManager)
      queueManagerRef.current = newManager
    } else {
      queueManagerRef.current = queueManager
    }

    const progressListener = (data: {
      id: string
      percent: number
      eta: string
      speed: string
    }) => {
      console.log('Download progress:', data)
      if (!data || typeof data.percent !== 'number') return

      // Update queue manager
      queueManagerRef.current?.update(data.id, {
        percent: data.percent,
        eta: data.eta,
        speed: data.speed
      })

      // Update global progress store
      if (data.percent >= 100) {
        // Mark as completed when 100%
        updateProcess(data.id, {
          percent: 100,
          eta: '00:00',
          speed: data.speed,
          status: 'completed',
          isActive: false
        })

        // Auto-remove after 3 seconds
        setTimeout(() => {
          removeProcess(data.id)
        }, 3000)
      } else {
        // Normal progress update
        updateProcess(data.id, {
          percent: data.percent,
          eta: data.eta,
          speed: data.speed,
          status: 'processing',
          isActive: true
        })
      }
    }

    const completionListener = (data: { id: string; outputPath?: string; error?: string }) => {
      if (data.error) {
        // Handle error
        updateProcess(data.id, {
          status: 'error',
          isActive: false,
          error: data.error
        })
      } else {
        // Handle completion - make sure it's properly marked as completed
        updateProcess(data.id, {
          percent: 100,
          status: 'completed',
          isActive: false
        })

        // Auto-remove after 2 seconds for completed downloads
        setTimeout(() => {
          removeProcess(data.id)
        }, 2000)
      }
    }

    window.api?.on?.('download-progress', progressListener)
    window.api?.on?.('download-complete', completionListener)
    window.api?.on?.('download-error', completionListener)

    return () => {
      window.api?.off?.('download-progress', progressListener)
      window.api?.off?.('download-complete', completionListener)
      window.api?.off?.('download-error', completionListener)
    }
  }, [
    downloadHandler,
    queueManager,
    setQueueManager,
    setDownloadQueue,
    updateProcess,
    completeProcess
  ])

  const handleAddToQueue = async () => {
    if (!url) {
      alert('Silakan masukkan URL yang valid.')
      return
    }
    const limit = await window.api?.getDownloadLimit()

    const downloadId = Date.now().toString()
    const newDownload: QueueItem = {
      id: downloadId,
      url,
      type,
      downloadPath,
      status: 'Pending',
      percent: 0,
      isDownloading: false,
      title: url.length > 50 ? url.substring(0, 47) + '...' : url,
      limit: limit ? Number(limit) : undefined
    }

    // Add to queue manager
    queueManagerRef.current?.add(newDownload)

    // Add to global progress store
    addProcess({
      id: downloadId,
      type: 'download',
      title: newDownload.title || 'Download',
      url: url,
      status: 'pending',
      percent: 0,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      downloadData: {
        format: type === 'mp4' ? 'video' : 'audio',
        quality: type === 'mp4' ? '1080p' : '320k',
        downloadPath: downloadPath
      }
    })

    setUrl('')
  }

  const handleBrowse = async () => {
    try {
      const selectedPath = await window.api?.openDirectory()
      if (selectedPath) {
        setDownloadPath(selectedPath)
        await window.api?.setDownloadPath(selectedPath)
      }
    } catch (error) {
      console.error('Gagal membuka dialog folder:', error)
    }
  }

  const handleResetQueue = () => {
    if (confirm('Apakah kamu yakin ingin mengosongkan antrian?')) {
      queueManagerRef.current?.reset()
    }
  }

  useEffect(() => {
    const fetchDownloadPath = async () => {
      setLoading(true)
      try {
        const savedPath = await window.api?.getDownloadPath()
        if (savedPath) setDownloadPath(savedPath)
      } catch (error) {
        console.error('Gagal mengambil path:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDownloadPath()
  }, [])

  const currentActiveDownload = downloadQueue.find((q) => q.status === 'Downloading')

  if (loading) {
    return <LoadingSkeleton isDarkMode={isDarkMode} />
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        transition: 'background-color 0.3s ease',
        padding: '2rem',
        boxSizing: 'border-box'
      }}
      className={`${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 min-h-screen'
          : 'bg-gradient-to-br from-blue-100 via-purple-100 to-blue-50 text-gray-800 min-h-screen'
      }`}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '1280px',
          gap: '2rem'
        }}
      >
        <main
          style={{
            flex: '1',
            width: '100%'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '2rem',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                flex: '2 1 600px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                minWidth: '300px'
              }}
            >
              <URLInput value={url} setUrl={setUrl} isDarkMode={isDarkMode} />
              <TypeSelection selectedType={type} onTypeChange={setType} isDarkMode={isDarkMode} />
              <DownloadLocation
                path={downloadPath}
                onPathChange={setDownloadPath}
                onBrowse={handleBrowse}
                isDarkMode={isDarkMode}
              />
            </div>

            <div
              style={{
                flex: '1 1 300px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                minWidth: '280px'
              }}
            >
              <DownloadStatsPanel
                speed={currentActiveDownload?.speed}
                eta={currentActiveDownload?.eta}
                isDarkMode={isDarkMode}
              />
              <ProgressPanel
                status={currentActiveDownload?.status || 'Ready'}
                isDownloading={currentActiveDownload?.isDownloading || false}
                percent={currentActiveDownload?.percent || 0}
                isDarkMode={isDarkMode}
              />
              <ActionButtons
                onDownload={handleAddToQueue}
                isDownloading={false}
                hasUrl={!!url}
                isDarkMode={isDarkMode}
              />

              {downloadQueue.length > 0 && !downloadQueue.some((item) => item.isDownloading) && (
                <button
                  onClick={handleResetQueue}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: isDarkMode ? '#ff4d4f' : '#ff6666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    marginTop: '0.5rem'
                  }}
                >
                  Reset Queue
                </button>
              )}
            </div>
          </div>
        </main>

        {downloadQueue.length > 0 && (
          <div
            style={{
              marginTop: '4rem',
              width: '100%'
            }}
          >
            <QueueDisplay
              queue={downloadQueue}
              isDarkMode={isDarkMode}
              onRetry={(id) => queueManagerRef.current?.retry(id)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
