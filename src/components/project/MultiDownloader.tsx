import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Plus, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import JSZip from 'jszip'
import { useLanguage } from '@/contexts/LanguageContext'

type TabType = 'image' | 'video'

interface MediaItem {
  id: string
  url: string
  thumbnail: string
  selected: boolean
}

export function MultiDownloader() {
  const [activeTab, setActiveTab] = useState<TabType>('image')
  const [imageInputs, setImageInputs] = useState<string[]>(Array(8).fill(''))
  const [videoInputs, setVideoInputs] = useState<string[]>(Array(8).fill(''))
  const [imageItems, setImageItems] = useState<MediaItem[]>([])
  const [videoItems, setVideoItems] = useState<MediaItem[]>([])
  const { t } = useLanguage()

  const handleInputChange = (index: number, value: string, type: TabType) => {
    if (type === 'image') {
      const newInputs = [...imageInputs]
      newInputs[index] = value
      setImageInputs(newInputs)
    } else {
      const newInputs = [...videoInputs]
      newInputs[index] = value
      setVideoInputs(newInputs)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, index: number, type: TabType) => {
    if (e.key === 'Enter') {
      const url = type === 'image' ? imageInputs[index] : videoInputs[index]
      if (url.trim()) {
        addMediaItem(url, type)
      }
    }
  }

  const addMediaItem = (url: string, type: TabType) => {
    const newItem: MediaItem = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      url: url,
      thumbnail: url,
      selected: false
    }

    if (type === 'image') {
      setImageItems([...imageItems, newItem])
    } else {
      setVideoItems([...videoItems, newItem])
    }
  }

  const addMoreInputs = (type: TabType) => {
    if (type === 'image') {
      setImageInputs([...imageInputs, '', ''])
    } else {
      setVideoInputs([...videoInputs, '', ''])
    }
  }

  const toggleSelection = (id: string, type: TabType) => {
    if (type === 'image') {
      setImageItems(imageItems.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      ))
    } else {
      setVideoItems(videoItems.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      ))
    }
  }

  const removeItem = (id: string, type: TabType) => {
    if (type === 'image') {
      setImageItems(imageItems.filter(item => item.id !== id))
    } else {
      setVideoItems(videoItems.filter(item => item.id !== id))
    }
  }

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100)
    } catch (error) {
      console.error('Download failed:', error)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.target = '_blank'
      link.click()
    }
  }

  const downloadSelected = async (type: TabType) => {
    const items = type === 'image' ? imageItems : videoItems
    const selected = items.filter(item => item.selected)

    for (const item of selected) {
      const extension = type === 'image' ? 'png' : 'mp4'
      const filename = `${type}-${Date.now()}.${extension}`
      await downloadFile(item.url, filename)
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  const downloadAll = async (type: TabType) => {
    const items = type === 'image' ? imageItems : videoItems

    if (items.length === 0) return

    const zip = new JSZip()
    const extension = type === 'image' ? 'png' : 'mp4'

    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        try {
          const response = await fetch(item.url)
          const blob = await response.blob()
          const filename = `${type}-${i + 1}.${extension}`
          zip.file(filename, blob)
        } catch (error) {
          console.error(`Failed to fetch ${item.url}:`, error)
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })

      const blobUrl = window.URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `${type === 'image' ? 'images' : 'videos'}-${Date.now()}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Failed to create zip:', error)
      alert('ZIP 파일 생성에 실패했습니다. CORS 정책으로 인해 일부 파일을 다운로드할 수 없습니다.')
    }
  }

  const currentInputs = activeTab === 'image' ? imageInputs : videoInputs
  const currentItems = activeTab === 'image' ? imageItems : videoItems

  return (
    <div className="w-full h-full overflow-auto p-6 bg-background">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold">{t.mjDownloadTitle}</h1>
          <span className="hidden md:inline text-sm text-muted-foreground">
            {t.batchDownload}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b pb-1">
          <Button
            variant={activeTab === 'image' ? 'default' : 'outline'}
            onClick={() => setActiveTab('image')}
          >
            {t.image}
          </Button>
          <Button
            variant={activeTab === 'video' ? 'default' : 'outline'}
            onClick={() => setActiveTab('video')}
          >
            {t.video}
          </Button>
        </div>

        {/* URL Input Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.urlInput}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentInputs.map((value, index) => (
                <Input
                  key={index}
                  value={value}
                  onChange={(e) => handleInputChange(index, e.target.value, activeTab)}
                  onKeyPress={(e) => handleKeyPress(e, index, activeTab)}
                  placeholder={`${activeTab === 'image' ? t.image : t.video} URL ${index + 1}`}
                  className="font-mono"
                />
              ))}
            </div>
            <Button
              onClick={() => addMoreInputs(activeTab)}
              variant="outline"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t.addInput}
            </Button>
          </CardContent>
        </Card>

        {/* Download Actions */}
        {currentItems.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => downloadSelected(activeTab)}
              disabled={!currentItems.some(item => item.selected)}
            >
              <Download className="h-4 w-4 mr-2" />
              {t.selectedDownload} ({currentItems.filter(item => item.selected).length})
            </Button>
            <Button
              onClick={() => downloadAll(activeTab)}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              {t.downloadAll} ({currentItems.length})
            </Button>
          </div>
        )}

        {/* Image Thumbnails - Only show in image tab */}
        {activeTab === 'image' && imageItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.imagePreview}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {imageItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "relative aspect-video overflow-hidden cursor-pointer rounded-lg border transition-all",
                      item.selected
                        ? "ring-2 ring-primary"
                        : "hover:border-primary/50"
                    )}
                    onClick={() => toggleSelection(item.id, 'image')}
                  >
                    <img
                      src={item.thumbnail}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f3f3" width="400" height="300"/%3E%3Ctext fill="%23666" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage Error%3C/text%3E%3C/svg%3E'
                      }}
                    />

                    {/* Selection Overlay */}
                    {item.selected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-primary-foreground" />
                        </div>
                      </div>
                    )}

                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeItem(item.id, 'image')
                      }}
                      className="absolute top-2 right-2 p-1 bg-background border rounded-md hover:bg-muted transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Video Thumbnails - Only show in video tab */}
        {activeTab === 'video' && videoItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.videoPreview}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {videoItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "relative aspect-video overflow-hidden cursor-pointer rounded-lg border transition-all group",
                      item.selected
                        ? "ring-2 ring-primary"
                        : "hover:border-primary/50"
                    )}
                    onClick={() => toggleSelection(item.id, 'video')}
                  >
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      loop
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause()
                        e.currentTarget.currentTime = 0
                      }}
                    />

                    {/* Selection Overlay */}
                    {item.selected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center pointer-events-none">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-primary-foreground" />
                        </div>
                      </div>
                    )}

                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeItem(item.id, 'video')
                      }}
                      className="absolute top-2 right-2 p-1 bg-background border rounded-md hover:bg-muted transition-colors z-10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
