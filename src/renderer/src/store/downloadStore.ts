import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface DownloadProcess {
  id: string
  url: string
  title?: string
  format: string
  quality?: string
  downloadPath: string
  status: string
  percent: number
  isDownloading: boolean
  eta?: string
  speed?: string
  outputPath?: string
  error?: string
  createdAt: number
  retries?: number
}

interface DownloadState {
  activeDownloads: DownloadProcess[]
  downloadHistory: DownloadProcess[]

  addDownload: (download: DownloadProcess) => void
  updateDownload: (id: string, updates: Partial<DownloadProcess>) => void
  removeDownload: (id: string) => void
  addToHistory: (download: DownloadProcess) => void
  clearHistory: () => void
  removeFromHistory: (id: string) => void
  getActiveDownload: () => DownloadProcess | undefined
}

export const useDownloadStore = create<DownloadState>()(
  persist(
    (set, get) => ({
      activeDownloads: [],
      downloadHistory: [],

      addDownload: (download) => {
        const { activeDownloads } = get()
        const exists = activeDownloads.find((d) => d.id === download.id)

        if (!exists) {
          const newDownload = {
            ...download,
            createdAt: Date.now()
          }

          set({
            activeDownloads: [...activeDownloads, newDownload]
          })

          get().addToHistory(newDownload)
        }
      },

      updateDownload: (id, updates) => {
        const { activeDownloads, downloadHistory } = get()

        // Update active downloads
        const updatedActive = activeDownloads.map((d) => (d.id === id ? { ...d, ...updates } : d))

        // Update history
        const updatedHistory = downloadHistory.map((d) => (d.id === id ? { ...d, ...updates } : d))

        set({
          activeDownloads: updatedActive,
          downloadHistory: updatedHistory
        })
      },

      removeDownload: (id) => {
        const { activeDownloads } = get()
        set({
          activeDownloads: activeDownloads.filter((d) => d.id !== id)
        })
      },

      addToHistory: (download) => {
        const { downloadHistory } = get()
        const exists = downloadHistory.find((d) => d.id === download.id)

        if (!exists) {
          set({
            downloadHistory: [download, ...downloadHistory.slice(0, 99)]
          })
        }
      },

      clearHistory: () => {
        set({ downloadHistory: [] })
      },

      removeFromHistory: (id) => {
        const { downloadHistory } = get()
        set({
          downloadHistory: downloadHistory.filter((d) => d.id !== id)
        })
      },

      getActiveDownload: () => {
        const { activeDownloads } = get()
        return activeDownloads.find((d) => d.isDownloading)
      }
    }),
    {
      name: 'download-store',
      partialize: (state) => ({
        downloadHistory: state.downloadHistory
      })
    }
  )
)
