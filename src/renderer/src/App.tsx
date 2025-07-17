import { HashRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './MainLayout'
import ModernDesktopApp from './pages/youtube-downloader'
import DownloadPage from './pages/Download'
import { Settings } from './pages/Setting'
import { ThemeProvider } from './contexts/theme-context'

export default function App() {
  return (
    <ThemeProvider>
<HashRouter>
  <Routes>
    <Route element={<MainLayout />}>
      <Route path="/" element={<ModernDesktopApp />} />
      <Route path="/download" element={<DownloadPage />} />
      <Route path="/settings" element={<Settings />} />
    </Route>
  </Routes>
</HashRouter>

  </ThemeProvider>
  )
}
