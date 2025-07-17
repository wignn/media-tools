import { contextBridge, ipcRenderer } from 'electron'

import { electronAPI } from '@electron-toolkit/preload'

const api = {
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  downloadVideo: (url: string, path: string, filename: string) =>
    ipcRenderer.invoke('download-video', url, path, filename),

  downloadAudio: (url: string, path: string, filename: string) =>
    ipcRenderer.invoke('download-audio', url, path, filename),

  getDownloadPath: () => ipcRenderer.invoke('get-download-path'),
  setDownloadPath: (path) => ipcRenderer.invoke('set-download-path', path),
  on: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_event, ...args) => callback(...args))
  },

  getLogs: () => ipcRenderer.invoke('get-download-logs'),
  off: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, callback)
  },

  openPath: (filePath: string) => ipcRenderer.invoke('open-path', filePath),
  getSystemMemory: () => ipcRenderer.invoke('get-system-memory'),
  getDiskSpace: () => ipcRenderer.invoke('get-disk-space'),
  setDownloadLimit: (limit: string) => ipcRenderer.invoke('set-download-limit', limit),
  getDownloadLimit: () => ipcRenderer.invoke('get-download-limit'),
  cancelDownload: (id: string) => ipcRenderer.invoke('cancel-download', id),
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('electron', electronAPI)
  contextBridge.exposeInMainWorld('api', api)
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
