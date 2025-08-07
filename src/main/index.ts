import { app, ipcMain, dialog, BrowserWindow, shell } from 'electron'
import { join, resolve } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs'
import path from 'path'
import { ChildProcess, spawn } from 'child_process'
import disk from 'diskusage'
import os, { tmpdir } from 'os'
import Store from 'electron-store'
import { v4 as uuid } from 'uuid'

const store = new Store()

let mainWindow: BrowserWindow | null = null

const logPath = path.join(app.getPath('userData'), 'downloads.json')
const activeDownloads = new Map<string, ChildProcess>()

interface DownloadInfo {
  url: string
  title: string
  platform: string
  filePath: string
  fileSize?: string
  fileType?: string
}



const getBinaryPaths = () => {
  const basePath = app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'bin')
    : resolve(__dirname, '../../resources/bin')

  return {
    ytdlp: path.join(basePath, 'yt-dlp.exe'),
    ffmpeg: path.join(basePath, 'ffmpeg', 'bin', 'ffmpeg.exe'),
    realsr: path.join(basePath, 'realsr-ncnn-vulkan', 'realsr-ncnn-vulkan.exe')
  }
}

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'


const logDownload = (info: DownloadInfo): void => {
  try {
    let logs: DownloadInfo[] = []

    if (fs.existsSync(logPath)) {
      try {
        const data = fs.readFileSync(logPath, 'utf8')
        logs = JSON.parse(data)
      } catch (parseError) {
        console.warn('Failed to parse existing logs, starting fresh:', parseError)
        logs = []
      }
    }

    logs.push({
      ...info,
      downloadedAt: new Date().toISOString()
    } as DownloadInfo & { downloadedAt: string })

    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2), 'utf8')
  } catch (error) {
    console.error('Failed to log download:', error)
  }
}


// Optimized video title fetching with caching
const titleCache = new Map<string, string>()

