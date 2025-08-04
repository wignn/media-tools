import { create } from 'zustand'
import { QueueItem, QueueManager } from '../utils/queue-manager'

export interface GlobalProgress {
  id: string
  type: 'download' | 'clip' | 'convert'
  status: string
  percent: number
  isActive: boolean
  title?: string
  url?: string
  eta?: string
  speed?: string
}

interface QueueState {
  queue: QueueItem[]
  setQueue: (queue: QueueItem[]) => void
  queueManager: QueueManager | null
  setQueueManager: (manager: QueueManager) => void
  globalProgress: GlobalProgress[]
  addGlobalProgress: (progress: GlobalProgress) => void
  updateGlobalProgress: (id: string, updates: Partial<GlobalProgress>) => void
  removeGlobalProgress: (id: string) => void
  clearGlobalProgress: () => void
}

export const useQueueStore = create<QueueState>((set, get) => ({
  queue: [],
  setQueue: (queue) => set({ queue }),
  queueManager: null,
  setQueueManager: (manager) => set({ queueManager: manager }),
  globalProgress: [],
  
  addGlobalProgress: (progress) => {
    const { globalProgress } = get()
    const exists = globalProgress.find(p => p.id === progress.id)
    
    if (!exists) {
      set({ globalProgress: [...globalProgress, progress] })
    }
  },
  
  updateGlobalProgress: (id, updates) => {
    const { globalProgress } = get()
    set({
      globalProgress: globalProgress.map(p => 
        p.id === id ? { ...p, ...updates } : p
      )
    })
  },
  
  removeGlobalProgress: (id) => {
    const { globalProgress } = get()
    set({ globalProgress: globalProgress.filter(p => p.id !== id) })
  },
  
  clearGlobalProgress: () => {
    set({ globalProgress: [] })
  }
}))
