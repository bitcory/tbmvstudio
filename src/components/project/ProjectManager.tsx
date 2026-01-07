import { useState } from 'react'
import { ChevronDown, Image as ImageIcon, Video, FileText, Copy, Check } from 'lucide-react'
import { SceneCard } from './SceneCard'
import { EmptyState } from './EmptyState'
import { Button } from '@/components/ui/button'
import JSZip from 'jszip'

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

  if (!projectData) {
    return <EmptyState />
  }

  const currentScene = projectData.scenes[selectedSceneIndex]

  // fullScript 추출
  const getFullScript = (): string => {
    if (!projectData.scenario) return ''
    if (typeof projectData.scenario === 'string') return projectData.scenario
    return projectData.scenario.fullScript || projectData.scenario.summary || ''
  }

  const fullScript = getFullScript()

  // localStorage에서 모든 이미지/비디오 URL 수집
  const collectMediaUrls = (type: 'image' | 'video') => {
    const urls: { url: string; name: string }[] = []

    // 디버깅을 위한 로그
    console.log(`=== ${type} URL 수집 시작 ===`)

    projectData.scenes.forEach((scene, index) => {
      // SceneCard와 동일한 sceneId 생성 로직 사용
      const sceneId = scene.sceneId || scene.id || `scene_${index}`
      const sceneNum = scene.sceneNumber || scene.scene || index + 1

      console.log(`Scene ${sceneNum} - sceneId: ${sceneId}`)

      const types = ['start', 'middle', 'end']

      types.forEach((frameType) => {
        const key = type === 'image'
          ? `frame_image_${sceneId}_${frameType}`
          : `frame_video_${sceneId}_${frameType}`

        const url = localStorage.getItem(key)

        if (url) {
          console.log(`✓ ${key} 발견`)
          const fileName = `scene${sceneNum}_${frameType}.${type === 'image' ? 'jpg' : 'mp4'}`
          urls.push({ url, name: fileName })
        }
      })
    })

    console.log(`총 ${urls.length}개의 ${type} URL 수집 완료`)
    return urls
  }

  // ZIP 다운로드 함수
  const downloadMediaAsZip = async (type: 'image' | 'video') => {
    setDownloading(true)
    try {
      const mediaUrls = collectMediaUrls(type)

      console.log(`${type} 다운로드 시작:`, mediaUrls)

      if (mediaUrls.length === 0) {
        alert(`다운로드할 ${type === 'image' ? '이미지' : '비디오'}가 없습니다.\n\n${type === 'image' ? '이미지' : '비디오'} URL을 입력하고 Enter를 눌러 추가해주세요.`)
        setDownloading(false)
        return
      }

      const zip = new JSZip()
      const folder = zip.folder(type === 'image' ? 'images' : 'videos')
      let successCount = 0
      let failedUrls: string[] = []

      // CORS 문제로 직접 다운로드가 안 될 경우를 대비한 URL 리스트 파일 생성
      let urlListContent = `# ${projectData.project.title} - ${type === 'image' ? '이미지' : '비디오'} URL 목록\n\n`

      // 모든 파일을 fetch하여 zip에 추가
      await Promise.all(
        mediaUrls.map(async ({ url, name }) => {
          try {
            console.log(`Fetching: ${name} from ${url}`)

            // URL 리스트에 추가
            urlListContent += `${name}: ${url}\n`

            // CORS 모드로 시도
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
            console.log(`✓ Success: ${name}`)
          } catch (error) {
            console.error(`✗ Failed to fetch ${name}:`, error)

            // CORS 에러일 경우 no-cors 모드로 재시도
            try {
              await fetch(url, { mode: 'no-cors' })
              // no-cors 모드에서는 response를 읽을 수 없지만,
              // 적어도 네트워크 요청이 성공했다는 것을 알 수 있음
              console.log(`⚠ ${name}: CORS 제한으로 직접 다운로드 불가`)
              failedUrls.push(`${name} (CORS 제한)`)
            } catch (secondError) {
              console.error(`✗ ${name}: 네트워크 오류`, secondError)
              failedUrls.push(`${name} (네트워크 오류)`)
            }
          }
        })
      )

      // CORS 문제가 있을 때만 URL 리스트 파일 추가
      if (failedUrls.length > 0) {
        folder?.file('url_list.txt', urlListContent)
      }

      if (successCount === 0) {
        // 모든 파일이 실패했더라도 URL 목록은 다운로드
        const content = await zip.generateAsync({ type: 'blob' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(content)
        link.download = `${projectData.project.title}_${type}_urls.zip`
        link.click()
        URL.revokeObjectURL(link.href)

        alert(`CORS 정책으로 인해 직접 다운로드할 수 없습니다.\n\nURL 목록 파일을 다운로드했습니다.\n각 URL을 브라우저에서 직접 열어 다운로드하거나,\n다운로드 매니저를 사용해주세요.`)
        setDownloading(false)
        return
      }

      // ZIP 생성 및 다운로드
      const content = await zip.generateAsync({ type: 'blob' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(content)
      link.download = `${projectData.project.title}_${type}s.zip`
      link.click()
      URL.revokeObjectURL(link.href)

      if (failedUrls.length > 0) {
        alert(`다운로드 완료\n\n✅ 성공: ${successCount}개\n⚠️ 실패: ${failedUrls.length}개\n\n실패한 파일은 url_list.txt 파일에서 확인하고\n브라우저에서 직접 다운로드해주세요.`)
      } else {
        console.log(`모든 ${type} 다운로드 완료: ${successCount}개`)
      }
    } catch (error) {
      console.error('Download failed:', error)
      alert('다운로드에 실패했습니다.\n\n브라우저 콘솔을 확인해주세요.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 풀스크립트 섹션 - 데이터가 있을 때만 표시 */}
      {fullScript && (
        <div className="neo-section p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-neo-purple" />
              <h3 className="text-base font-black text-neo-purple">풀스크립트</h3>
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
                className="h-8 px-2"
              >
                {copiedFullScript ? (
                  <Check className="h-4 w-4 text-neo-green" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullScript(!showFullScript)}
                className="text-xs font-bold"
              >
                {showFullScript ? '접기' : '펼치기'}
              </Button>
            </div>
          </div>
          {showFullScript && (
            <div className="neo-subsection bg-neo-cream p-4">
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {fullScript}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Project Info & Scene Selector - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Project Info & Description Combined */}
        <div className="neo-section p-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm flex-1 min-w-0">
              <div className="flex gap-2 items-center">
                <span className="text-muted-foreground font-bold shrink-0">제목:</span>
                <span className="font-bold truncate">{projectData.project.title}</span>
              </div>
              <div className="flex gap-4">
                <div className="flex gap-2 items-center">
                  <span className="text-muted-foreground font-bold shrink-0">화면 비율:</span>
                  <span className="font-bold">{projectData.project.aspectRatio}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-muted-foreground font-bold shrink-0">총 길이:</span>
                  <span className="font-bold">{projectData.project.totalDuration}</span>
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
                className="flex-1 sm:flex-none bg-white"
              >
                <ImageIcon className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">이미지 다운</span>
              </Button>
              <Button
                onClick={() => downloadMediaAsZip('video')}
                disabled={downloading}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none bg-white"
              >
                <Video className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">비디오 다운</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Scene Selector Dropdown */}
        <div className="neo-section bg-neo-yellow p-3">
          <div className="relative">
            <select
              value={selectedSceneIndex}
              onChange={(e) => setSelectedSceneIndex(Number(e.target.value))}
              className="neo-subsection w-full bg-white px-4 py-2 pr-10 text-sm text-foreground font-bold appearance-none focus:outline-none cursor-pointer"
            >
              {projectData.scenes.map((scene, index) => {
                const sceneNum = scene.scene || scene.sceneNumber || index + 1
                const sceneDesc = scene.description || scene.title || ''
                const sceneLabel = sceneDesc
                  ? `Scene ${sceneNum}: ${sceneDesc}`
                  : `Scene ${sceneNum}`

                return (
                  <option key={scene.sceneId || scene.id || index} value={index}>
                    {sceneLabel}
                  </option>
                )
              })}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground pointer-events-none" />
          </div>
        </div>
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
