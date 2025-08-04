# Wign MediaTool

<div align="center">

![Logo](https://raw.githubusercontent.com/wignn/video-downloader/main/resources/logo.png)

**video downloader for YouTube, Instagram, Facebook**

[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](package.json)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-35.1.5-9feaf9.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Development](#development) • [Contributing](#contributing)

</div>

---

## Features

### Core Functionality
- **Multi-Platform Support** - Download from YouTube, Instagram, Twitter, Facebook
- **Format Options** - Choose between video (MP4) or audio-only (MP3) downloads
- **Video Clipping** - Extract specific segments from videos with precision
- **Format Conversion** - Convert videos to different formats
- **Custom Download Path** - Choose where to save your files

### Modern UI/UX
- **Dark/Light Theme** - Beautiful themes with smooth transitions
- **Glassmorphism Design** - Modern transparent design elements
- **Responsive Layout** - Works perfectly on any screen size
- **Real-time Progress** - Live download progress with speed and ETA
- **Queue Management** - Download multiple files with queue system

### Advanced Features
- **Anti-blocking** - Bypass platform restrictions
- **Download Statistics** - Track your download history
- **Rate Limiting** - Control download speed to avoid throttling
- **Search** - Filter and search through download history
- **Status Indicators** - Visual feedback for all operations

## Installation

### Prerequisites
- **Node.js** 18.0.0 or higher
- **npm** or **yarn** package manager
- **FFmpeg** (bundled with the app)
- **yt-dlp** (bundled with the app)

### Download Pre-built Binaries

#### Windows
```bash
# Download from releases page
https://github.com/wignn/app-video-downloader/releases/latest
```

> **Note**: This application is currently only available for Windows. macOS and Linux support may be added in future releases.

### Build from Source

```bash
# Clone the repository
git clone https://github.com/wignn/app-video-downloader.git
cd app-video-downloader

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Build Windows executable
npm run build:win
```

> **Development Note**: While the source code can be built on other platforms, the final executable is optimized for Windows only.

## Usage

### Basic Download

1. **Launch the application**
2. **Paste your video URL** in the input field
3. **Select format** (MP4 for video, MP3 for audio)
4. **Choose download location** (optional)
5. **Click Download** to start

### Video Clipping

1. **Navigate to Video Clip tab**
2. **Paste video URL**
3. **Set start and end times** (format: HH:MM:SS)
4. **Configure quality settings**
5. **Start clipping process**

### Format Conversion

1. **Go to Converter tab**
2. **Upload or drag & drop your file**
3. **Select target format**
4. **Choose quality settings**
5. **Convert your file**

### Managing Downloads

- **View History**: Check all your past downloads in the Downloads tab
- **Search & Filter**: Find specific downloads using search and platform filters
- **Queue Management**: Add multiple downloads to queue for batch processing
- **Retry Failed**: Easily retry failed downloads with one click

## Development

### Tech Stack

- **Frontend**: React 19.1.0 + TypeScript
- **Desktop Framework**: Electron 35.1.5
- **Build Tool**: Vite 6.2.6 + electron-vite
- **Styling**: TailwindCSS 4.1.11 + Custom CSS
- **State Management**: Zustand 5.0.6
- **Icons**: Lucide React 0.525.0
- **Video Processing**: FFmpeg + yt-dlp

### Project Structure

```
app-downloader/
├── src/
│   ├── main/                 # Electron main process
│   │   └── index.ts          # Main process entry point
│   ├── preload/              # Preload scripts
│   │   └── index.ts          # IPC bridge
│   └── renderer/             # React frontend
│       ├── src/
│       │   ├── components/   # Reusable UI components
│       │   ├── contexts/     # React contexts
│       │   ├── pages/        # Page components
│       │   ├── store/        # State management
│       │   ├── types/        # TypeScript definitions
│       │   └── utils/        # Utility functions
│       └── index.html        # HTML entry point
├── resources/                # External binaries
│   ├── bin/
│   │   ├── yt-dlp.exe       # Video downloader
│   │   └── ffmpeg/          # Video processor
├── build/                    # Build assets
└── out/                      # Build output
```

### Development Commands

```bash
# Start development server
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Code formatting
npm run format

# Build for production
npm run build

# Build without packaging
npm run build:unpack
```

### API Reference

#### Main Process API

```typescript
// Download video
window.api.downloadVideo(url: string, path: string, options: DownloadOptions)

// Download audio
window.api.downloadAudio(url: string, path: string, options: DownloadOptions)

// Clip video
window.api.clipVideo(url: string, startTime: string, endTime: string, options: ClipOptions)

// Convert video
window.api.convertVideo(inputPath: string, outputPath: string, options: ConvertOptions)

// Get download logs
window.api.getLogs(): Promise<DownloadLog[]>
```

#### Events

```typescript
// Progress updates
window.api.on('download-progress', (data) => {
  console.log(data.percent, data.speed, data.eta)
})

// Download completion
window.api.on('download-complete', (data) => {
  console.log('Download finished:', data.path)
})
```
<!-- 
## Contributing

We welcome contributions! Here's how you can help:

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request** -->

<!-- ### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting -->

## System Requirements

### Minimum Requirements

- **OS**: Windows 10 (64-bit)
- **RAM**: 4GB
- **Storage**: 500MB free space
- **Internet**: Broadband connection for downloads

### Recommended Requirements

- **OS**: Windows 11 (64-bit)
- **RAM**: 8GB or more
- **Storage**: 2GB free space
- **Internet**: High-speed broadband connection

> **Platform Support**: Currently Windows-only. Cross-platform support for macOS and Linux is planned for future releases.

## Known Issues

- Some YouTube videos may require additional authentication
- Instagram private content cannot be downloaded
- Very long videos (>4 hours) may timeout on slower connections

## Changelog

### Version 2.1.0 (Latest) - 2025-08-04
**Major UI Overhaul & New Features**
- **Video Clipping Feature** - Extract specific segments from videos with precision timing
- **Format Conversion Tool** - Convert videos between different formats
- **Enhanced Download Statistics** - Comprehensive tracking of download history
- **Responsive Design** - Optimized for all screen sizes
- **Queue Management** - Advanced download queue with retry functionality
- **Improved download performance** and anti-blocking technology
- **Fixed YouTube blocking issues** with enhanced bypass methods

### Version 2.0.0 - 2025-07-15
**Complete TypeScript Rewrite**
- **Enhanced Queue System** - Multiple concurrent downloads with priority management
- **Download Analytics** - Track download history and statistics
- **Modern UI Framework** - Updated to React 19 and modern components
- **Dark/Light Theme Support** - Beautiful themes with seamless transitions
- **Settings Panel** - Configurable download options and preferences
- **Improved Performance** - Significantly faster download processing
- **Enhanced Security** - Better security measures and validation

### Version 1.5.0 - 2025-06-20
**Multi-Platform Support**
- **Audio-only Downloads** - MP3 extraction from videos
- **Instagram Support** - Download Instagram videos and reels
- **Facebook Support** - Download Facebook videos
- **Custom Quality Selection** - Choose video quality before download
- **Optimized download speed** and improved UI design

### Version 1.4.0 - 2025-05-15
**Batch Downloads & Queue Management**
- **Batch Downloads** - Queue multiple videos for download
- **Progress Tracking** - Real-time download progress display
- **Retry Mechanism** - Automatic retry for failed downloads
- **Custom Download Path** - Choose where to save downloads
- **Enhanced stability** and better large file handling

### Version 1.3.0 - 2025-04-10
**Dark Mode & Settings**
- **Dark Mode** - Toggle between light and dark themes
- **Settings Page** - Configure application preferences
- **Download History** - View and manage past downloads
- **Keyboard Shortcuts** - Quick actions with keyboard
- **Enhanced visual design** and better accessibility

For complete changelog details, see [CHANGELOG.md](CHANGELOG.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **yt-dlp** - For the powerful video downloading backend
- **FFmpeg** - For video processing capabilities
- **Electron** - For the desktop application framework
- **React** - For the beautiful user interface
- **TailwindCSS** - For the styling system

