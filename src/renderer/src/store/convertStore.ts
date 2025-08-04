import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ConvertProcess {
  id: string
  inputPath: string
  outputPath: string
  inputFormat: string
  outputFormat: string
  quality?: string
  title?: string
  status: string
  percent: number
  isConverting: boolean
  eta?: string
  speed?: string
  error?: string
  createdAt: number
}

interface ConvertState {
  activeConverts: ConvertProcess[]
  convertHistory: ConvertProcess[]
  
  addConvert: (convert: ConvertProcess) => void
  updateConvert: (id: string, updates: Partial<ConvertProcess>) => void
  removeConvert: (id: string) => void
  addToHistory: (convert: ConvertProcess) => void
  clearHistory: () => void
  removeFromHistory: (id: string) => void
  getActiveConvert: () => ConvertProcess | undefined
}

export const useConvertStore = create<ConvertState>()(
  persist(
    (set, get) => ({
      activeConverts: [],
      convertHistory: [],

      addConvert: (convert) => {
        const { activeConverts } = get()
        const exists = activeConverts.find(c => c.id === convert.id)
        
        if (!exists) {
          const newConvert = {
            ...convert,
            createdAt: Date.now()
          }
          
          set({ 
            activeConverts: [...activeConverts, newConvert]
          })
          
          get().addToHistory(newConvert)
        }
      },

      updateConvert: (id, updates) => {
        const { activeConverts, convertHistory } = get()
        
        // Update active converts
        const updatedActive = activeConverts.map(c =>
          c.id === id ? { ...c, ...updates } : c
        )
        
        // Update history
        const updatedHistory = convertHistory.map(c =>
          c.id === id ? { ...c, ...updates } : c
        )
        
        set({ 
          activeConverts: updatedActive,
          convertHistory: updatedHistory
        })
      },

      removeConvert: (id) => {
        const { activeConverts } = get()
        set({ 
          activeConverts: activeConverts.filter(c => c.id !== id)
        })
      },

      addToHistory: (convert) => {
        const { convertHistory } = get()
        const exists = convertHistory.find(c => c.id === convert.id)
        
        if (!exists) {
          set({ 
            convertHistory: [convert, ...convertHistory.slice(0, 99)]
          })
        }
      },

      clearHistory: () => {
        set({ convertHistory: [] })
      },

      removeFromHistory: (id) => {
        const { convertHistory } = get()
        set({ 
          convertHistory: convertHistory.filter(c => c.id !== id)
        })
      },

      getActiveConvert: () => {
        const { activeConverts } = get()
        return activeConverts.find(c => c.isConverting)
      }
    }),
    {
      name: 'convert-store',
      partialize: (state) => ({
        convertHistory: state.convertHistory,
      })
    }
  )
)
