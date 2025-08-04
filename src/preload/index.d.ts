export {}

declare global {
  interface Window {
    api: {
      openDirectory: () => Promise<string | undefined>
      selectVideoFiles: () => Promise<string[] | null>
      downloadVideo: (videoUrl: string, outputDir: string, options?: { [key: string]: any }) => Promise<string>
      getDownloadPath: () => Promise<string | undefined>
      setDownloadPath: (path: string) => Promise<void>,
      on: (channel: string, callback: (...args: any[]) => void) => void,
      off: (channel: string, callback: (...args: any[]) => void) => void,
      downloadAudio: (url: string, outputDir: string, options?: { [key: string]: any }) => Promise<string>,
      convertVideoToAudio: (videoPath: string, conversionId: string) => Promise<{ outputPath: string }>,
      getVideoTitle: (url: string) => Promise<string>,
      clipVideo: (videoUrl: string, startTime: string, endTime: string, clipId: string) => Promise<{ outputPath: string }>,
      onClipProgress: (callback: (data: { id: string, percent: number, stage: string, frame?: number, size?: string, timeProcessed?: string, speed?: string, eta?: string }) => void) => void,
      removeClipProgressListener: () => void,
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
