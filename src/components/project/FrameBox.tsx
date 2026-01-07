import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Check, Play, Circle, Square, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ShotFrame, Library } from '@/types/schema'
import { generateBlockPrompt, formatSemanticKey } from '@/lib/promptBuilder'

interface PromptStructure {
  subject?: string
  composition?: string
  style?: string
  details?: string
  parameters?: string
  // Legacy fields kept for backward compatibility
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

interface LegacyFrame {
  shotType?: string
  duration?: number
  description?: string
  promptStructure?: PromptStructure
  prompt?: string
  parameters?: string
  imageUrl?: string
  motion?: Motion
}

// Union type for both legacy and new format
type Frame = LegacyFrame | ShotFrame

interface FrameBoxProps {
  frame: Frame
  type: 'start' | 'middle' | 'end'
  sceneId: string
  library?: Library  // V8 스키마용 라이브러리
}

export function FrameBox({ frame, type, sceneId, library }: FrameBoxProps) {
  const cacheKey = `frame_image_${sceneId}_${type}`
  const promptCacheKey = `frame_prompt_${sceneId}_${type}`
  const fileInputRef = useRef<HTMLInputElement>(null)

  // V8 promptBlock이 있는지 확인
  const isV8Format = (f: Frame): f is ShotFrame => {
    return 'promptBlock' in f && f.promptBlock !== undefined
  }

  // 캐시에서 이미지 URL 불러오기
  const getCachedUrl = () => {
    const cached = localStorage.getItem(cacheKey)
    if (isV8Format(frame)) {
      return cached || ''
    }
    return cached || frame.imageUrl || ''
  }

  // promptStructure를 조합하여 프롬프트 생성 (레거시)
  const combinePromptStructure = (structure: PromptStructure): string => {
    const parts: string[] = []

    // 새로운 구조 필드들 (순서 중요)
    if (structure.subject) parts.push(structure.subject)
    if (structure.composition) parts.push(structure.composition)
    if (structure.style) parts.push(structure.style)
    if (structure.details) parts.push(structure.details)
    if (structure.parameters) parts.push(structure.parameters)

    // 레거시 필드들도 포함 (하위 호환성)
    if (structure.lighting) parts.push(structure.lighting)
    if (structure.colors) parts.push(structure.colors)
    if (structure.mood) parts.push(structure.mood)
    if (structure.environment) parts.push(structure.environment)
    if (structure.quality) parts.push(structure.quality)
    if (structure.camera) parts.push(structure.camera)
    if (structure.poseAction) parts.push(structure.poseAction)
    if (structure.emotion) parts.push(structure.emotion)
    if (structure.expression) parts.push(structure.expression)
    if (structure.specialEffects) parts.push(structure.specialEffects)

    return parts.filter(Boolean).join(' ')
  }

  // 캐시에서 프롬프트 불러오기
  const getCachedPrompt = () => {
    const cached = localStorage.getItem(promptCacheKey)
    if (cached) return cached

    // V8 포맷: promptBlock에서 프롬프트 생성
    if (isV8Format(frame) && library) {
      return generateBlockPrompt(library, frame.promptBlock)
    }

    // 레거시: promptStructure에서 생성
    if (!isV8Format(frame) && frame.promptStructure) {
      return combinePromptStructure(frame.promptStructure)
    }

    // 폴백: prompt 필드 사용
    return !isV8Format(frame) ? (frame.prompt || '') : ''
  }

  const [copied, setCopied] = useState(false)
  const [copiedMotion, setCopiedMotion] = useState(false)
  const [imageUrl, setImageUrl] = useState(getCachedUrl())
  const [showImage, setShowImage] = useState(!!getCachedUrl())
  const [prompt, setPrompt] = useState(getCachedPrompt())
  const [isEditingPrompt, setIsEditingPrompt] = useState(false)
  const [showPromptStructure, setShowPromptStructure] = useState(false)

  // 비디오 URL 상태
  const videoCacheKey = `frame_video_${sceneId}_${type}`
  const getCachedVideoUrl = () => localStorage.getItem(videoCacheKey) || ''
  const [videoUrl, setVideoUrl] = useState(getCachedVideoUrl())
  const [showVideo, setShowVideo] = useState(!!getCachedVideoUrl())

  // 이미지 URL 변경 시 localStorage에 저장
  useEffect(() => {
    if (imageUrl.trim()) {
      localStorage.setItem(cacheKey, imageUrl)
    }
  }, [imageUrl, cacheKey])

  // 프롬프트 변경 시 localStorage에 저장
  useEffect(() => {
    if (prompt.trim()) {
      localStorage.setItem(promptCacheKey, prompt)
    }
  }, [prompt, promptCacheKey])

  // 비디오 URL 변경 시 localStorage에 저장
  useEffect(() => {
    if (videoUrl.trim()) {
      localStorage.setItem(videoCacheKey, videoUrl)
    }
  }, [videoUrl, videoCacheKey])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyMotion = async () => {
    if (frame.motion?.en) {
      await navigator.clipboard.writeText(frame.motion.en)
      setCopiedMotion(true)
      setTimeout(() => setCopiedMotion(false), 2000)
    }
  }

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      console.log('이미지 저장:', cacheKey, imageUrl)
      setShowImage(true)
      localStorage.setItem(cacheKey, imageUrl)
    }
  }

  const handleAddVideo = () => {
    if (videoUrl.trim()) {
      console.log('비디오 저장:', videoCacheKey, videoUrl)
      setShowVideo(true)
      localStorage.setItem(videoCacheKey, videoUrl)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    // 파일 크기 확인 (5MB 제한)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert('이미지 파일이 너무 큽니다. 5MB 이하의 이미지를 사용해주세요.')
      return
    }

    // 파일을 base64로 변환
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string

      try {
        // localStorage에 저장 시도
        localStorage.setItem(cacheKey, base64)
        setImageUrl(base64)
        setShowImage(true)
      } catch (error) {
        console.error('localStorage 저장 실패:', error)

        // localStorage 용량 초과 시 URL만 표시
        alert('⚠️ 저장 공간이 부족합니다.\n\n이미지를 외부 호스팅(Imgur, Cloudinary 등)에 업로드한 후 URL을 입력해주세요.\n\n또는 더 작은 크기의 이미지를 사용해주세요.')

        // 임시로 표시는 하되 저장하지 않음
        setImageUrl(base64)
        setShowImage(true)
      }
    }
    reader.readAsDataURL(file)
  }

  const Icon = type === 'start' ? Play : type === 'middle' ? Circle : Square
  const typeColor = type === 'start' ? 'text-green-500' : type === 'middle' ? 'text-blue-500' : 'text-red-500'
  const typeLabel = type === 'start' ? 'START' : type === 'middle' ? 'MIDDLE' : 'END'

  const shotTypeLabel = frame.shotType
    ? frame.shotType.charAt(0).toUpperCase() + frame.shotType.slice(1).replace('-', ' ')
    : 'Unknown'

  return (
    <div className="space-y-4 p-6 rounded-xl border border-white/10 backdrop-blur-xl bg-background/30">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-5 w-5', typeColor)} />
          <h3 className={cn('font-semibold text-lg', typeColor)}>{typeLabel}</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
            {shotTypeLabel}
          </span>
          {frame.duration && (
            <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
              {frame.duration}초
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {frame.description && (
        <p className="text-sm text-muted-foreground">{frame.description}</p>
      )}

      {/* Prompt Structure Toggle - V8 Format */}
      {isV8Format(frame) && frame.promptBlock && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPromptStructure(!showPromptStructure)}
          className="w-full justify-start text-xs text-muted-foreground hover:text-foreground"
        >
          {showPromptStructure ? '▼' : '▶'} Prompt Block (V8)
        </Button>
      )}

      {/* V8 Prompt Block Details */}
      {showPromptStructure && isV8Format(frame) && frame.promptBlock && (
        <div className="p-3 rounded-lg bg-background/50 border border-white/10 space-y-3 text-xs">
          {/* Base References */}
          <div className="space-y-1">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Base</div>
            {frame.promptBlock.base_character_id && (
              <div className="flex gap-2 items-start">
                <span className="text-muted-foreground min-w-[100px]">Character:</span>
                <span className="text-foreground font-mono text-[11px] bg-blue-500/10 px-2 py-0.5 rounded">
                  {frame.promptBlock.base_character_id}
                </span>
              </div>
            )}
            {frame.promptBlock.base_location_id && (
              <div className="flex gap-2 items-start">
                <span className="text-muted-foreground min-w-[100px]">Location:</span>
                <span className="text-foreground font-mono text-[11px] bg-green-500/10 px-2 py-0.5 rounded">
                  {frame.promptBlock.base_location_id}
                </span>
              </div>
            )}
          </div>

          {/* Override Values */}
          {frame.promptBlock.override && Object.keys(frame.promptBlock.override).length > 0 && (
            <>
              <div className="border-t border-white/10"></div>
              <div className="space-y-1">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Override</div>
                {Object.entries(frame.promptBlock.override).map(([key, value]) => (
                  value && (
                    <div key={key} className="flex gap-2 items-start">
                      <span className="text-muted-foreground min-w-[100px]">
                        {formatSemanticKey(key)}:
                      </span>
                      <span className="text-foreground flex-1">{value}</span>
                    </div>
                  )
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Legacy Prompt Structure Toggle */}
      {!isV8Format(frame) && frame.promptStructure && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPromptStructure(!showPromptStructure)}
          className="w-full justify-start text-xs text-muted-foreground hover:text-foreground"
        >
          {showPromptStructure ? '▼' : '▶'} Prompt Structure
        </Button>
      )}

      {/* Legacy Prompt Structure Details */}
      {showPromptStructure && !isV8Format(frame) && frame.promptStructure && (
        <div className="p-3 rounded-lg bg-background/50 border border-white/10 space-y-1 text-xs">
          {/* 새로운 필드들을 먼저 표시 */}
          {['subject', 'composition', 'style', 'details', 'parameters'].map((key) => {
            const value = frame.promptStructure?.[key as keyof PromptStructure]
            if (!value) return null
            return (
              <div key={key} className="flex gap-2">
                <span className="text-muted-foreground min-w-[100px]">{key}:</span>
                <span className="text-foreground">{value}</span>
              </div>
            )
          })}
          {/* 레거시 필드들 구분선과 함께 표시 */}
          {Object.entries(frame.promptStructure)
            .filter(([key]) => !['subject', 'composition', 'style', 'details', 'parameters'].includes(key))
            .some(([, value]) => value) && (
            <>
              <div className="border-t border-white/10 my-2"></div>
              {Object.entries(frame.promptStructure)
                .filter(([key]) => !['subject', 'composition', 'style', 'details', 'parameters'].includes(key))
                .map(([key, value]) => (
                  value && (
                    <div key={key} className="flex gap-2">
                      <span className="text-muted-foreground min-w-[100px] opacity-70">{key}:</span>
                      <span className="text-foreground opacity-70">{value}</span>
                    </div>
                  )
                ))}
            </>
          )}
        </div>
      )}

      {/* Prompt */}
      <div className="relative">
        <div className="p-4 rounded-lg bg-background/50 border border-white/10 backdrop-blur-xl">
          {isEditingPrompt ? (
            <div className="space-y-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-background border border-white/20 rounded-lg px-3 py-2 text-sm font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setPrompt(getCachedPrompt())
                    setIsEditingPrompt(false)
                  }}
                >
                  취소
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsEditingPrompt(false)}
                >
                  저장
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <p
                className="text-sm font-mono leading-relaxed flex-1 break-words cursor-pointer hover:text-primary/80 transition-colors"
                onClick={() => setIsEditingPrompt(true)}
              >
                {prompt}
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <div className="flex gap-2">
          <Input
            placeholder="이미지 URL 입력 (Enter로 추가)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddImage()
              }
          }}
          className="bg-background/50 border-white/10"
        />
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-full border-white/20 hover:bg-white/10 shrink-0"
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>

        {/* Image Preview */}
        {showImage && imageUrl && (
          <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black">
            <img
              src={imageUrl}
              alt={`${typeLabel} 미리보기`}
              className="w-full h-auto object-contain"
              onError={() => setShowImage(false)}
            />
          </div>
        )}
      </div>

      {/* Motion Section */}
      {frame.motion && (
        <div className="p-4 rounded-lg bg-background/50 border border-white/10 backdrop-blur-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
            <span>영상 움직임</span>
            {frame.motion.speed && (
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 normal-case">
                {frame.motion.speed}
              </span>
            )}
          </div>

          {/* Korean Motion Description */}
          {frame.motion.ko && (
            <p className="text-sm text-foreground leading-relaxed">
              {frame.motion.ko}
            </p>
          )}

          {/* English Motion Prompt with Copy */}
          {frame.motion.en && (
            <div className="relative">
              <div className="flex items-start justify-between gap-4 p-3 rounded-md bg-background/80 border border-white/5">
                <p className="text-xs font-mono text-muted-foreground leading-relaxed flex-1 break-words">
                  {frame.motion.en}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyMotion}
                  className="shrink-0 h-7 w-7 p-0"
                >
                  {copiedMotion ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video Upload */}
      <div className="space-y-3">
        <Input
          placeholder="비디오 URL 입력 (Enter로 추가)"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAddVideo()
            }
          }}
          className="bg-background/50 border-white/10"
        />

        {/* Video Preview */}
        {showVideo && videoUrl && (
          <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black">
            <video
              src={videoUrl}
              controls
              className="w-full h-auto"
              onError={() => setShowVideo(false)}
            >
              브라우저가 비디오를 지원하지 않습니다.
            </video>
          </div>
        )}
      </div>
    </div>
  )
}
