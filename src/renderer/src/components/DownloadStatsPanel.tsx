import React from 'react'

interface DownloadStatsPanelProps {
  speed?: string
  eta?: string
  isDarkMode: boolean
}

export const DownloadStatsPanel: React.FC<DownloadStatsPanelProps> = ({
  speed = '-',
  eta = '-',
  isDarkMode
}) => {
  const textColor = isDarkMode ? '#f3f4f6' : '#1f2937'
  const bgColor = isDarkMode ? '#1f2937' : '#f9fafb'
  const borderColor = isDarkMode ? '#374151' : '#e5e7eb'

  return (
    <div
      style={{
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '1rem',
        padding: '1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ color: textColor, fontSize: '0.9rem', opacity: 0.8 }}>Speed</span>
        <strong style={{ color: textColor, fontSize: '1.1rem' }}>{speed}</strong>
      </div>
      <div style={{ height: '2rem', width: '1px', backgroundColor: borderColor, margin: '0 1rem' }} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ color: textColor, fontSize: '0.9rem', opacity: 0.8 }}>ETA</span>
        <strong style={{ color: textColor, fontSize: '1.1rem' }}>{eta}</strong>
      </div>
    </div>
  )
}
