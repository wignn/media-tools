import { app, ipcMain, dialog, BrowserWindow, shell } from 'electron'
import { join, resolve } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs'
import path from 'path'
import { ChildProcess, spawn } from 'child_process'
import disk from 'diskusage'
import os from 'os'
import Store from 'electron-store'
import { v4 as uuid } from 'uuid'

const store = new Store()

const logPath = path.join(app.getPath('userData'), 'downloads.json')
const activeDownloads = new Map<string, ChildProcess>()

function logDownload(info: {
  url: string
  title: string
  platform: string
  filePath: string
  fileSize?: string
  fileType?: string
}) {
  let logs: any[] = []

  if (fs.existsSync(logPath)) {
    try {
      logs = JSON.parse(fs.readFileSync(logPath, 'utf8'))
    } catch {
      logs = []
    }
  }

  logs.push({
    ...info,
    downloadedAt: new Date().toISOString()
  })

  fs.writeFileSync(logPath, JSON.stringify(logs, null, 2), 'utf8')
}

function getVideoTitle(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const ytdlpPath = app.isPackaged
      ? path.join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'bin', 'yt-dlp.exe')
      : resolvePath(__dirname, '../../resources/bin/yt-dlp.exe')

    const yt = spawn(ytdlpPath, ['-j', url])

    let json = ''

    yt.stdout.on('data', (data) => {
      json += data.toString()
    })

    yt.stderr.on('data', (data) => {
      console.error('[yt-dlp INFO ERROR]', data.toString())
    })

    yt.on('close', (code) => {
      if (code === 0) {
        try {
          const info = JSON.parse(json)
          resolve(info.title)
        } catch (e) {
          reject(new Error('Failed to parse yt-dlp JSON output'))
        }
      } else {
        reject(new Error('yt-dlp exited with error code ' + code))
      }
    })

    yt.on('error', reject)
  })
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    title: 'Wign - Media Tool',
    icon: join(__dirname, '../../resources/icon.ico'),
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.handle('get-download-path', () => {
    return store.get('downloadPath') || ''
  })

  ipcMain.handle('set-download-path', (_event, path) => {
    store.set('downloadPath', path)
  })

  ipcMain.handle('dialog:openDirectory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('save-file', async (_event, buffer, suggestedFilename) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      defaultPath: suggestedFilename
    })

    if (canceled || !filePath) return { success: false }

    try {
      const fs = await import('fs')
      fs.writeFileSync(filePath, Buffer.from(buffer))
      return { success: true, path: filePath }
    } catch (error) {
      console.error('Error saving file:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  })

  ipcMain.handle(
    'download-audio',
    async (
      event,
      audioUrl: string,
      outputDir: string,
      options?: { id?: string; limit?: string }
    ) => {
      return new Promise<string>(async (resolveDownload, reject) => {
        const now = new Date()
        const id = options?.id ?? uuid()
        const formattedDate = now.toISOString().replace(/:/g, '-').replace(/\..+/, '')
        let title = 'audio'

        try {
          title = await getVideoTitle(audioUrl)
        } catch (err) {
          console.error('Failed to fetch video title:', err)
        }

        const safeTitle = title.replace(/[<>:"/\\|?*&%=]+/g, '').replace(/\s+/g, '-')
        const finalName = `${safeTitle}__${formattedDate}__${id}.mp3`
        const outputPath = path.join(outputDir, finalName)

        const ytdlpPath = app.isPackaged
          ? path.join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'bin', 'yt-dlp.exe')
          : resolve(__dirname, '../../resources/bin/yt-dlp.exe')

        const rateLimit = options?.limit ?? 512

        const args = [
          audioUrl,
          '-x',
          '--audio-format',
          'mp3',
          '--audio-quality',
          '0',
          '-o',
          outputPath,
          '--progress',
          '-v',
          '--limit-rate',
          `${rateLimit}K`,
          '--no-warnings',
          '--no-abort-on-error',
        ]

        const yt = spawn(ytdlpPath, args)
        activeDownloads.set(id, yt)

        yt.stdout.on('data', (data) => {
          const text = data.toString()
          const match = text.match(
            /\[download\]\s+(\d+\.\d+)%.*?at\s+([\d.]+[KMG]?i?B\/s).*?ETA\s+(\d+:\d+)/
          )

          if (match) {
            const percent = parseFloat(match[1])
            const speed = match[2]
            const eta = match[3]
            event.sender.send('download-progress', {
              id,
              percent,
              speed,
              eta
            })
          }
          console.log(`[yt-dlp] ${text}`)
        })

        yt.stderr.on('data', (data) => {
          console.error(`[yt-dlp ERROR] ${data.toString()}`)
        })

        yt.on('close', (code) => {
          activeDownloads.delete(id)
          if (code === 0) {
            logDownload({
              url: audioUrl,
              title: finalName.replace('.mp3', ''),
              platform: 'audio',
              filePath: outputPath,
              fileSize: fs.existsSync(outputPath)
                ? fs.statSync(outputPath).size.toString()
                : undefined,
              fileType: 'audio/mpeg'
            })
            resolveDownload(outputPath)
          } else {
            reject(new Error(`yt-dlp exited with code ${code}`))
          }
        })

        yt.on('error', (err) => {
          activeDownloads.delete(id)
          reject(err)
        })
      })
    }
  )
  ipcMain.handle(
    'download-video',
    async (
      event,
      videoUrl: string,
      outputDir: string,
      options?: { id?: string; limit?: string }
    ) => {
      return new Promise<string>(async (resolveDownload, reject) => {
        const now = new Date()
        const id = options?.id ?? uuid()
        const formattedDate = now.toISOString().replace(/:/g, '-').replace(/\..+/, '')

        let title = 'video'
        try {
          title = await getVideoTitle(videoUrl)
        } catch (err) {
          console.error('Failed to fetch video title:', err)
        }

        const safeTitle = title.replace(/[<>:"/\\|?*&%=]+/g, '').replace(/\s+/g, '-')
        const finalName = `${safeTitle}__${formattedDate}__${id}.mp4`
        const outputPath = path.join(outputDir, finalName)

        const ffmpegPath = app.isPackaged
          ? path.join(
              process.resourcesPath,
              'app.asar.unpacked',
              'resources',
              'bin',
              'ffmpeg',
              'bin',
              'ffmpeg.exe'
            )
          : resolve(__dirname, '../../resources/bin/ffmpeg/bin/ffmpeg.exe')
        const ytdlpPath = app.isPackaged
          ? path.join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'bin', 'yt-dlp.exe')
          : resolve(__dirname, '../../resources/bin/yt-dlp.exe')

        const rateLimit = options?.limit ?? 512
        const args = [
          videoUrl,
          '-o',
          outputPath,
          '-f',
          'bv[ext=mp4]+ba[ext=m4a]',
          '--merge-output-format',
          'mp4',
          '--progress',
          '-v',
          '--ffmpeg-location',
          ffmpegPath,
          '--limit-rate',
          `${rateLimit}K`,
          '--no-warnings',
          '--no-abort-on-error'
        ]

        const yt = spawn(ytdlpPath, args)
        activeDownloads.set(id, yt)

        yt.stdout.on('data', (data) => {
          const text = data.toString()
          const match = text.match(
            /\[download\]\s+(\d+\.\d+)%.*?at\s+([\d.]+[KMG]?i?B\/s).*?ETA\s+(\d+:\d+)/
          )

          if (match) {
            const percent = parseFloat(match[1])
            const speed = match[2]
            const eta = match[3]
            event.sender.send('download-progress', {
              id,
              percent,
              speed,
              eta
            })
          }
          console.log(`[yt-dlp] ${text}`)
        })

        yt.stderr.on('data', (data) => {
          const errorText = data.toString()
          console.error(`[yt-dlp ERROR] ${errorText}`)
        })

        yt.on('close', (code) => {
          activeDownloads.delete(id)

          const isDownloaded = fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1024

          if (code === 0 || isDownloaded) {
            logDownload({
              url: videoUrl,
              title: finalName.replace('.mp4', ''),
              platform: 'video',
              filePath: outputPath,
              fileSize: isDownloaded ? fs.statSync(outputPath).size.toString() : undefined,
              fileType: 'video/mp4'
            })
            resolveDownload(outputPath)
          } else {
            reject(new Error(`yt-dlp exited with code ${code}`))
          }
        })

        yt.on('error', (err) => {
          activeDownloads.delete(id)
          reject(err)
        })
      })
    }
  )

  ipcMain.handle('set-download-limit', (_event, limit: string) => {
    store.set('downloadLimit', limit)
  })

  ipcMain.handle('get-download-limit', () => {
    return store.get('downloadLimit') || ''
  })

  ipcMain.handle('cancel-download', async (_event, id: string) => {
    const process = activeDownloads.get(id)
    if (process) {
      process.kill('SIGINT')
      activeDownloads.delete(id)
      return true
    }
    return false
  })

  ipcMain.handle('get-download-logs', () => {
    if (!fs.existsSync(logPath)) return []
    try {
      return JSON.parse(fs.readFileSync(logPath, 'utf8'))
    } catch {
      return []
    }
  })

  ipcMain.handle('open-path', async (_event, filePath: string) => {
    const { shell } = require('electron')
    try {
      await shell.showItemInFolder(filePath)

      return { success: true }
    } catch (err) {
      console.error('Failed to open path:', err)
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  ipcMain.handle('get-system-memory', () => {
    return {
      total: os.totalmem(),
      free: os.freemem()
    }
  })

  ipcMain.handle('get-disk-space', async () => {
    try {
      const pathToCheck = app.getPath('downloads')
      const { free, total } = await disk.check(pathToCheck)
      return { free, total }
    } catch (err) {
      console.error('Failed to get disk space:', err)
      return { free: 0, total: 0 }
    }
  })

  // Start window
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

function resolvePath(dirname: string, relativePath: string): string {
  return path.resolve(dirname, relativePath)
}
