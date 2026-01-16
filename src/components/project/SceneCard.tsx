import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, Copy, Check, Edit2, X, Save, Mic, Video, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateBlockPrompt } from '@/lib/promptBuilder'

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
  details?: string
  parameters?: string
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

interface SceneCardProps {
  scene: Scene
  index: number
  library?: any
}

type FrameType = 'start' | 'middle' | 'end'

const FRAME_LABELS: Record<FrameType, string> = {
  start: 'Start',
  middle: 'Middle',
  end: 'End'
}

const FRAME_COLORS: Record<FrameType, string> = {
  start: 'bg-green-500 text-white',
  middle: 'bg-blue-500 text-white',
  end: 'bg-purple-500 text-white'
}

function FramePage({
  frame,
  type,
  sceneId,
  library,
  narration
}: {
  frame: Frame
  type: FrameType
  sceneId: string
  library?: any
  narration?: string
}) {
  const [activeMediaType, setActiveMediaType] = useState<'image' | 'video'>('image')
  const [isEditingPrompt, setIsEditingPrompt] = useState(false)
  const [editedPrompt, setEditedPrompt] = useState('')
  const [copied, setCopied] = useState(false)
  const [copiedMotion, setCopiedMotion] = useState(false)
  const [copiedNarration, setCopiedNarration] = useState(false)
  const [imageUrl, setImageUrl] = useState(() => {
    const cached = localStorage.getItem(`frame_image_${sceneId}_${type}`)
    return cached || frame.imageUrl || ''
  })
  const [videoUrl, setVideoUrl] = useState(() => {
    const cached = localStorage.getItem(`frame_video_${sceneId}_${type}`)
    return cached || frame.videoUrl || ''
  })

  useEffect(() => {
    const cachedImage = localStorage.getItem(`frame_image_${sceneId}_${type}`)
    const cachedVideo = localStorage.getItem(`frame_video_${sceneId}_${type}`)

    setImageUrl(cachedImage || frame.imageUrl || '')
    setVideoUrl(cachedVideo || frame.videoUrl || '')
  }, [sceneId, type, frame.imageUrl, frame.videoUrl])

  const displayPrompt = (() => {
    const cachedPrompt = localStorage.getItem(`frame_prompt_${sceneId}_${type}`)
    if (cachedPrompt) return cachedPrompt

    if ((frame as any).promptBlock && library) {
      try {
        return generateBlockPrompt(library, (frame as any).promptBlock)
      } catch (e) {
        console.error('V8 prompt generation failed:', e)
      }
    }

    if (frame.prompt) return frame.prompt

    if (frame.promptStructure) {
      const parts: string[] = []
      const ps = frame.promptStructure

      if (ps.subject) parts.push(ps.subject)
      if (ps.composition) parts.push(ps.composition)
      if (ps.style) parts.push(ps.style)
      if (ps.lighting) parts.push(ps.lighting)
      if (ps.colors) parts.push(ps.colors)
      if (ps.mood) parts.push(ps.mood)
      if (ps.environment) parts.push(ps.environment)
      if (ps.details) parts.push(ps.details)
      if (ps.quality) parts.push(ps.quality)
      if (ps.camera) parts.push(ps.camera)
      if (ps.poseAction) parts.push(ps.poseAction)
      if (ps.emotion) parts.push(ps.emotion)
      if (ps.expression) parts.push(ps.expression)
      if (ps.specialEffects) parts.push(ps.specialEffects)

      return parts.join(' ')
    }

    return ''
  })()

  const handleEditPrompt = () => {
    setEditedPrompt(displayPrompt)
    setIsEditingPrompt(true)
  }

  const handleSavePrompt = () => {
    localStorage.setItem(`frame_prompt_${sceneId}_${type}`, editedPrompt)
    setIsEditingPrompt(false)

    const projectData = JSON.parse(localStorage.getItem('currentProject') || '{}')
    if (projectData.scenes) {
      const scene = projectData.scenes.find((s: any) =>
        (s.sceneId === sceneId) || (s.id === sceneId)
      )
      if (scene?.frames?.[type]) {
        scene.frames[type].prompt = editedPrompt
        localStorage.setItem('currentProject', JSON.stringify(projectData))
      }
    }
  }

  const handleCancelEdit = () => {
    setIsEditingPrompt(false)
    setEditedPrompt('')
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const generateVideoPrompt = (frame: Frame): string => {
    if (!frame.promptStructure) return ''

    const ps = frame.promptStructure
    const parts: string[] = []

    if (ps.style) parts.push(ps.style)
    if (ps.composition) parts.push(ps.composition)

    if (ps.subject) {
      const subjectMatch = ps.subject.match(/^(?:In|On|At)\s+[^,]+,\s+(.+)/)
      if (subjectMatch) {
        parts.push(`of ${subjectMatch[1]}`)
      } else {
        parts.push(`of ${ps.subject}`)
      }
    }

    if (ps.subject) {
      const settingMatch = ps.subject.match(/^((?:In|On|At)\s+[^,]+)/)
      if (settingMatch) {
        parts.push(settingMatch[1].toLowerCase())
      }
    }

    if (ps.details) parts.push(ps.details)
    if (ps.lighting) parts.push(ps.lighting)
    if (ps.colors) parts.push(ps.colors)
    if (ps.mood) parts.push(ps.mood)
    if (ps.environment) parts.push(ps.environment)

    return parts.filter(Boolean).join(', ') + '.'
  }

  const handleCopyMotion = async () => {
    if (frame.motion?.en && frame.motion.en !== "No camera movement.") {
      await navigator.clipboard.writeText(frame.motion.en)
      setCopiedMotion(true)
      setTimeout(() => setCopiedMotion(false), 2000)
      return
    }

    const generatedPrompt = generateVideoPrompt(frame)
    if (generatedPrompt) {
      await navigator.clipboard.writeText(generatedPrompt)
      setCopiedMotion(true)
      setTimeout(() => setCopiedMotion(false), 2000)
    }
  }

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url)
    localStorage.setItem(`frame_image_${sceneId}_${type}`, url)
  }

  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url)
    localStorage.setItem(`frame_video_${sceneId}_${type}`, url)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium shrink-0",
            FRAME_COLORS[type]
          )}>
            {FRAME_LABELS[type]} Frame
          </div>

          {frame.description && (
            <p className="text-sm text-muted-foreground">{frame.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Prompt + Motion */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-4">
            {/* Prompt */}
            <div>
              <div className="flex items-center justify-between h-8 mb-2">
                <h4 className="text-sm font-semibold">Prompt</h4>
                <div className="flex gap-2">
                  {!isEditingPrompt && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleEditPrompt}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCopy}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {isEditingPrompt ? (
                <div className="flex flex-col gap-2">
                  <Textarea
                    value={editedPrompt}
                    onChange={(e) => setEditedPrompt(e.target.value)}
                    className="min-h-[200px] font-mono text-sm resize-none"
                    placeholder="Enter prompt..."
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSavePrompt}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-background rounded-lg p-4 max-h-[250px] overflow-y-auto border">
                  <p className="text-sm font-mono whitespace-pre-wrap">
                    {displayPrompt || 'No prompt available'}
                  </p>
                </div>
              )}
            </div>

            {/* Motion */}
            {(frame.motion || frame.promptStructure) && (
              <div>
                <div className="flex items-center justify-between h-8 mb-2">
                  <h4 className="text-sm font-semibold">Motion</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyMotion}
                  >
                    {copiedMotion ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                  {frame.motion?.ko && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                      {frame.motion.ko}
                      {frame.motion.speed && ` (${frame.motion.speed})`}
                    </p>
                  )}
                  <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                    {(() => {
                      if (frame.motion?.en && frame.motion.en !== "No camera movement.") {
                        return frame.motion.en
                      } else if (frame.promptStructure) {
                        return generateVideoPrompt(frame)
                      }
                      return "No camera movement."
                    })()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Image/Video Tabs */}
          <div className="bg-muted/50 rounded-lg p-4">
            {/* Media Tab Navigation */}
            <div className="flex gap-2 mb-4 border-b pb-2">
              <Button
                variant={activeMediaType === 'image' ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveMediaType('image')}
                className="flex-1"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Image
              </Button>
              <Button
                variant={activeMediaType === 'video' ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveMediaType('video')}
                className="flex-1"
              >
                <Video className="h-4 w-4 mr-2" />
                Video
              </Button>
            </div>

            {/* Image URL */}
            {activeMediaType === 'image' && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-pink-500" />
                  Image URL
                </h4>
                <Input
                  value={imageUrl}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  placeholder="Enter image URL..."
                  className="font-mono text-sm"
                />
                {imageUrl && (
                  <div className="mt-2 w-full aspect-video overflow-hidden bg-background rounded-lg border flex items-center justify-center relative group">
                    <img
                      src={imageUrl}
                      alt={`${type} frame`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <a
                      href={imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2 right-2 p-2 bg-background border rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Open in new tab"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Video URL */}
            {activeMediaType === 'video' && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Video className="h-4 w-4 text-blue-500" />
                  Video URL
                </h4>
                <Input
                  value={videoUrl}
                  onChange={(e) => handleVideoUrlChange(e.target.value)}
                  placeholder="Enter video URL..."
                  className="font-mono text-sm"
                />
                {videoUrl && (
                  <div className="mt-2 w-full aspect-video overflow-hidden bg-black rounded-lg flex items-center justify-center">
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    >
                      Cannot play video.
                    </video>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Narration */}
        {narration && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-orange-500" />
                <h4 className="text-sm font-semibold text-orange-600 dark:text-orange-400">Narration</h4>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await navigator.clipboard.writeText(narration)
                  setCopiedNarration(true)
                  setTimeout(() => setCopiedNarration(false), 2000)
                }}
              >
                {copiedNarration ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
              <p className="text-sm leading-relaxed">
                {narration}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function SceneCard({ scene, index, library }: SceneCardProps) {
  const [currentFrame, setCurrentFrame] = useState<FrameType>('start')
  const sceneIdValue = scene.sceneId || scene.id || `scene_${index}`
  const frames = scene.frames || scene.shots

  const frameOrder: FrameType[] = ['start', 'middle', 'end']
  const currentFrameIndex = frameOrder.indexOf(currentFrame)

  const handlePrevious = () => {
    if (currentFrameIndex > 0) {
      setCurrentFrame(frameOrder[currentFrameIndex - 1])
    }
  }

  const handleNext = () => {
    if (currentFrameIndex < frameOrder.length - 1) {
      setCurrentFrame(frameOrder[currentFrameIndex + 1])
    }
  }

  const handleFrameSelect = (frame: FrameType) => {
    setCurrentFrame(frame)
  }

  if (!frames) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-muted-foreground text-center">No scene data available.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        {/* Frame Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentFrameIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex gap-2 flex-1 justify-center">
            {frameOrder.map((frame) => (
              <Button
                key={frame}
                size="sm"
                variant={currentFrame === frame ? "default" : "outline"}
                onClick={() => handleFrameSelect(frame)}
                className="min-w-[80px]"
              >
                {FRAME_LABELS[frame]}
              </Button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleNext}
            disabled={currentFrameIndex === frameOrder.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Frame Indicator */}
        <div className="flex gap-1 justify-center">
          {frameOrder.map((frame) => (
            <div
              key={frame}
              className={cn(
                "h-2 w-12 rounded-full transition-all",
                currentFrame === frame
                  ? "bg-primary"
                  : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Current Frame Content */}
        <div className="min-h-[400px]">
          {frames[currentFrame] && (
            <FramePage
              frame={frames[currentFrame]}
              type={currentFrame}
              sceneId={sceneIdValue}
              library={library}
              narration={scene.narration}
            />
          )}
        </div>

        {/* Transition Effect */}
        {scene.transition && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Scene Transition:</span>
              <span className="font-medium">{scene.transition.type}</span>
              <span className="text-muted-foreground">
                ({scene.transition.duration}ms)
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
