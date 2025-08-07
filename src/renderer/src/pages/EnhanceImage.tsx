import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  Upload,
  Image,
  Sparkles,
  Download,
  FileImage,
  Zap,
  Settings,
  RefreshCw,
  Check,
} from 'lucide-react'

// Mock hooks for demo - replace with your actual imports
const useTheme = () => ({ isDarkMode: false })
import { useEnchanStore } from '../store/enchanStore'
import { useGlobalProcessStore } from '../store/globalProcessStore'

function EnhanceImage() {
  const { isDarkMode } = useTheme()
  const { addProcess, getActiveConverts, updateProcess, removeProcess } = useGlobalProcessStore()
  const { 
    activeEnhanceProcess, 
    setActiveEnhanceProcess, 
    updateEnhanceProcess, 
    addToHistory,
    cleanOldHistory 
  } = useEnchanStore()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileReaderRef = useRef<FileReader | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const componentMountedRef = useRef(true)
  const isProcessing = useMemo(() => 
    activeEnhanceProcess?.isEnhancing || false, 
    [activeEnhanceProcess?.isEnhancing]
  )
  
  const currentProgress = useMemo(() => 
    activeEnhanceProcess?.percent || 0, 
    [activeEnhanceProcess?.percent]
  )

  // Memoized functions
  const getEnhancementStageFromPercent = useCallback((percent: number): string => {
    if (percent <= 15) return 'Preprocessing image...'
    if (percent <= 35) return 'Applying AI upscaling...'
    if (percent <= 55) return 'Noise reduction...'
    if (percent <= 75) return 'Sharpening details...'
    if (percent <= 90) return 'Color correction...'
    if (percent <= 95) return 'Finalizing...'
    return 'Enhancement complete!'
  }, [])

  const truncateFilename = useCallback((filename: string, maxLength = 30): string => {
    if (!filename) return ''
    if (filename.length <= maxLength) return filename
    
    const extension = filename.split('.').pop() || ''
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'))
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 4) + '...'
    return `${truncatedName}.${extension}`
  }, [])

  // Comprehensive cleanup function
  const cleanupResources = useCallback(() => {
    // Revoke blob URLs
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview)
    }
    if (result && result.startsWith('blob:')) {
      URL.revokeObjectURL(result)
    }

    // Abort FileReader
    if (fileReaderRef.current) {
      fileReaderRef.current.abort()
      fileReaderRef.current.onload = null
      fileReaderRef.current.onerror = null
      fileReaderRef.current.onabort = null
      fileReaderRef.current = null
    }

    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Abort ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    // Force garbage collection if available
    if (typeof window !== 'undefined' && 'gc' in window) {
      ;(window as any).gc()
    }
  }, [preview, result])

  // Component unmount cleanup
  useEffect(() => {
    componentMountedRef.current = true
    
    // Clean old history on mount
    cleanOldHistory()
    
    return () => {
      componentMountedRef.current = false
      cleanupResources()
    }
  }, [cleanupResources, cleanOldHistory])

  // Individual URL cleanup effects
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  useEffect(() => {
    return () => {
      if (result && result.startsWith('blob:')) {
        URL.revokeObjectURL(result)
      }
    }
  }, [result])

  // Memoized progress handler
  const handleEnhanceProgress = useCallback((data: { id: string; percent: number }) => {
    // Only update if component is still mounted
    if (!componentMountedRef.current) return

    updateEnhanceProcess(data.id, {
      percent: data.percent,
      status: getEnhancementStageFromPercent(data.percent),
      isEnhancing: data.percent < 100
    })

    // Update global process
    updateProcess(data.id, {
      percent: data.percent,
      status: data.percent === 100 ? 'completed' : 'processing'
    })

    // If completed, finish the enhancement
    if (data.percent === 100) {
      updateEnhanceProcess(data.id, {
        isEnhancing: false,
        status: 'Enhancement complete!'
      })
    }
  }, [updateEnhanceProcess, updateProcess, getEnhancementStageFromPercent])

  useEffect(() => {
    console.log('Enhancement process updated:', activeEnhanceProcess)
  if (!preview && activeEnhanceProcess?.inputPreview) {
    setPreview(activeEnhanceProcess.inputPath)
  }
}, [preview, activeEnhanceProcess])

  // Progress event listener
  useEffect(() => {
    if (typeof window !== 'undefined' && window.api) {
      window.api.on('enhance-progress', handleEnhanceProgress)

      return () => {
        if (window.api?.off) {
          window.api.off('enhance-progress', handleEnhanceProgress)
        }
      }
    }
  }, [handleEnhanceProgress])

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return

    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview)
    }
    if (result && result.startsWith('blob:')) {
      URL.revokeObjectURL(result)
    }

    setSelectedFile(file)
    setResult(null)

    if (fileReaderRef.current) {
      fileReaderRef.current.abort()
    }

    const reader = new FileReader()
    fileReaderRef.current = reader

    reader.onload = (e) => {
      if (fileReaderRef.current === reader && e.target?.result && componentMountedRef.current) {
        setPreview(e.target.result as string)
      }
    }

    reader.onerror = () => {
      if (fileReaderRef.current === reader) {
        console.error('FileReader error')
        fileReaderRef.current = null
      }
    }

    reader.onabort = () => {
      if (fileReaderRef.current === reader) {
        fileReaderRef.current = null
      }
    }

    reader.readAsDataURL(file)

    // Clear input value
    if (event.target) {
      event.target.value = ''
    }
  }, [preview, result])

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (!file || !file.type.startsWith('image/')) return

    // Simulate file input event
    const syntheticEvent = {
      target: { files: [file] }
    } as unknown as React.ChangeEvent<HTMLInputElement>
    
    handleFileSelect(syntheticEvent)
  }, [handleFileSelect])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
  }, [])

  const startEnhancement = useCallback(async () => {
    if (!selectedFile || !componentMountedRef.current) return

    // Create new AbortController
    abortControllerRef.current = new AbortController()

    const processId = `enhance-${Date.now()}`
    setResult(null)

    const enhanceProcess = {
      id: processId,
      inputPath: selectedFile.name,
      status: 'Starting enhancement...',
      percent: 0,
      isEnhancing: true,
      createdAt: Date.now()
    }

    setActiveEnhanceProcess(enhanceProcess)
    addToHistory(enhanceProcess)

    addProcess({
      id: processId,
      type: 'enhance',
      enchan: {
        inputPath: selectedFile.name,
        outputFormat: 'png',
      },
      status: 'processing',
      title: `Enhancing ${selectedFile.name}`,
      isActive: true,
      percent: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    })

    try {
      const arrayBuffer = await selectedFile.arrayBuffer()
      
      if (abortControllerRef.current?.signal.aborted || !componentMountedRef.current) {
        throw new Error('Request aborted')
      }

      const buffer = new Uint8Array(arrayBuffer)

      updateEnhanceProcess(processId, {
        status: 'Processing image...',
        percent: 10
      })

      if (typeof window !== 'undefined' && window.api) {
        const enhanceResult = await window.api.enhanceImage(
          Array.from(buffer),
          selectedFile.name,
          [],
          processId
        )

        if (abortControllerRef.current?.signal.aborted || !componentMountedRef.current) {
          throw new Error('Request aborted')
        }

        if (enhanceResult.success) {
          updateEnhanceProcess(processId, {
            outputPath: enhanceResult.filePath || enhanceResult.output,
            status: 'Enhancement completed!',
            percent: 100,
            isEnhancing: false
          })

          setResult(enhanceResult.output || enhanceResult.filePath || preview)

          updateProcess(processId, {
            status: 'completed',
            percent: 100
          })

          // Auto-remove after 3 seconds
          timeoutRef.current = setTimeout(() => {
            if (componentMountedRef.current) {
              removeProcess(processId)
              setActiveEnhanceProcess(null)
            }
            timeoutRef.current = null
          }, 3000)
        } else {
          throw new Error('Enhancement failed')
        }
      } else {
        // Demo mode
        setResult(preview)
        updateEnhanceProcess(processId, {
          status: 'Enhancement completed!',
          percent: 100,
          isEnhancing: false
        })
      }
    } catch (error) {
      if (componentMountedRef.current && !abortControllerRef.current?.signal.aborted) {
        console.error('Enhancement failed:', error)

        updateEnhanceProcess(processId, {
          status: 'Enhancement failed',
          percent: 0,
          isEnhancing: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })

        updateProcess(processId, {
          status: 'error',
          percent: 0
        })
      }
    } finally {
      abortControllerRef.current = null
    }
  }, [selectedFile, preview, setActiveEnhanceProcess, addToHistory, addProcess, updateEnhanceProcess, updateProcess, removeProcess])

  // const cancelEnhancement = useCallback(() => {
  //   if (abortControllerRef.current) {
  //     abortControllerRef.current.abort()
  //   }
    
  //   if (timeoutRef.current) {
  //     clearTimeout(timeoutRef.current)
  //     timeoutRef.current = null
  //   }

  //   if (activeEnhanceProcess) {
  //     updateEnhanceProcess(activeEnhanceProcess.id, {
  //       status: 'Enhancement cancelled',
  //       percent: 0,
  //       isEnhancing: false
  //     })
      
  //     removeProcess(activeEnhanceProcess.id)
  //     setActiveEnhanceProcess(null)
  //   }
  // }, [activeEnhanceProcess, updateEnhanceProcess, removeProcess, setActiveEnhanceProcess])

  const downloadResult = useCallback(() => {
    if (!result || !selectedFile) return

    const link = document.createElement('a')
    link.href = result
    link.download = `enhanced_${selectedFile.name.replace(/\.[^/.]+$/, '.png')}`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Cleanup
    link.href = ''
  }, [result, selectedFile])

  // const fileSize = useMemo(() => {
  //   return selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : '0'
  // }, [selectedFile?.size])

  return (
    <div className={`min-h-screen p-4 flex justify-center sm:p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 to-white'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className=" text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 sm:p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              AI Image Enhancement
            </h1>
          </div>
          <p className={` text-base sm:text-lg px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
            Enhance your images with AI-powered upscaling, noise reduction, and detail enhancement
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6 lg:space-y-8">
          {/* Upload Section */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
              Upload Image
            </h2>

            {/* File Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 h-48 sm:h-64 border-dashed rounded-xl sm:rounded-2xl p-4 sm:p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center ${
                isDarkMode
                  ? 'border-gray-600 hover:border-purple-500 bg-gray-700 hover:bg-gray-650'
                  : 'border-gray-300 hover:border-purple-400 bg-gray-50 hover:bg-purple-50'
              }`}
            >
              {preview ? (
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </div>
              ) : (
                <>
                  <FileImage className={`w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <p className={`text-sm sm:text-lg font-medium mb-1 sm:mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Drop image here or click to browse
                  </p>
                  <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Supports: JPG, PNG, WebP, BMP
                  </p>
                </>
              )}
            </div>

            <input 

              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* File Info */}
            {selectedFile && (
              <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} overflow-hidden`}>
                <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-medium shrink-0">File:</span>
                    <span className="text-right break-all" title={selectedFile.name}>
                      {truncateFilename(selectedFile.name)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Size:</span>
                    <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Type:</span>
                    <span>{selectedFile.type}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Enhancement Options */}
            <div className="mt-6 space-y-4">
              <h3 className={`text-base sm:text-lg font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                Enhancement Options
              </h3>
            </div>

            {/* Action Button */}
            <button
              onClick={startEnhancement}
              disabled={!selectedFile || isProcessing}
              className={`w-full mt-6 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base ${
                selectedFile && !isProcessing
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                  Enhance Image
                </>
              )}
            </button>
          </div>

<br/>
          {/* Preview & Results Section */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Image className="w-4 h-4 sm:w-5 sm:h-5" />
              Preview & Results
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Original */}
              <div className="space-y-3">
                <h3 className={`text-base sm:text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Original
                </h3>
                <div className={`rounded-xl sm:rounded-2xl border-2 border-dashed ${!preview ? 'aspect-square sm:aspect-[4/3]' : 'min-h-[250px] sm:min-h-[350px]'} flex items-center justify-center overflow-hidden ${
                  isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                }`}>
                  {preview ? (
                    <img
                      src={preview}
                      alt="Original"
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <FileImage className={`w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No image selected
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced */}
              <div className="space-y-3">
                <h3 className={`text-base sm:text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Enhanced
                </h3>
                <div className={`rounded-xl sm:rounded-2xl border-2 border-dashed ${!result ? 'aspect-square sm:aspect-[4/3]' : 'min-h-[250px] sm:min-h-[350px]'} flex items-center justify-center overflow-hidden ${
                  isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                }`}>
                  {result ? (
                    <div className="relative flex items-center justify-center w-full h-full">
                      <img
                        src={result}
                        alt="Enhanced"
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                      <div className="absolute top-2 right-2">
                        <div className="bg-green-500 text-white p-1 sm:p-1.5 rounded-full">
                          <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                        </div>
                      </div>
                    </div>
                  ) : isProcessing ? (
                    <div className="text-center p-4 w-full">
                      <RefreshCw className={`w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 animate-spin ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                      <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2 sm:mb-3`}>
                        Processing...
                      </p>
                      <div className={`w-full max-w-xs mx-auto bg-gray-200 rounded-full h-1.5 sm:h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(currentProgress, 5)}%` }}
                        />
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {Math.round(currentProgress)}%
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {getEnhancementStageFromPercent(currentProgress)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <Sparkles className={`w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Enhanced image will appear here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <br/>

            {/* Download Button */}
            {result && (
              <div className="mt-4 sm:mt-6 text-center">
                <button
                  onClick={downloadResult}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 mx-auto transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  Download Enhanced Image
                </button>
              </div>
            )}
          </div>
        </div>

<br/>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 shrink-0">
                <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h3 className={`font-semibold text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                AI Upscaling
              </h3>
            </div>
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Enhance resolution up to 4x using advanced AI algorithms
            </p>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-green-100 shrink-0">
                <RefreshCw className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <h3 className={`font-semibold text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Noise Reduction
              </h3>
            </div>
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Remove artifacts and noise while preserving important details
            </p>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-purple-100 shrink-0">
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <h3 className={`font-semibold text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Detail Enhancement
              </h3>
            </div>
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Sharpen details and improve overall image quality
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhanceImage