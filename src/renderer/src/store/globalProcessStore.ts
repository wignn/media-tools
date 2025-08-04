import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ProcessType = 'download' | 'clip' | 'convert'
export type ProcessStatus = 'pending' | 'processing' | 'completed' | 'error' | 'paused'

export interface GlobalProcess {
  id: string
  type: ProcessType
  title: string
  url?: string
  status: ProcessStatus
  percent: number
  isActive: boolean
  eta?: string
  speed?: string
  outputPath?: string
  error?: string
  createdAt: number
  updatedAt: number
  
  // Type specific data
  downloadData?: {
    format: string
    quality?: string
    downloadPath: string
  }
  clipData?: {
    startTime: string
    endTime: string
    quality?: string
  }
  convertData?: {
    inputPath: string
    outputFormat: string
    quality?: string
  }
}

interface GlobalProcessState {
  activeProcesses: GlobalProcess[]
  processHistory: GlobalProcess[]
  
  // Process management
  addProcess: (process: GlobalProcess) => void
  updateProcess: (id: string, updates: Partial<GlobalProcess>) => void
  removeProcess: (id: string) => void
  completeProcess: (id: string, outputPath?: string) => void
  errorProcess: (id: string, error: string) => void
  
  // History management
  addToHistory: (process: GlobalProcess) => void
  clearHistory: () => void
  removeFromHistory: (id: string) => void
  
  // Utility functions
  getActiveProcessesByType: (type: ProcessType) => GlobalProcess[]
  getProcessById: (id: string) => GlobalProcess | undefined
  hasActiveProcess: () => boolean
  getActiveDownloads: () => GlobalProcess[]
  getActiveClips: () => GlobalProcess[]
  getActiveConverts: () => GlobalProcess[]
}

export const useGlobalProcessStore = create<GlobalProcessState>()(
  persist(
    (set, get) => ({
      activeProcesses: [],
      processHistory: [],

      addProcess: (process) => {
        const { activeProcesses } = get()
        const exists = activeProcesses.find(p => p.id === process.id)
        
        if (!exists) {
          const newProcess = {
            ...process,
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
          
          set({ 
            activeProcesses: [...activeProcesses, newProcess]
          })
          
          // Also add to history
          get().addToHistory(newProcess)
        }
      },

      updateProcess: (id, updates) => {
        const { activeProcesses, processHistory } = get()
        const now = Date.now()
        
        // Update active processes
        const updatedActiveProcesses = activeProcesses.map(p =>
          p.id === id ? { ...p, ...updates, updatedAt: now } : p
        )
        
        // Update history
        const updatedHistory = processHistory.map(p =>
          p.id === id ? { ...p, ...updates, updatedAt: now } : p
        )
        
        set({ 
          activeProcesses: updatedActiveProcesses,
          processHistory: updatedHistory
        })
      },

      removeProcess: (id) => {
        const { activeProcesses } = get()
        set({ 
          activeProcesses: activeProcesses.filter(p => p.id !== id)
        })
      },

      completeProcess: (id, outputPath) => {
        get().updateProcess(id, {
          status: 'completed',
          percent: 100,
          isActive: false,
          outputPath,
          updatedAt: Date.now()
        })
        
        // Remove from active processes after a delay
        setTimeout(() => {
          get().removeProcess(id)
        }, 5000)
      },

      errorProcess: (id, error) => {
        get().updateProcess(id, {
          status: 'error',
          isActive: false,
          error,
          updatedAt: Date.now()
        })
      },

      addToHistory: (process) => {
        const { processHistory } = get()
        const exists = processHistory.find(p => p.id === process.id)
        
        if (!exists) {
          set({ 
            processHistory: [process, ...processHistory.slice(0, 99)] // Keep last 100 items
          })
        }
      },

      clearHistory: () => {
        set({ processHistory: [] })
      },

      removeFromHistory: (id) => {
        const { processHistory } = get()
        set({ 
          processHistory: processHistory.filter(p => p.id !== id)
        })
      },

      // Utility functions
      getActiveProcessesByType: (type) => {
        const { activeProcesses } = get()
        return activeProcesses.filter(p => p.type === type && p.isActive)
      },

      getProcessById: (id) => {
        const { activeProcesses, processHistory } = get()
        return activeProcesses.find(p => p.id === id) || 
               processHistory.find(p => p.id === id)
      },

      hasActiveProcess: () => {
        const { activeProcesses } = get()
        return activeProcesses.some(p => p.isActive)
      },

      getActiveDownloads: () => {
        return get().getActiveProcessesByType('download')
      },

      getActiveClips: () => {
        return get().getActiveProcessesByType('clip')
      },

      getActiveConverts: () => {
        return get().getActiveProcessesByType('convert')
      }
    }),
    {
      name: 'global-process-store',
      partialize: (state) => ({
        processHistory: state.processHistory,
      })
    }
  )
)
