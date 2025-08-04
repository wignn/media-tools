import { HashRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './MainLayout'
import DownloadPage from './pages/Download'
import { Settings } from './pages/Setting'
import { Converter } from './pages/Converter'
import { VideoClip } from './pages/VideoClip'
import { ThemeProvider } from './contexts/theme-context'
import Download from './pages/youtube-downloader'

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Download />} />
            <Route path="/download" element={<DownloadPage />} />
            <Route path="/converter" element={<Converter />} />
            <Route path="/clip" element={<VideoClip />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </HashRouter>
    </ThemeProvider>
  )
}
