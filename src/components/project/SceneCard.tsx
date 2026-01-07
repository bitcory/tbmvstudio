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
  library?: any  // V8 library 지원
}

type FrameType = 'start' | 'middle' | 'end'

const FRAME_LABELS: Record<FrameType, string> = {
  start: '시작',
  middle: '중간',
  end: '끝'
}

const FRAME_COLORS: Record<FrameType, string> = {
  start: 'bg-neo-green text-white border-2 border-foreground shadow-[3px_3px_0_hsl(var(--foreground))]',
  middle: 'bg-neo-blue text-white border-2 border-foreground shadow-[3px_3px_0_hsl(var(--foreground))]',
  end: 'bg-neo-purple text-white border-2 border-foreground shadow-[3px_3px_0_hsl(var(--foreground))]'
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

  // 프레임 타입이 변경될 때마다 이미지와 비디오 URL 업데이트
  useEffect(() => {
    const cachedImage = localStorage.getItem(`frame_image_${sceneId}_${type}`)
    const cachedVideo = localStorage.getItem(`frame_video_${sceneId}_${type}`)

    setImageUrl(cachedImage || frame.imageUrl || '')
    setVideoUrl(cachedVideo || frame.videoUrl || '')
  }, [sceneId, type, frame.imageUrl, frame.videoUrl])

  const displayPrompt = (() => {
    const cachedPrompt = localStorage.getItem(`frame_prompt_${sceneId}_${type}`)
    if (cachedPrompt) return cachedPrompt

    // V8 포맷 체크 (promptBlock이 있는지 확인)
    if ((frame as any).promptBlock && library) {
      try {
        return generateBlockPrompt(library, (frame as any).promptBlock)
      } catch (e) {
        console.error('V8 프롬프트 생성 실패:', e)
      }
    }

    // prompt가 있으면 그대로 사용
    if (frame.prompt) return frame.prompt

    // promptStructure가 있으면 문자열로 변환
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

    // Update project data in localStorage
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

  // promptStructure를 영상 프롬프트로 조립하는 함수
  const generateVideoPrompt = (frame: Frame): string => {
    if (!frame.promptStructure) return ''

    const ps = frame.promptStructure
    const parts: string[] = []

    // 1. STYLE (스타일)
    if (ps.style) parts.push(ps.style)

    // 2. CAMERA (카메라 - composition 필드 사용)
    if (ps.composition) parts.push(ps.composition)

    // 3. SUBJECT (주체)
    if (ps.subject) {
      // subject가 "In/On..."으로 시작하면 분리 필요
      const subjectMatch = ps.subject.match(/^(?:In|On|At)\s+[^,]+,\s+(.+)/)
      if (subjectMatch) {
        parts.push(`of ${subjectMatch[1]}`)
      } else {
        parts.push(`of ${ps.subject}`)
      }
    }

    // 4. ACTION (promptStructure에는 없지만 subject에 포함되어 있을 수 있음)

    // 5. SETTING (장소 - subject의 앞부분에서 추출)
    if (ps.subject) {
      const settingMatch = ps.subject.match(/^((?:In|On|At)\s+[^,]+)/)
      if (settingMatch) {
        parts.push(settingMatch[1].toLowerCase())
      }
    }

    // 6. ATMOSPHERE (분위기 - details 필드 사용)
    if (ps.details) parts.push(ps.details)

    // 추가 필드들
    if (ps.lighting) parts.push(ps.lighting)
    if (ps.colors) parts.push(ps.colors)
    if (ps.mood) parts.push(ps.mood)
    if (ps.environment) parts.push(ps.environment)

    return parts.filter(Boolean).join(', ') + '.'
  }

  const handleCopyMotion = async () => {
    // 1. motion.en이 있으면 그대로 사용
    if (frame.motion?.en && frame.motion.en !== "No camera movement.") {
      await navigator.clipboard.writeText(frame.motion.en)
      setCopiedMotion(true)
      setTimeout(() => setCopiedMotion(false), 2000)
      return
    }

    // 2. motion.en이 없거나 "No camera movement."인 경우, promptStructure에서 생성
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
      {/* 상단: 프레임 정보 */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium shrink-0",
            FRAME_COLORS[type]
          )}>
            {FRAME_LABELS[type]} 프레임
          </div>

          {frame.description && (
            <p className="text-sm text-muted-foreground">{frame.description}</p>
          )}
        </div>

        {/* 프롬프트 + 모션 섹션과 미디어 섹션 분리 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 왼쪽: 프롬프트 + 모션 */}
          <div className="neo-section-muted p-4 space-y-4">
            {/* 프롬프트 */}
            <div>
              <div className="flex items-center justify-between h-8 mb-2">
                <h4 className="text-sm font-bold">프롬프트</h4>
                <div className="flex gap-2">
                  {!isEditingPrompt && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleEditPrompt}
                        className="h-8 px-2"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCopy}
                        className="h-8 px-2"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-neo-green" />
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
                    placeholder="프롬프트를 입력하세요..."
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSavePrompt}
                      className="bg-neo-green"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      저장
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="bg-white"
                    >
                      <X className="h-4 w-4 mr-1" />
                      취소
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="neo-subsection p-4 max-h-[250px] overflow-y-auto">
                  <p className="text-sm font-mono whitespace-pre-wrap text-foreground">
                    {displayPrompt || '프롬프트가 없습니다'}
                  </p>
                </div>
              )}
            </div>

            {/* 모션 - 프롬프트 바로 아래 */}
            {(frame.motion || frame.promptStructure) && (
              <div>
                <div className="flex items-center justify-between h-8 mb-2">
                  <h4 className="text-sm font-bold">모션</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyMotion}
                    className="h-8 px-2"
                  >
                    {copiedMotion ? (
                      <Check className="h-4 w-4 text-neo-green" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="neo-subsection bg-neo-blue/10 p-3">
                  {frame.motion?.ko && (
                    <p className="text-sm text-neo-blue font-bold mb-2">
                      {frame.motion.ko}
                      {frame.motion.speed && ` (${frame.motion.speed})`}
                    </p>
                  )}
                  <p className="text-xs font-mono text-foreground/80 leading-relaxed">
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

          {/* 오른쪽: 이미지/비디오 탭 */}
          <div className="neo-section-muted p-4">
            {/* 미디어 탭 네비게이션 */}
            <div className="flex gap-2 mb-4 border-b-2 border-foreground/20 pb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveMediaType('image')}
                className={cn(
                  "flex-1 font-bold",
                  activeMediaType === 'image'
                    ? "bg-neo-pink text-white border-2 border-foreground shadow-[2px_2px_0_hsl(var(--foreground))]"
                    : "bg-white text-foreground hover:bg-neo-pink/20"
                )}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                이미지
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveMediaType('video')}
                className={cn(
                  "flex-1 font-bold",
                  activeMediaType === 'video'
                    ? "bg-neo-blue text-white border-2 border-foreground shadow-[2px_2px_0_hsl(var(--foreground))]"
                    : "bg-white text-foreground hover:bg-neo-blue/20"
                )}
              >
                <Video className="h-4 w-4 mr-2" />
                비디오
              </Button>
            </div>

            {/* 이미지 URL */}
            {activeMediaType === 'image' && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-200">
                <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-neo-pink" />
                  이미지 URL
                </h4>
                <Input
                  value={imageUrl}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  placeholder="이미지 URL을 입력하세요..."
                  className="font-mono text-sm"
                />
                {imageUrl && (
                <div className="neo-subsection mt-2 w-full aspect-video overflow-hidden bg-white flex items-center justify-center relative group">
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
                      className="absolute top-2 right-2 p-2 bg-white border-2 border-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="새 창에서 보기"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* 비디오 URL */}
            {activeMediaType === 'video' && (
              <div className="animate-in fade-in slide-in-from-right-2 duration-200">
                <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                  <Video className="h-4 w-4 text-neo-blue" />
                  비디오 URL
                </h4>
                <Input
                  value={videoUrl}
                  onChange={(e) => handleVideoUrlChange(e.target.value)}
                  placeholder="비디오 URL을 입력하세요..."
                  className="font-mono text-sm"
                />
                {videoUrl && (
                <div className="neo-subsection mt-2 w-full aspect-video overflow-hidden bg-foreground flex items-center justify-center">
                  <video
                    src={videoUrl}
                    controls
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    >
                      비디오를 재생할 수 없습니다.
                    </video>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 나래이션 - 모션 아래에 표시 (데이터가 있을 때만) */}
        {narration && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-neo-orange" />
                <h4 className="text-sm font-bold text-neo-orange">나래이션</h4>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await navigator.clipboard.writeText(narration)
                  setCopiedNarration(true)
                  setTimeout(() => setCopiedNarration(false), 2000)
                }}
                className="h-8 px-2"
              >
                {copiedNarration ? (
                  <Check className="h-4 w-4 text-neo-green" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="neo-subsection bg-neo-orange/10 p-3">
              <p className="text-sm text-foreground leading-relaxed">
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
          <p className="text-muted-foreground text-center font-bold">씬 데이터가 없습니다.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="space-y-2 pt-4">
        {/* 프레임 네비게이션 */}
        <div className="flex items-center justify-between gap-4">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentFrameIndex === 0}
            className="flex-shrink-0 bg-white"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            이전
          </Button>

          <div className="flex gap-2 flex-1 justify-center">
            {frameOrder.map((frame) => (
              <Button
                key={frame}
                size="sm"
                variant={currentFrame === frame ? "default" : "outline"}
                onClick={() => handleFrameSelect(frame)}
                className={cn(
                  "min-w-[80px]",
                  currentFrame === frame
                    ? "bg-neo-purple"
                    : "bg-white"
                )}
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
            className="flex-shrink-0 bg-white"
          >
            다음
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* 프레임 인디케이터 */}
        <div className="flex gap-1 justify-center">
          {frameOrder.map((frame) => (
            <div
              key={frame}
              className={cn(
                "h-2 w-12 border-2 border-foreground transition-all",
                currentFrame === frame
                  ? "bg-neo-purple"
                  : "bg-white"
              )}
            />
          ))}
        </div>

        {/* 현재 프레임 콘텐츠 */}
        <div className="min-h-[400px] animate-in fade-in-0 slide-in-from-right-5 duration-300">
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

        {/* 전환 효과 */}
        {scene.transition && (
          <div className="mt-6 p-4 bg-neo-yellow/20 border-2 border-neo-yellow">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold">씬 전환 효과:</span>
              <span className="font-bold">{scene.transition.type}</span>
              <span className="text-muted-foreground font-bold">
                ({scene.transition.duration}ms)
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
