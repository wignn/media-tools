import { HashRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './MainLayout'
import DownloadPage from './pages/Download'
import { Settings } from './pages/Settings'
import { Converter } from './pages/Converter'
import { VideoClip } from './pages/VideoClip'
import { ThemeProvider } from './contexts/theme-context'
import Download from './pages/YouTubeDownloader'
import EnhanceImage from './pages/EnhanceImage'

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
            <Route path="/enchan-image" element={<EnhanceImage />} />
          </Route>
        </Routes>
      </HashRouter>
    </ThemeProvider>
  )
}
