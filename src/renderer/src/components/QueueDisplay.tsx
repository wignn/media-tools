import {
  Download,
  Play,
  Music,
  FileText,
  ImageIcon,
  XCircle,
  CheckCircle,
  AlertCircle,
  RotateCcw
} from 'lucide-react'

interface QueueItem {
  id: string
  url: string
  type: string
  downloadPath: string
  status: string
  percent: number
  isDownloading: boolean
  title?: string
}

interface QueueDisplayProps {
  queue: QueueItem[]
  isDarkMode: boolean
  onRetry?: (id: string) => void
}

export function QueueDisplay({ queue, isDarkMode, onRetry }: QueueDisplayProps) {
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'mp4':
      case 'avi':
      case 'mov':
        return <Play style={{ width: '1rem', height: '1rem', color: '#ef4444' }} />
      case 'mp3':
      case 'wav':
      case 'flac':
        return <Music style={{ width: '1rem', height: '1rem', color: '#22c55e' }} />
      case 'jpg':
      case 'png':
      case 'gif':
        return <ImageIcon style={{ width: '1rem', height: '1rem', color: '#3b82f6' }} />
      default:
        return <FileText style={{ width: '1rem', height: '1rem', color: '#6b7280' }} />
    }
  }

  const cancelDownload = async (id: string) => {
    try {
      await window.api?.cancelDownload(id)
    } catch (error) {
      console.error('Failed to cancel download:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    if (status.includes('Downloading')) {
      return (
        <Download
          style={{ width: '1.25rem', height: '1.25rem', color: isDarkMode ? '#60a5fa' : '#3b82f6' }}
        />
      )
    } else if (status.includes('Selesai') || status.includes('Completed')) {
      return (
        <CheckCircle
          style={{ width: '1.25rem', height: '1.25rem', color: isDarkMode ? '#4ade80' : '#22c55e' }}
        />
      )
    } else if (status.startsWith('Error')) {
      return (
        <AlertCircle
          style={{ width: '1.25rem', height: '1.25rem', color: isDarkMode ? '#f87171' : '#ef4444' }}
        />
      )
    } else {
      return (
        <XCircle
          style={{ width: '1.25rem', height: '1.25rem', color: isDarkMode ? '#9ca3af' : '#6b7280' }}
        />
      )
    }
  }

  return (
    <div
      style={{
        background: isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        borderRadius: '1.5rem',
        border: isDarkMode
          ? '1px solid rgba(75, 85, 99, 0.4)'
          : '1px solid rgba(226, 232, 240, 0.4)',
        boxShadow: isDarkMode
          ? '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
          : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        padding: '2rem',
        transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease'
      }}
    >
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          color: isDarkMode ? '#ffffff' : '#1e293b',
          transition: 'color 0.3s ease'
        }}
      >
        Download Queue
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '1rem'
        }}
      >
        {queue.map((item) => (
          <div
            key={item.id}
            style={{
              background: isDarkMode ? '#374151' : '#f8fafc',
              borderRadius: '1rem',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              border: isDarkMode ? '1px solid #4b5563' : '1px solid #e2e8f0',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isDarkMode ? '#4b5563' : '#e0f2fe'
              }}
            >
              {getFileIcon(item.type)}
            </div>

            <div style={{ flexGrow: 1 }}>
              <p
                style={{
                  fontWeight: 'bold',
                  color: isDarkMode ? '#e5e7eb' : '#1e293b',
                  marginBottom: '0.25rem'
                }}
              >
                {item.title || item.url}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: isDarkMode ? '#9ca3af' : '#64748b' }}>
                  {item.status}
                </span>
                {item.isDownloading && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      color: isDarkMode ? '#60a5fa' : '#3b82f6'
                    }}
                  >
                    ({item.percent.toFixed(1)}%)
                  </span>
                )}
              </div>

              {item.isDownloading && (
                <div
                  style={{
                    width: '100%',
                    height: '0.5rem',
                    background: isDarkMode ? '#4b5563' : '#e2e8f0',
                    borderRadius: '9999px',
                    marginTop: '0.5rem',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      width: `${item.percent}%`,
                      height: '100%',
                      background: 'linear-gradient(to right, #3b82f6, #06b6d4)',
                      borderRadius: '9999px',
                      transition: 'width 0.5s ease-out'
                    }}
                  />
                </div>
              )}
              {item.status.startsWith('Error') && onRetry && (
                <button
                  onClick={() => onRetry(item.id)}
                  style={{
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.75rem',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer'
                  }}
                >
                  <RotateCcw style={{ width: '1rem', height: '1rem' }} />
                  Retry
                </button>
              )}
            </div>
            <div
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {item.isDownloading && (
                <button
                  onClick={() => cancelDownload(item.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4
                  }}
                  title="Cancel Download"
                >
                  <XCircle
                    style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      color: isDarkMode ? '#f87171' : '#ef4444'
                    }}
                  />
                </button>
              )}

              {getStatusIcon(item.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
