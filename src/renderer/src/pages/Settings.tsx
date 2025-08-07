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
        setAppVersion('2.1.0')
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

  return (
    <div
      className={`flex justify-center min-h-screen ${
        isDarkMode
          ? 'bg-gray-900 text-white'
          : 'bg-gradient-to-br from-blue-100 via-purple-100 to-blue-50 text-gray-800'
      }`}
    >
      <div className="max-w-6xl w-full p-6 flex flex-col items-center gap-8">
        <div className={`text-center py-8 w-full ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Pengaturan</h1>
          </div>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Kelola preferensi dan konfigurasi aplikasi Anda
          </p>
        </div>
        <section
          className={`w-full border rounded-2xl p-6 shadow-md ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-md shadow-md">
              <Download className="w-5 h-5 text-white" />
            </div>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Pengaturan Unduhan
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span
                className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Lokasi Unduhan
              </span>
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm truncate max-w-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {downloadPath}
                </span>
                <button
                  onClick={handleChangePath}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg"
                >
                  <FolderOpen className="w-4 h-4 inline-block mr-1" /> Ubah
                </button>
              </div>
            </div>
            <DownloadLimit />
          </div>
        </section>
        <section
          className={`w-full border rounded-2xl p-6 shadow-md ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-md shadow-md">
              <HardDrive className="w-5 h-5 text-white" />
            </div>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Penyimpanan
            </h2>
          </div>
          <div className="space-y-4">
            <div style={{ marginBottom: '10px' }}>
              <div className="flex justify-between items-center mb-3">
                <span
                  className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Ruang Terpakai
                </span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {storageUsed?.gb || '0.00'} GB digunakan
                </span>
              </div>
              <div
                className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
              >
                <div
                  className="h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                  style={{ width: `${storageUsed?.percent || '0.00'}%`, marginBottom: '10px' }}
                ></div>
              </div>
            </div>
            <div>
              <button
                className={`w-full py-3 px-4 border-2 border-dashed rounded-lg text-sm font-medium ${
                  isDarkMode
                    ? 'border-gray-600 text-gray-300 hover:border-gray-500'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <HardDrive className="w-5 h-5 mx-auto mb-2" />
                Bersihkan Cache
              </button>
            </div>
          </div>
        </section>
        <section
          className={`w-full border rounded-2xl p-6 shadow-md ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-md shadow-md">
              <Info className="w-5 h-5 text-white" />
            </div>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Tentang Aplikasi
            </h2>
          </div>
          <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <li>
              <strong>Nama Aplikasi:</strong> {appName}
            </li>
            <li>
              <strong>Versi:</strong> {appVersion}
            </li>
            <li>
              <strong>Pembuat:</strong> {author}
            </li>
          </ul>
        </section>

        <section
          className={`w-full border rounded-2xl p-6 shadow-md ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              style={{ marginBottom: '10px' }}
              className="p-2 bg-gradient-to-r from-gray-700 to-gray-900 rounded-md shadow-md"
            >
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h2
              style={{ marginBottom: '10px' }}
              className={`text-xl font-bold  ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Tampilan
            </h2>
          </div>
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
          </button>
        </section>
      </div>
    </div>
  )
}
