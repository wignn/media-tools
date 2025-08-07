import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ClipProcess {
  id: string
  url: string
  title?: string
  startTime: string
  endTime: string
  status: string
  percent: number
  isClipping: boolean
  outputPath?: string
  quality?: string
  eta?: string
  speed?: string
  createdAt: number
}

interface ClipState {
  activeClipProcess: ClipProcess | null
  clipHistory: ClipProcess[]
  setActiveClipProcess: (process: ClipProcess | null) => void
  updateClipProcess: (id: string, updates: Partial<ClipProcess>) => void
  addToHistory: (process: ClipProcess) => void
  clearHistory: () => void
  removeFromHistory: (id: string) => void
}

export const useClipStore = create<ClipState>()(
  persist(
    (set, get) => ({
      activeClipProcess: null,
      clipHistory: [],

      setActiveClipProcess: (process) => {
        set({ activeClipProcess: process })
      },

      updateClipProcess: (id, updates) => {
        const { activeClipProcess, clipHistory } = get()

        // Update active process if it matches
        if (activeClipProcess && activeClipProcess.id === id) {
          const updatedProcess = { ...activeClipProcess, ...updates }
          set({ activeClipProcess: updatedProcess })

          // Also update in history if it exists there
          const historyIndex = clipHistory.findIndex((item) => item.id === id)
          if (historyIndex >= 0) {
            const newHistory = [...clipHistory]
            newHistory[historyIndex] = updatedProcess
            set({ clipHistory: newHistory })
          }
        } else {
          // Update in history only
          const historyIndex = clipHistory.findIndex((item) => item.id === id)
          if (historyIndex >= 0) {
            const newHistory = [...clipHistory]
            newHistory[historyIndex] = { ...newHistory[historyIndex], ...updates }
            set({ clipHistory: newHistory })
          }
        }
      },

      addToHistory: (process) => {
        const { clipHistory } = get()
        const exists = clipHistory.find((item) => item.id === process.id)

        if (!exists) {
          set({ clipHistory: [process, ...clipHistory] })
        }
      },

      clearHistory: () => {
        set({ clipHistory: [] })
      },

      removeFromHistory: (id) => {
        const { clipHistory, activeClipProcess } = get()
        set({
          clipHistory: clipHistory.filter((item) => item.id !== id),
          activeClipProcess: activeClipProcess?.id === id ? null : activeClipProcess
        })
      }
    }),
    {
      name: 'clip-store', // Key for localStorage
      partialize: (state) => ({
        clipHistory: state.clipHistory
      })
    }
  )
)
