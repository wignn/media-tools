import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface EnchanProcess {
  id: string
  inputPath: string
  inputPreview?: string // Blob URL for preview
  outputPath?: string
  outputPreview?: string // Blob URL for result
  status: string
  percent: number
  isEnhancing: boolean
  error?: string
  createdAt: number
}

interface EnchanState {
  activeEnhanceProcess: EnchanProcess | null
  enhanceHistory: EnchanProcess[]
  currentProcessingImagePath: string | null // Path gambar yang sedang diproses

  setActiveEnhanceProcess: (process: EnchanProcess | null) => void
  updateEnhanceProcess: (id: string, updates: Partial<EnchanProcess>) => void
  addToHistory: (process: EnchanProcess) => void
  clearHistory: () => void
  removeFromHistory: (id: string) => void
  cleanOldHistory: () => void
  setCurrentProcessingImagePath: (path: string | null) => void
  getCurrentProcessingImagePath: () => string | null
}

const MAX_HISTORY_ITEMS = 50 // Limit history to prevent memory bloat

export const useEnchanStore = create<EnchanState>()(
  persist(
    (set, get) => ({
      activeEnhanceProcess: null,
      enhanceHistory: [],
      currentProcessingImagePath: null,

      setActiveEnhanceProcess: (process) => {
        set({ activeEnhanceProcess: process })
        
        // Update current processing path
        if (process?.isEnhancing) {
          set({ currentProcessingImagePath: process.inputPath })
        } else if (!process) {
          set({ currentProcessingImagePath: null })
        }
      },

      updateEnhanceProcess: (id, updates) => {
        const state = get()
        
        // Update active process
        if (state.activeEnhanceProcess?.id === id) {
          const updatedProcess = {
            ...state.activeEnhanceProcess,
            ...updates
          }
          
          set({
            activeEnhanceProcess: updatedProcess
          })
          
          // Update processing path based on status
          if (updates.isEnhancing === false || updates.percent === 100) {
            set({ currentProcessingImagePath: null })
          } else if (updates.isEnhancing === true) {
            set({ currentProcessingImagePath: updatedProcess.inputPath })
          }
        }

        // Update in history - use immutable update pattern
        set({
          enhanceHistory: state.enhanceHistory.map((process) =>
            process.id === id ? { ...process, ...updates } : process
          )
        })
      },

      addToHistory: (process) => {
        const state = get()
        const exists = state.enhanceHistory.some((p) => p.id === process.id)

        if (!exists) {
          let newHistory = [process, ...state.enhanceHistory]
          
          // Limit history size to prevent memory bloat
          if (newHistory.length > MAX_HISTORY_ITEMS) {
            newHistory = newHistory.slice(0, MAX_HISTORY_ITEMS)
          }
          
          set({ enhanceHistory: newHistory })
        }
      },

      clearHistory: () => {
        set({ enhanceHistory: [] })
      },

      removeFromHistory: (id) => {
        const state = get()
        const newHistory = state.enhanceHistory.filter((process) => process.id !== id)
        
        set({ enhanceHistory: newHistory })

        // Clear active if it's the one being removed
        if (state.activeEnhanceProcess?.id === id) {
          set({ 
            activeEnhanceProcess: null,
            currentProcessingImagePath: null 
          })
        }
      },

      cleanOldHistory: () => {
        const state = get()
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)
        
        const recentHistory = state.enhanceHistory.filter(
          process => process.createdAt > oneDayAgo
        )
        
        if (recentHistory.length !== state.enhanceHistory.length) {
          set({ enhanceHistory: recentHistory })
        }
      },

      setCurrentProcessingImagePath: (path) => {
        set({ currentProcessingImagePath: path })
      },

      getCurrentProcessingImagePath: () => {
        return get().currentProcessingImagePath
      }
    }),
    {
      name: 'enchan-store',
      version: 1,
      partialize: (state) => ({
        enhanceHistory: state.enhanceHistory.slice(0, MAX_HISTORY_ITEMS),
        // Don't persist active process and current processing path to avoid stale state
        currentProcessingImagePath: null
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Clean old history on app start and reset processing path
          state.cleanOldHistory()
          state.setCurrentProcessingImagePath(null)
        }
      }
    }
  )
)