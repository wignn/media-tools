import { useEffect, useState, useCallback, useRef } from 'react'
import { URLInput } from '../components/UrlInput'
import { TypeSelection } from '../components/TypeSelection'
import { DownloadLocation } from '../components/DownloadLocation'
import { ProgressPanel } from '../components/ProgressPanel'
import { ActionButtons } from '../components/ActionButtons'
import { LoadingSkeleton } from '../components/LoadingSekleton'
import { useTheme } from '../contexts/theme-context'
import { QueueDisplay } from '../components/queue-display'
import { QueueManager, type QueueItem, type DownloadHandler } from '../utils/queue-manager'
import { useQueueStore } from '@renderer/store/queueStore'
import { DownloadStatsPanel } from '@renderer/components/DownloadStatsPanel'

export default function ModernDesktopApp() {
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
      queueManagerRef.current?.update(data.id, {
        percent: data.percent,
        eta: data.eta,
        speed: data.speed
      })
    }

    window.api?.on?.('download-progress', progressListener)
    return () => window.api?.off?.('download-progress', progressListener)
  }, [downloadHandler, queueManager, setQueueManager, setDownloadQueue])

  const handleAddToQueue = async () => {
    if (!url) {
      alert('Silakan masukkan URL yang valid.')
      return
    }
    const limit = await window.api?.getDownloadLimit()

    const newDownload: QueueItem = {
      id: Date.now().toString(),
      url,
      type,
      downloadPath,
      status: 'Pending',
      percent: 0,
      isDownloading: false,
      title: url.length > 50 ? url.substring(0, 47) + '...' : url,
      limit: limit ? Number(limit) : undefined
    }

    queueManagerRef.current?.add(newDownload)
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
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        transition: 'background-color 0.3s ease',
        padding: '2rem',
        boxSizing: 'border-box'
      }}
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
