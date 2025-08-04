import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface DownloadLog {
  url: string
  title: string
  platform: string
  filePath: string
  downloadedAt: string
  fileSize?: string
  fileType?: string
  id?: string
}

interface DownloadHistoryState {
  logs: DownloadLog[]
  isLoading: boolean
  
  // Actions
  fetchLogs: () => Promise<void>
  addLog: (log: DownloadLog) => void
  clearLogs: () => void
  removeLog: (filePath: string) => void
  refreshLogs: () => Promise<void>
  
  // Getters
  getLogsByPlatform: (platform: string) => DownloadLog[]
  getTodayLogs: () => DownloadLog[]
  getVideoLogs: () => DownloadLog[]
  getAudioLogs: () => DownloadLog[]
}

export const useDownloadHistoryStore = create<DownloadHistoryState>()(
  persist(
    (set, get) => ({
      logs: [],
      isLoading: true,

      fetchLogs: async () => {
        set({ isLoading: true })
        try {
          // Get fresh data from API (file system)
          const apiLogs = await window.api?.getLogs?.()
          if (apiLogs && Array.isArray(apiLogs)) {
            // Merge with existing store data and remove duplicates
            const { logs: existingLogs } = get()
            const combinedLogs = [...apiLogs, ...existingLogs]
            
            // Remove duplicates based on filePath
            const uniqueLogs = combinedLogs.filter((log, index, self) => 
              index === self.findIndex(l => l.filePath === log.filePath)
            )
            
            set({ 
              logs: uniqueLogs
                .sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime()),
              isLoading: false 
            })
            return
          }
          
          // If API fails, use persisted data
          console.log('API unavailable, using persisted data')
          set({ isLoading: false })
        } catch (error) {
          console.error('Failed to fetch logs from API:', error)
          set({ isLoading: false })
        }
      },

      addLog: (log) => {
        const { logs } = get()
        const newLog = {
          ...log,
          id: log.id || Date.now().toString(),
          downloadedAt: log.downloadedAt || new Date().toISOString()
        }
        
        // Add to beginning (latest first) and avoid duplicates
        const exists = logs.find(l => l.filePath === newLog.filePath)
        if (!exists) {
          set({ logs: [newLog, ...logs] })
        }
      },

      clearLogs: () => {
        set({ logs: [] })
        // Note: API clearLogs not implemented, only clearing store
      },

      removeLog: (filePath) => {
        const { logs } = get()
        set({ logs: logs.filter(log => log.filePath !== filePath) })
      },

      refreshLogs: async () => {
        await get().fetchLogs()
      },

      // Getters
      getLogsByPlatform: (platform) => {
        const { logs } = get()
        return logs.filter(log => 
          log.platform.toLowerCase() === platform.toLowerCase()
        )
      },

      getTodayLogs: () => {
        const { logs } = get()
        const today = new Date().toDateString()
        return logs.filter(log => 
          new Date(log.downloadedAt).toDateString() === today
        )
      },

      getVideoLogs: () => {
        const { logs } = get()
        return logs.filter(log => 
          log.filePath.match(/\.(mp4|avi|mov|mkv|webm|flv)$/i)
        )
      },

      getAudioLogs: () => {
        const { logs } = get()
        return logs.filter(log => 
          log.filePath.match(/\.(mp3|wav|flac|m4a|aac)$/i)
        )
      }
    }),
    {
      name: 'download-history-store',
      partialize: (state) => ({
        logs: state.logs,
      })
    }
  )
)
