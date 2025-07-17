export {}

declare global {
  interface Window {
    api: {
      openDirectory: () => Promise<string | undefined>
      downloadVideo: (videoUrl: string, outputDir: string, options?: { [key: string]: any }) => Promise<string>
      getDownloadPath: () => Promise<string | undefined>
      setDownloadPath: (path: string) => Promise<void>,
      on: (channel: string, callback: (...args: any[]) => void) => void,
      off: (channel: string, callback: (...args: any[]) => void) => void,
      downloadAudio: (url: string, outputDir: string, options?: { [key: string]: any }) => Promise<string>,
      getLogs: () => Promise<any[]>,
      openPath: (filePath: string) => Promise<void>
      getSystemMemory: () => Promise<{ total: number; free: number }>
      getDownloadLimit: () => Promise<string | undefined>
      setDownloadLimit: (limit: string) => Promise<void>
      cancelDownload: (id: string) => Promise<void>
      getDiskSpace: () => Promise<{ total: number; free: number }>
    }
    electron: typeof import('@electron-toolkit/preload').electronAPI
  }
}
