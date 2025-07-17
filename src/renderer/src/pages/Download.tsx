"use client"

import {
  DownloadIcon,
  Play,
  Music,
  FileText,
  ImageIcon,
  FolderOpen,
  Calendar,
  Search,
  Filter,
  ExternalLink,
} from "lucide-react"
import { type JSX, useEffect, useState } from "react"

interface DownloadLog {
  url: string
  title: string
  platform: string
  filePath: string
  downloadedAt: string
  fileSize?: string
  fileType?: string
}

function DownloadPage() {
  const [logs, setLogs] = useState<DownloadLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState("all")
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme")
    if (storedTheme === "dark") {
      setIsDarkMode(true)
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "theme") {
        setIsDarkMode(e.newValue === "dark")
      }
    }

    window.addEventListener("storage", handleStorageChange)

    window.api
      ?.getLogs()
      .then((data: DownloadLog[]) => {
        setLogs(data.reverse())
        setLoading(false)
      })
      .catch(console.error)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "youtube":
        return "🎥"
      case "instagram":
        return "📷"
      case "tiktok":
        return "🎵"
      case "twitter":
        return "🐦"
      case "facebook":
        return "📘"
      default:
        return "🌐"
    }
  }

  const getFileIcon = (filePath: string) => {
    const ext = filePath.split(".").pop()?.toLowerCase()
    switch (ext) {
      case "mp4":
      case "avi":
      case "mov":
        return <Play className="w-4 h-4 text-red-500" />
      case "mp3":
      case "wav":
      case "flac":
        return <Music className="w-4 h-4 text-green-500" />
      case "jpg":
      case "png":
      case "gif":
        return <ImageIcon className="w-4 h-4 text-blue-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.platform.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPlatform = selectedPlatform === "all" || log.platform.toLowerCase() === selectedPlatform
    return matchesSearch && matchesPlatform
  })

  const platforms = [...new Set(logs.map((log) => log.platform.toLowerCase()))]

  if (loading) {
    return (
      <div
        className={`p-12 min-h-screen transition-colors duration-300 ${
          isDarkMode ? "bg-gray-900" : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
        }`}
      >
        <div className="animate-pulse space-y-8">
          <div className={`h-8 rounded-lg w-1/3 ${isDarkMode ? "bg-gray-700" : "bg-slate-200"}`} />
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`${
                isDarkMode ? "bg-gray-800" : "bg-slate-100"
              } rounded-2xl p-8 transition-colors duration-300`}
            >
              <div className="space-y-4">
                <div className={`h-5 rounded w-3/4 ${isDarkMode ? "bg-gray-700" : "bg-slate-200"}`} />
                <div className={`h-4 rounded w-1/2 ${isDarkMode ? "bg-gray-700" : "bg-slate-200"}`} />
                <div className={`h-4 rounded w-2/3 ${isDarkMode ? "bg-gray-700" : "bg-slate-200"}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen p-12 transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900" : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        <div className="flex flex-col gap-12">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-200/50">
              <DownloadIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1
                className={`text-4xl font-bold mb-2 transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-slate-800"
                }`}
              >
                Riwayat Download
              </h1>
              <p
                className={`text-lg transition-colors duration-300 ${isDarkMode ? "text-gray-300" : "text-slate-600"}`}
              >
                Kelola dan lihat semua file yang telah didownload
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatBox
              icon={<DownloadIcon className="w-7 h-7 text-blue-600" />}
              label="Total Downloads"
              value={logs.length}
              color="blue"
              isDarkMode={isDarkMode}
            />
            <StatBox
              icon={<Play className="w-7 h-7 text-green-600" />}
              label="Video Files"
              value={logs.filter((l) => l.filePath.includes(".mp4")).length}
              color="green"
              isDarkMode={isDarkMode}
            />
            <StatBox
              icon={<Music className="w-7 h-7 text-purple-600" />}
              label="Audio Files"
              value={logs.filter((l) => l.filePath.includes(".mp3")).length}
              color="purple"
              isDarkMode={isDarkMode}
            />
            <StatBox
              icon={<Calendar className="w-7 h-7 text-orange-600" />}
              label="Today"
              value={logs.filter((l) => new Date(l.downloadedAt).toDateString() === new Date().toDateString()).length}
              color="orange"
              isDarkMode={isDarkMode}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="relative flex-1">
              <Search
                className={`absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors duration-300 ${
                  isDarkMode ? "text-gray-400" : "text-slate-400"
                }`}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari berdasarkan judul atau platform..."
                className={`w-full pl-14 pr-6 py-4 text-lg rounded-3xl shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-300 ${
                  isDarkMode
                    ? "bg-gray-800/70 border border-gray-700/50 text-white placeholder-gray-400"
                    : "bg-white/70 border border-white/50 text-black placeholder-slate-400"
                }`}
              />
            </div>
            <div className="relative">
              <Filter
                className={`absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors duration-300 ${
                  isDarkMode ? "text-gray-400" : "text-slate-400"
                }`}
              />
              <select
                title="Filter by Platform"
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className={`pl-14 pr-10 py-4 text-lg rounded-3xl shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[200px] transition-colors duration-300 ${
                  isDarkMode
                    ? "bg-gray-800/70 border border-gray-700/50 text-white"
                    : "bg-white/70 border border-white/50 text-black"
                }`}
              >
                <option value="all">Semua Platform</option>
                {platforms.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-20">
            <div
              className={`w-32 h-32 rounded-3xl mx-auto flex items-center justify-center mb-8 transition-colors duration-300 ${
                isDarkMode ? "bg-gray-700" : "bg-gradient-to-br from-slate-200 to-slate-300"
              }`}
            >
              <DownloadIcon
                className={`w-16 h-16 transition-colors duration-300 ${
                  isDarkMode ? "text-gray-400" : "text-slate-500"
                }`}
              />
            </div>
            <h3
              className={`text-2xl font-semibold mb-4 transition-colors duration-300 ${
                isDarkMode ? "text-white" : "text-slate-700"
              }`}
            >
              {searchTerm || selectedPlatform !== "all" ? "Tidak ada hasil" : "Belum ada download"}
            </h3>
            <p
              className={`text-lg mb-8 transition-colors duration-300 ${
                isDarkMode ? "text-gray-400" : "text-slate-500"
              }`}
            >
              {searchTerm || selectedPlatform !== "all"
                ? "Coba ubah kata kunci pencarian atau filter"
                : "Mulai download video atau audio pertama Anda"}
            </p>
            {(searchTerm || selectedPlatform !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedPlatform("all")
                }}
                className={`px-8 py-4 text-white rounded-3xl font-semibold shadow-xl text-lg transition-all duration-200 ${
                  isDarkMode
                    ? "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800"
                    : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                }`}
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredLogs.map((log, index) => (
              <div
                key={index}
                className={`group backdrop-blur-xl rounded-3xl border shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden ${
                  isDarkMode ? "bg-gray-800/70 border-gray-700/50" : "bg-white/70 border-white/50"
                }`}
              >
                <div className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div
                      className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-colors duration-300 ${
                        isDarkMode ? "bg-gray-700" : "bg-gradient-to-br from-indigo-100 to-purple-100"
                      }`}
                    >
                      <span className="text-2xl">{getPlatformIcon(log.platform)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-bold text-xl mb-2 line-clamp-2 transition-colors duration-300 ${
                          isDarkMode ? "text-white" : "text-slate-800"
                        }`}
                      >
                        {log.title}
                      </h3>
                      <div
                        className={`flex items-center gap-3 text-sm transition-colors duration-300 ${
                          isDarkMode ? "text-gray-400" : "text-slate-500"
                        }`}
                      >
                        <span
                          className={`px-3 py-1 rounded-xl font-medium transition-colors duration-300 ${
                            isDarkMode ? "bg-indigo-900/30 text-indigo-300" : "bg-indigo-100 text-indigo-700"
                          }`}
                        >
                          {log.platform.toUpperCase()}
                        </span>
                        <span>•</span>
                        <span>{new Date(log.downloadedAt).toLocaleDateString("id-ID")}</span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`rounded-3xl p-6 mb-6 transition-colors duration-300 ${
                      isDarkMode ? "bg-gray-700/80" : "bg-slate-50/80"
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-2">
                      {getFileIcon(log.filePath)}
                      <span
                        className={`text-base font-medium truncate transition-colors duration-300 ${
                          isDarkMode ? "text-gray-200" : "text-slate-700"
                        }`}
                      >
                        {log.filePath.split("/").pop() || log.filePath.split("\\").pop()}
                      </span>
                    </div>
                    <p
                      className={`text-sm truncate transition-colors duration-300 ${
                        isDarkMode ? "text-gray-400" : "text-slate-500"
                      }`}
                    >
                      📁 {log.filePath}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => window.api?.openPath(log.filePath)}
                      className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 text-white rounded-3xl font-semibold shadow-xl text-lg transition-all duration-200 ${
                        isDarkMode
                          ? "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800"
                          : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                      }`}
                    >
                      <FolderOpen className="w-5 h-5" />
                      Buka File
                    </button>
                    <button
                      title="Buka di Browser"
                      onClick={() => window.open(log.url, "_blank")}
                      className={`px-6 py-4 rounded-3xl font-semibold shadow-lg transition-all duration-200 border ${
                        isDarkMode
                          ? "bg-gray-700/80 text-gray-300 border-gray-600 hover:bg-gray-600/80 hover:text-white"
                          : "bg-white/80 text-slate-700 border-slate-200 hover:bg-white"
                      }`}
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                    isDarkMode
                      ? "bg-gradient-to-r from-indigo-900/5 to-purple-900/5"
                      : "bg-gradient-to-r from-indigo-500/5 to-purple-500/5"
                  }`}
                />
              </div>
            ))}
          </div>
        )}
        {filteredLogs.length > 0 && (
          <div className="mt-12 text-center">
            <p className={`text-lg transition-colors duration-300 ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}>
              Menampilkan {filteredLogs.length} dari {logs.length} download
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatBox({
  icon,
  label,
  value,
  color,
  isDarkMode,
}: {
  icon: JSX.Element
  label: string
  value: number
  color: string
  isDarkMode: boolean
}) {
  return (
    <div
      className={`backdrop-blur-xl rounded-3xl p-6 border shadow-xl transition-colors duration-300 ${
        isDarkMode ? "bg-gray-800/70 border-gray-700/50" : "bg-white/70 border-white/50"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
            isDarkMode ? `bg-${color}-900/30` : `bg-${color}-100`
          }`}
        >
          {icon}
        </div>
        <div>
          <p
            className={`text-3xl font-bold transition-colors duration-300 ${
              isDarkMode ? "text-white" : "text-slate-800"
            }`}
          >
            {value}
          </p>
          <p
            className={`text-sm mt-1 transition-colors duration-300 ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}
          >
            {label}
          </p>
        </div>
      </div>
    </div>
  )
}

export default DownloadPage
