import { useState } from 'react'
import { ChevronDown, Image as ImageIcon, Video, FileText, Copy, Check } from 'lucide-react'
import { SceneCard } from './SceneCard'
import { EmptyState } from './EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import JSZip from 'jszip'
import { useLanguage } from '@/contexts/LanguageContext'

interface PromptStructure {
  subject?: string
  style?: string
  composition?: string
  lighting?: string
  colors?: string
  mood?: string
  environment?: string
  quality?: string
  camera?: string
  poseAction?: string
  emotion?: string
  expression?: string
  specialEffects?: string
}

interface Motion {
  ko?: string
  en?: string
  speed?: string
}

interface Setting {
  location?: string
  timeOfDay?: string
  atmosphere?: string
}

interface Frame {
  shotType?: string
  duration?: number
  description?: string
  promptStructure?: PromptStructure
  prompt?: string
  parameters?: string
  imageUrl?: string
  videoUrl?: string
  motion?: Motion
}

interface Scene {
  scene?: number
  sceneNumber?: number
  sceneId?: string
  id?: string
  title?: string
  description?: string
  narration?: string
  duration?: number
  setting?: Setting
  charactersInScene?: string[]
  frames?: {
    start: Frame
    middle: Frame
    end: Frame
  }
  shots?: {
    start: Frame
    middle: Frame
    end: Frame
  }
  transition?: {
    type?: string
    duration: number
  }
}

interface Scenario {
  fullScript?: string
  summary?: string
}

interface ProjectData {
  project: {
    title: string
    style: string
    aspectRatio: string
    totalDuration: string | number
    description?: string
  }
  scenario?: string | Scenario
  scenes: Scene[]
  definitions?: {
    library?: {
      characters?: Record<string, any>
      locations?: Record<string, any>
      props?: Record<string, any>
    }
  }
}

interface ProjectManagerProps {
  projectData: ProjectData | null
}