const getVideoTitle = async (url: string): Promise<string> => {
  // Check cache first for performance
  if (titleCache.has(url)) {
    return titleCache.get(url)!
  }

  return new Promise((resolve, reject) => {
    const { ytdlp } = getBinaryPaths()

    const args = [
      '-j',
      '--user-agent', USER_AGENT,
      '--no-cookies',
      '--no-check-certificates',
      '--no-warnings',
      '--ignore-errors',
      '--skip-download',
      '--extractor-args', 'youtube:player_client=web',
      '--retries', '3',
      '--socket-timeout', '30',
      url
    ]

    const yt = spawn(ytdlp, args)
    let json = ''

    yt.stdout.on('data', (data) => {
      json += data.toString()
    })

    yt.stderr.on('data', (data) => {
      console.error('[yt-dlp STDERR]', data.toString())
    })

    yt.on('close', (code) => {
      if (code === 0) {
        try {
          const info = JSON.parse(json)
          const title = info.title || 'Unknown Title'
          titleCache.set(url, title)
          resolve(title)
        } catch (e) {
          reject(new Error('Failed to parse yt-dlp JSON output: ' + e))
        }
      } else {
        reject(new Error(`yt-dlp exited with error code ${code}`))
      }
    })

    yt.on('error', (error) => {
      reject(new Error(`yt-dlp spawn error: ${error.message}`))
    })
  })
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
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

  mainWindow!.on('ready-to-show', () => {
    mainWindow!.show()
  })

  mainWindow!.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow!.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow!.loadFile(join(__dirname, '../renderer/index.html'))
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

  ipcMain.handle('dialog:selectVideoFiles', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Video Files', extensions: ['mp4'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    return result.canceled ? null : result.filePaths
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
          '--user-agent',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          '--add-header',
          'Accept-Language:en-US,en;q=0.9',
          '--add-header',
          'Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          '--no-check-certificates',
          '--prefer-insecure',
          '--force-ipv4',
          '--retries',
          '3',
          '--fragment-retries',
          '3',
          '--progress',
          '-v',
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
          '--user-agent',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          '--add-header',
          'Accept-Language:en-US,en;q=0.9',
          '--add-header',
          'Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          '--no-check-certificates',
          '--prefer-insecure',
          '--force-ipv4',
          '--retries',
          '3',
          '--fragment-retries',
          '3',
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

  ipcMain.handle(
    'convert-video-to-audio',
    async (event, videoPath: string, conversionId: string) => {
      return new Promise<{ outputPath: string }>((resolve, reject) => {
        console.log('Converting video:', videoPath, 'ID:', conversionId)

        if (!videoPath || typeof videoPath !== 'string') {
          reject(new Error('Invalid video path provided'))
          return
        }

        const inputPath = videoPath
        const outputDir = path.dirname(inputPath)
        const baseName = path.basename(inputPath, '.mp4')
        const outputPath = path.join(outputDir, `${baseName}.mp3`)

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
          : path.resolve(__dirname, '../../resources/bin/ffmpeg/bin/ffmpeg.exe')

        const args = [
          '-i',
          inputPath,
          '-vn',
          '-acodec',
          'libmp3lame',
          '-ab',
          '192k',
          '-ar',
          '44100',
          '-y',
          outputPath
        ]

        console.log('FFmpeg command:', ffmpegPath, args)

        const ffmpeg = spawn(ffmpegPath, args)
        activeDownloads.set(conversionId, ffmpeg)

        ffmpeg.stdout.on('data', (data) => {
          console.log(`[FFmpeg] ${data.toString()}`)
        })

        ffmpeg.stderr.on('data', (data) => {
          const text = data.toString()
          console.log(`[FFmpeg] ${text}`)

          // Parse progress from FFmpeg output
          const timeMatch = text.match(/time=(\d{2}):(\d{2}):(\d{2}.\d{2})/)
          if (timeMatch) {
            // Send progress update to renderer
            event.sender.send('conversion-progress', {
              id: conversionId,
              progress: 50 
            })
          }
        })

        ffmpeg.on('close', (code) => {
          activeDownloads.delete(conversionId)
          console.log(`FFmpeg finished with code: ${code}`)
          if (code === 0) {
            resolve({ outputPath })
          } else {
            reject(new Error(`FFmpeg exited with code ${code}`))
          }
        })

        ffmpeg.on('error', (err) => {
          activeDownloads.delete(conversionId)
          console.error('FFmpeg error:', err)
          reject(err)
        })
      })
    }
  )

  ipcMain.handle('get-video-title', async (_event, videoUrl: string) => {
    return getVideoTitle(videoUrl)
  })
  ipcMain.handle(
    'clip-video',
    async (event, videoUrl: string, startTime: string, endTime: string, clipId: string) => {
      return new Promise<{ outputPath: string }>(async (resolve, reject) => {
        console.log(
          'Clipping video:',
          videoUrl,
          'Start:',
          startTime,
          'End:',
          endTime,
          'ID:',
          clipId
        )

        try {
          const downloadPath = (store.get('downloadPath') as string) || app.getPath('downloads')
          const now = new Date()
          const formattedDate = now.toISOString().replace(/:/g, '-').replace(/\..+/, '')

          let title = 'video-clip'
          try {
            title = await getVideoTitle(videoUrl)
          } catch (err) {
            console.error('Failed to fetch video title:', err)
          }

          const safeTitle = title.replace(/[<>:"/\\|?*&%=]+/g, '').replace(/\s+/g, '-')
          const finalName = `${safeTitle}_clip_${startTime.replace(/:/g, '-')}-${endTime.replace(/:/g, '-')}_${formattedDate}_${clipId}.mp4`
          const outputPath = path.join(downloadPath, finalName)

          const ytdlpPath = app.isPackaged
            ? path.join(
                process.resourcesPath,
                'app.asar.unpacked',
                'resources',
                'bin',
                'yt-dlp.exe'
              )
            : path.resolve(__dirname, '../../resources/bin/yt-dlp.exe')

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
            : path.resolve(__dirname, '../../resources/bin/ffmpeg/bin/ffmpeg.exe')

          // Convert time format to seconds for yt-dlp
          const convertTimeToSeconds = (time: string): number => {
            const parts = time.split(':').map(Number)
            if (parts.length === 2) {
              return parts[0] * 60 + parts[1] // MM:SS
            } else if (parts.length === 3) {
              return parts[0] * 3600 + parts[1] * 60 + parts[2] // HH:MM:SS
            }
            return 0
          }

          const startSeconds = convertTimeToSeconds(startTime)
          const endSeconds = convertTimeToSeconds(endTime)
          const duration = endSeconds - startSeconds

          const args = [
            videoUrl,
            '-o',
            outputPath,
            '-f',
            'bestvideo[ext=mp4][height<=1080]+bestaudio[ext=m4a]/best[ext=mp4][height<=1080]/best',
            '--merge-output-format',
            'mp4',
            '--external-downloader',
            'ffmpeg',
            '--external-downloader-args',
            `ffmpeg:-ss ${startSeconds} -t ${duration} -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 320k -avoid_negative_ts make_zero`,
            '--ffmpeg-location',
            ffmpegPath,
            '--user-agent',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            '--add-header',
            'Accept-Language:en-US,en;q=0.9',
            '--add-header',
            'Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            '--no-check-certificates',
            '--prefer-insecure',
            '--force-ipv4',
            '--retries',
            '3',
            '--fragment-retries',
            '3',
            '--progress',
            '-v',
            '--no-warnings',
            '--no-abort-on-error',
            '--embed-metadata',
            '--write-thumbnail',
            '--no-overwrites'
          ]

          console.log('yt-dlp command:', ytdlpPath, args)

          const yt = spawn(ytdlpPath, args)
          activeDownloads.set(clipId, yt)

          yt.stdout.on('data', (data) => {
            const text = data.toString()
            console.log(`[yt-dlp] ${text}`)

            // Parse download progress from yt-dlp
            const downloadMatch = text.match(
              /\[download\]\s+(\d+\.\d+)%.*?at\s+([\d.]+[KMG]?i?B\/s).*?ETA\s+(\d+:\d+)/
            )

            if (downloadMatch) {
              const percent = parseFloat(downloadMatch[1])
              const speed = downloadMatch[2]
              const eta = downloadMatch[3]
              event.sender.send('clip-progress', {
                id: clipId,
                percent: Math.min(percent * 0.7, 70), // Download is 70% of total process
                speed,
                eta,
                stage: 'downloading'
              })
            }
          })

          yt.stderr.on('data', (data) => {
            const text = data.toString()
            console.error(`[yt-dlp ERROR] ${text}`)

            // Parse ffmpeg progress from stderr - Updated regex to match actual output format
            const ffmpegMatch = text.match(
              /frame=\s*(\d+)\s+fps=\s*([\d.]+)\s+q=([\d.-]+)\s+size=\s*(\w+)\s+time=(\d{2}:\d{2}:\d{2}\.\d{2})\s+bitrate=([\d.]+\w+\/s)\s+speed=([\d.]+x)/
            )

            if (ffmpegMatch) {
              const frame = parseInt(ffmpegMatch[1])
              const size = ffmpegMatch[4]
              const timeProcessed = ffmpegMatch[5]
              const speed = ffmpegMatch[7]

              // Convert time to seconds for progress calculation
              const [hours, minutes, seconds] = timeProcessed.split(':')
              const processedSeconds =
                parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseFloat(seconds)

              // Calculate progress based on duration
              const totalDuration = duration // Use the duration we calculated earlier

              let progressPercent = 0
              if (totalDuration > 0) {
                // Calculate progress as percentage of total duration processed
                progressPercent = Math.min((processedSeconds / totalDuration) * 100, 100)
              } else {
                // Fallback: estimate progress based on frame count (rough estimate)
                progressPercent = Math.min((frame / 300) * 100, 100) // Assume ~300 frames for unknown duration
              }

              console.log(
                `Progress: ${progressPercent.toFixed(1)}% - Frame: ${frame}, Time: ${timeProcessed}, Duration: ${totalDuration}s`
              )

              event.sender.send('clip-progress', {
                id: clipId,
                percent: Math.round(progressPercent),
                frame,
                size,
                timeProcessed,
                speed,
                stage: 'processing'
              })
            }
          })

          yt.on('close', (code) => {
            activeDownloads.delete(clipId)
            console.log(`yt-dlp finished with code: ${code}`)

            const isDownloaded = fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1024

            if (code === 0 || isDownloaded) {
              logDownload({
                url: videoUrl,
                title: finalName.replace('.mp4', ''),
                platform: 'video-clip',
                filePath: outputPath,
                fileSize: isDownloaded ? fs.statSync(outputPath).size.toString() : undefined,
                fileType: 'video/mp4'
              })
              resolve({ outputPath })
            } else {
              reject(new Error(`yt-dlp exited with code ${code}`))
            }
          })

          yt.on('error', (err) => {
            activeDownloads.delete(clipId)
            console.error('yt-dlp error:', err)
            reject(err)
          })
        } catch (error) {
          reject(error)
        }
      })
    }
  )
ipcMain.handle(
  'enhance-image',
  async (event, fileBufferArray: number[], fileName: string, options: any, processId: string) => {
    let tempInputPath: string | null = null;
    let outputPath: string | null = null;
    let proc: any = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let stdoutListener: any = null;
    let stderrListener: any = null;
    let closeListener: any = null;
    let errorListener: any = null;

    try {
      console.log('Received enhance request:', {
        fileName,
        bufferSize: fileBufferArray.length,
        options,
        processId
      });

      event.sender.send('enhance-progress', { id: processId, percent: 0 });

      // Convert array back to Buffer
      const fileBuffer = Buffer.from(fileBufferArray);

      // Create temporary directory if it doesn't exist
      const tempDir = path.join(tmpdir(), 'enhance-temp');
      await fs.promises.mkdir(tempDir, { recursive: true });

      // Create temporary input file
      tempInputPath = path.join(tempDir, `input-${processId}-${fileName}`);

      // Write the buffer to temporary file
      await fs.promises.writeFile(tempInputPath, fileBuffer);
      console.log('Temporary input file created:', tempInputPath);

      const binaryPath = app.isPackaged
        ? path.join(
            process.resourcesPath,
            'app.asar.unpacked',
            'resources',
            'bin',
            'realsr-ncnn-vulkan',
            'realsr-ncnn-vulkan.exe'
          )
        : path.resolve(
            __dirname,
            '../../resources/bin/realsr-ncnn-vulkan',
            'realsr-ncnn-vulkan.exe'
          );

      const downloadPath = (store.get('downloadPath') as string) || app.getPath('downloads');
      outputPath = path.join(downloadPath, `enhanced-${processId}.png`);

      // Check if binary exists
      try {
        await fs.promises.access(binaryPath);
        console.log('Binary exists and is accessible');
      } catch (error) {
        console.error('Binary not accessible:', error);
        throw new Error(`Enhancement binary not found at: ${binaryPath}`);
      }

      return new Promise((resolve, reject) => {
        const args = ['-i', tempInputPath!, '-o', outputPath!, '-m', 'models-DF2K'];

        proc = spawn(binaryPath, args);
        let processCompleted = false;

        // Comprehensive cleanup function
        const cleanup = async (forceKill: boolean = false) => {
          try {
            // Remove all event listeners to prevent memory leaks
            if (proc && !proc.killed) {
              if (stdoutListener) {
                proc.stdout?.removeListener('data', stdoutListener);
                stdoutListener = null;
              }
              if (stderrListener) {
                proc.stderr?.removeListener('data', stderrListener);
                stderrListener = null;
              }
              if (closeListener) {
                proc.removeListener('close', closeListener);
                closeListener = null;
              }
              if (errorListener) {
                proc.removeListener('error', errorListener);
                errorListener = null;
              }

              // Force kill process if needed
              if (forceKill && !processCompleted) {
                console.log('Force killing process...');
                proc.kill('SIGKILL');
                // Give it a moment to die
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            }

            // Clear timeout
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }

            // Clean up temporary input file
            if (tempInputPath) {
              try {
                await fs.promises.unlink(tempInputPath);
                console.log('Cleaned up input file:', tempInputPath);
              } catch (unlinkError) {
                console.error('Error cleaning up input file:', unlinkError);
              }
            }

            // Force garbage collection of large buffers
            if (global.gc) {
              global.gc();
            }
          } catch (cleanupError) {
            console.error('Error during cleanup:', cleanupError);
          }
        };

        // Create event listeners as named functions to ensure proper removal
        stdoutListener = (data: Buffer) => {
          const lines = data.toString().split(/\r?\n/);
          for (const line of lines) {
            const trimmed = line.trim();
            console.log('[stdout]', trimmed);

            // Check if string contains progress
            const match = trimmed.match(/^(\d{1,3})[,.]?(\d{1,2})?%$/);
            if (match) {
              const percent = parseInt(match[1]);
              console.log(`Progress: ${percent}%`);

              event.sender.send('enhance-progress', {
                id: processId,
                percent
              });
            }
          }
        };

        stderrListener = (data: Buffer) => {
          const message = data.toString();
          console.error('[stderr]', message);

          // Parse progress from stderr as well (realsr-ncnn-vulkan outputs progress to stderr)
          const lines = message.split(/\r?\n/);
          for (const line of lines) {
            const trimmed = line.trim();

            // Look for percentage patterns like "97,92%" or "98.33%"
            const match = trimmed.match(/(\d{1,3})[,.](\d{1,2})%/) || trimmed.match(/(\d{1,3})%/);
            if (match) {
              let percent = parseInt(match[1]);
              if (match[2]) {
                // Handle decimal part for more precise progress
                const decimal = parseInt(match[2]);
                percent = Math.round(percent + decimal / 100);
              }

              const progressData = {
                id: processId,
                percent: Math.min(percent, 99) // Cap at 99% until completion
              };

              event.sender.send('enhance-progress', progressData);
            }
          }
        };

        closeListener = async (code: number) => {
          console.log(`Process exited with code: ${code}`);

          // Send final 100% progress on successful completion
          if (code === 0) {
            const finalProgressData = {
              id: processId,
              percent: 100
            };
            event.sender.send('enhance-progress', finalProgressData);
          }

          // Mark process as completed
          processCompleted = true;

          // Always cleanup
          await cleanup();

          if (code === 0) {
            try {
              // Check if output file exists
              if (outputPath) {
                await fs.promises.access(outputPath);

                // Read the output file and convert to base64 for display
                const outputBuffer = await fs.promises.readFile(outputPath);
                const base64Data = `data:image/png;base64,${outputBuffer.toString('base64')}`;

                // console.log('Enhancement completed successfully');
                // console.log('Output file size:', outputBuffer.length);
                // console.log('Output file location:', outputPath);

                resolve({
                  success: true,
                  output: base64Data,
                  filePath: outputPath
                });
              } else {
                reject(new Error('Output path not defined'));
              }
            } catch (readError) {
              console.error('Error reading output file:', readError);
              reject(new Error('Enhancement completed but output file could not be read'));
            }
          } else {
            reject(new Error(`Enhancement process failed with exit code ${code}`));
          }
        };

        errorListener = async (error: Error) => {
          console.error('Process spawn error:', error);
          processCompleted = true;
          await cleanup();
          reject(new Error(`Failed to start enhancement process: ${error.message}`));
        };

        // Attach event listeners
        if (proc.stdout) {
          proc.stdout.on('data', stdoutListener);
        }
        if (proc.stderr) {
          proc.stderr.on('data', stderrListener);
        }
        proc.on('close', closeListener);
        proc.on('error', errorListener);

        // Set a timeout to prevent hanging
        timeoutId = setTimeout(async () => {
          if (!processCompleted) {
            console.log('Process timeout, killing...');
            processCompleted = true;
            await cleanup(true);
            reject(new Error('Enhancement process timed out'));
          }
        }, 300000 * 2); // 5 minutes timeout

        // Handle process interruption
        process.once('beforeExit', async () => {
          if (!processCompleted) {
            console.log('App closing, cleaning up enhance process...');
            await cleanup(true);
          }
        });
      });
    } catch (error) {
      if (tempInputPath) {
        try {
          await fs.promises.unlink(tempInputPath);
        } catch (unlinkError) {
          console.error('Error cleaning up temp file on error:', unlinkError);
        }
      }
      
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      console.error('Error in enhance-image handler:', error);
      throw error;
    }
  }
);
  // Start window
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

