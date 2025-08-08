import { useEffect, useState } from 'react'
import {
  FolderOpen,
  Info,
  Moon,
  Sun,
  Download,
  HardDrive,
  Palette,
  SettingsIcon
} from 'lucide-react'
import { useTheme } from '../contexts/theme-context'
import { DownloadLimit } from '@renderer/components/DownloadLimit'

export function Settings() {
  const [downloadPath, setDownloadPath] = useState('')
  const [appVersion, setAppVersion] = useState('')
  const [appName, setAppName] = useState('')
  const [author, setAuthor] = useState('')
  const { isDarkMode, toggleTheme } = useTheme()
  const [storageUsed, setStorageUsed] = useState<{
    gb: string
    percent: string
  }>()

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const path = await window.api?.getDownloadPath()
        if (path) setDownloadPath(path)
        setAppVersion('2.2.0')
        setAppName('App Downloader')
        setAuthor('Wign')
        const diskSpace = await window.api?.getDiskSpace()
        const used = diskSpace.total - diskSpace.free
        setStorageUsed({
          gb: (used / 1024 ** 3).toFixed(2),
          percent: ((used / diskSpace.total) * 100).toFixed(2)
        })
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }
    fetchSettings()
  }, [])

  const handleChangePath = async () => {
    try {
      const newPath = await window.api?.openDirectory()
      if (newPath) {
        await window.api?.setDownloadPath(newPath)
        setDownloadPath(newPath)
      }
    } catch (error) {
      console.error('Error changing path:', error)
    }
  }

  const cardBase = `w-full border rounded-2xl p-6 shadow-md transition-colors duration-200 ${
    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  }`

  return (
    <div
      className={`flex justify-center min-h-screen px-4 py-8 ${
        isDarkMode
          ? 'bg-gray-900 text-white'
          : 'bg-gradient-to-br from-blue-100 via-purple-100 to-blue-50 text-gray-800'
      }`}
    >
      <div className="max-w-5xl w-full flex flex-col items-center gap-8">
        <div className="text-center w-full">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            Manage your application preferences and configuration
          </p>
        </div>
        <section className={cardBase}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-md shadow-md">
              <Download className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold">Download Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <span className="text-sm font-medium">Download Location</span>
              <div className="flex items-center gap-3">
                <span className="text-sm truncate max-w-xs opacity-80">
                  {downloadPath}
                </span>
                <button
                  onClick={handleChangePath}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
                >
                  <FolderOpen className="w-4 h-4 inline-block mr-1" /> Change
                </button>
              </div>
            </div>
            <DownloadLimit />
          </div>
        </section>
        <section className={cardBase}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-md shadow-md">
              <HardDrive className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold">Storage</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium">Used Space</span>
                <span className="text-sm opacity-80">
                  {storageUsed?.gb || '0.00'} GB used
                </span>
                <br/>
              </div>
              <div
                className={`w-full h-2 rounded-full ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              >
                <div
                  className="h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                  style={{ width: `${storageUsed?.percent || '0.00'}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className={cardBase}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-md shadow-md">
              <Info className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold">About Application</h2>
          </div>
  
          <ul className="space-y-2 text-sm opacity-90 mt-5">
            <li>
              <strong>App Name:</strong> {appName}
            </li>
            <li>
              <strong>Version:</strong> {appVersion}
            </li>
            <li>
              <strong>Author:</strong> {author}
            </li>
          </ul>
        </section>

        <section className={cardBase}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-gray-700 to-gray-900 rounded-md shadow-md">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold">Appearance</h2>
          </div>
          <br/>
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </section>
      </div>
    </div>
  )
}