export function ProjectManager({ projectData }: ProjectManagerProps) {
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0)
  const [downloading, setDownloading] = useState(false)
  const [showFullScript, setShowFullScript] = useState(true)
  const [copiedFullScript, setCopiedFullScript] = useState(false)
  const { t } = useLanguage()

  if (!projectData) {
    return <EmptyState />
  }

  const currentScene = projectData.scenes[selectedSceneIndex]

  const getFullScript = (): string => {
    if (!projectData.scenario) return ''
    if (typeof projectData.scenario === 'string') return projectData.scenario
    return projectData.scenario.fullScript || projectData.scenario.summary || ''
  }

  const fullScript = getFullScript()

  const collectMediaUrls = (type: 'image' | 'video') => {
    const urls: { url: string; name: string }[] = []

    projectData.scenes.forEach((scene, index) => {
      const sceneId = scene.sceneId || scene.id || `scene_${index}`
      const sceneNum = scene.sceneNumber || scene.scene || index + 1

      const types = ['start', 'middle', 'end']

      types.forEach((frameType) => {
        const key = type === 'image'
          ? `frame_image_${sceneId}_${frameType}`
          : `frame_video_${sceneId}_${frameType}`

        const url = localStorage.getItem(key)

        if (url) {
          const fileName = `scene${sceneNum}_${frameType}.${type === 'image' ? 'jpg' : 'mp4'}`
          urls.push({ url, name: fileName })
        }
      })
    })

    return urls
  }

  const downloadMediaAsZip = async (type: 'image' | 'video') => {
    setDownloading(true)
    try {
      const mediaUrls = collectMediaUrls(type)

      if (mediaUrls.length === 0) {
        alert(type === 'image' ? t.noImages : t.noVideos)
        setDownloading(false)
        return
      }

      const zip = new JSZip()
      const folder = zip.folder(type === 'image' ? 'images' : 'videos')
      let successCount = 0
      let failedUrls: string[] = []

      let urlListContent = `# ${projectData.project.title} - ${type === 'image' ? 'Image' : 'Video'} URL List\n\n`

      await Promise.all(
        mediaUrls.map(async ({ url, name }) => {
          try {
            urlListContent += `${name}: ${url}\n`

            const response = await fetch(url, {
              mode: 'cors',
              credentials: 'omit'
            })

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`)
            }

            const blob = await response.blob()
            folder?.file(name, blob)
            successCount++
          } catch (error) {
            try {
              await fetch(url, { mode: 'no-cors' })
              failedUrls.push(`${name} (CORS restriction)`)
            } catch (secondError) {
              failedUrls.push(`${name} (Network error)`)
            }
          }
        })
      )

      if (failedUrls.length > 0) {
        folder?.file('url_list.txt', urlListContent)
      }

      if (successCount === 0) {
        const content = await zip.generateAsync({ type: 'blob' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(content)
        link.download = `${projectData.project.title}_${type}_urls.zip`
        link.click()
        URL.revokeObjectURL(link.href)

        alert(`Cannot download directly due to CORS policy.\n\nURL list file has been downloaded.`)
        setDownloading(false)
        return
      }

      const content = await zip.generateAsync({ type: 'blob' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(content)
      link.download = `${projectData.project.title}_${type}s.zip`
      link.click()
      URL.revokeObjectURL(link.href)

      if (failedUrls.length > 0) {
        alert(`${t.downloadComplete}\n\n${t.success}: ${successCount}\n${t.failed}: ${failedUrls.length}`)
      }
    } catch (error) {
      console.error('Download failed:', error)
      alert(t.downloadFailed)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Full Script Section */}
      {fullScript && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">{t.fullScript}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await navigator.clipboard.writeText(fullScript)
                    setCopiedFullScript(true)
                    setTimeout(() => setCopiedFullScript(false), 2000)
                  }}
                >
                  {copiedFullScript ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullScript(!showFullScript)}
                >
                  {showFullScript ? t.collapse : t.expand}
                </Button>
              </div>
            </div>
            {showFullScript && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {fullScript}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Project Info & Scene Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Project Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm flex-1 min-w-0">
                <div className="flex gap-2 items-center">
                  <span className="text-muted-foreground">{t.title}:</span>
                  <span className="font-medium truncate">{projectData.project.title}</span>
                </div>
                <div className="flex gap-4">
                  <div className="flex gap-2 items-center">
                    <span className="text-muted-foreground">{t.ratio}:</span>
                    <span className="font-medium">{projectData.project.aspectRatio}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-muted-foreground">{t.duration}:</span>
                    <span className="font-medium">{projectData.project.totalDuration}</span>
                  </div>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="flex gap-2 shrink-0">
                <Button
                  onClick={() => downloadMediaAsZip('image')}
                  disabled={downloading}
                  variant="outline"
                  size="sm"
                >
                  <ImageIcon className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t.images}</span>
                </Button>
                <Button
                  onClick={() => downloadMediaAsZip('video')}
                  disabled={downloading}
                  variant="outline"
                  size="sm"
                >
                  <Video className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t.videos}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scene Selector */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <select
                value={selectedSceneIndex}
                onChange={(e) => setSelectedSceneIndex(Number(e.target.value))}
                className="w-full bg-background border rounded-md px-4 py-2 pr-10 text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                {projectData.scenes.map((scene, index) => {
                  const sceneNum = scene.scene || scene.sceneNumber || index + 1
                  const sceneDesc = scene.description || scene.title || ''
                  const sceneLabel = sceneDesc
                    ? `${t.scene} ${sceneNum}: ${sceneDesc}`
                    : `${t.scene} ${sceneNum}`

                  return (
                    <option key={scene.sceneId || scene.id || index} value={index}>
                      {sceneLabel}
                    </option>
                  )
                })}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Scene */}
      {currentScene && (
        <SceneCard
          key={currentScene.sceneId || currentScene.id || selectedSceneIndex}
          scene={currentScene}
          index={selectedSceneIndex}
          library={projectData.definitions?.library}
        />
      )}
    </div>
  )
}
