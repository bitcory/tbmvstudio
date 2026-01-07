import { useState } from 'react'
import { Menu, Upload, FileText, X, RefreshCw, Download, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Motion {
  ko?: string
  en?: string
}

interface Frame {
  shotType?: string
  duration?: number
  description?: string
  prompt?: string
  motion?: Motion
}

interface Setting {
  location?: string
  timeOfDay?: string
  atmosphere?: string
}

interface Scene {
  scene?: number
  sceneNumber?: number
  sceneId?: string
  title?: string
  description?: string
  setting?: Setting
  frames?: {
    start?: Frame
    middle?: Frame
    end?: Frame
  }
  shots?: {
    start?: Frame
    middle?: Frame
    end?: Frame
  }
}

interface ScenarioData {
  title?: string
  summary?: string
  script?: string
  logline?: string
  synopsis?: string
  treatment?: string
}

interface HeaderProps {
  onMenuClick: () => void
  onUpload: () => void
  onReset: () => void
  onBackup: () => void
  scenario?: string | ScenarioData
  script?: string
  scenes?: Scene[]
}

export function Header({ onMenuClick, onUpload, onReset, onBackup, scenario, script, scenes }: HeaderProps) {
  const [showScenario, setShowScenario] = useState(false)
  const [copied, setCopied] = useState(false)

  // 시나리오 텍스트 추출 함수
  const extractScenarioText = () => {
    let text = ''

    // 시나리오 개요
    if (scenario && typeof scenario === 'object') {
      if (scenario.logline) {
        text += scenario.logline + '\n\n'
      }
      if (scenario.synopsis) {
        text += scenario.synopsis + '\n\n'
      }
      if (scenario.treatment) {
        text += scenario.treatment + '\n\n'
      }
    } else if (typeof scenario === 'string') {
      text += scenario + '\n\n'
    }

    // 대본
    if (script) {
      text += script + '\n\n'
    }

    // 씬별 구성
    if (scenes && scenes.length > 0) {
      scenes.forEach((scene) => {
        if (scene.title) text += scene.title + '\n'
        if (scene.description) text += scene.description + '\n'

        const frames = scene.frames || scene.shots
        if (frames) {
          ;['start', 'middle', 'end'].forEach((frameType) => {
            const frame = frames[frameType as keyof typeof frames]
            if (frame && frame.description) {
              text += frame.description + '\n'
            }
          })
        }
        text += '\n'
      })
    }

    return text.trim()
  }

  // 복사 함수
  const handleCopy = () => {
    const text = extractScenarioText()
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 다운로드 함수
  const handleDownload = () => {
    const text = extractScenarioText()
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    // 파일명 생성 (시나리오 제목 또는 기본값)
    let filename = 'scenario.txt'
    if (scenario && typeof scenario === 'object' && scenario.title) {
      filename = `${scenario.title}_시나리오.txt`
    }

    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b-3 border-foreground bg-neo-yellow">
        <div className="h-full px-3 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden h-8 w-8 sm:h-10 sm:w-10"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            <a href="/" className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="Logo" className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg" />
              <div>
                <h1 className="text-sm sm:text-base md:text-lg font-semibold">TB영상제작소</h1>
              </div>
            </a>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            {scenario && (
              <Button
                variant="outline"
                onClick={() => setShowScenario(true)}
                className="h-8 sm:h-9 md:h-10 px-2 sm:px-3 md:px-4 text-xs sm:text-sm bg-white"
                size="sm"
              >
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1.5 md:mr-2" />
                <span className="hidden sm:inline">시나리오</span>
              </Button>
            )}
            <Button
              onClick={onUpload}
              className="h-8 sm:h-9 md:h-10 px-2.5 sm:px-3 md:px-4 text-xs sm:text-sm"
              size="sm"
            >
              <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline ml-1.5">업로드</span>
            </Button>
            <Button
              onClick={onBackup}
              className="h-8 sm:h-9 md:h-10 px-2.5 sm:px-3 md:px-4 text-xs sm:text-sm bg-neo-cyan"
              size="sm"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline ml-1.5">백업</span>
            </Button>
            <Button
              onClick={onReset}
              variant="destructive"
              className="h-8 sm:h-9 md:h-10 px-2.5 sm:px-3 md:px-4 text-xs sm:text-sm"
              size="sm"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline ml-1.5">초기화</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Scenario Modal */}
      {showScenario && scenario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-foreground/50"
            onClick={() => setShowScenario(false)}
          />
          <div className="relative bg-white border-3 border-foreground shadow-[8px_8px_0_hsl(var(--foreground))] w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b-3 border-foreground bg-neo-purple">
              <h2 className="text-lg font-bold text-white">시나리오</h2>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="bg-white"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">복사됨</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">복사</span>
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="secondary"
                  size="sm"
                >
                  <Download className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">다운로드</span>
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setShowScenario(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Content - 단일 탭으로 통합 */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-6rem)]">
              <div className="space-y-6">
                {/* 시나리오 개요 섹션 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-foreground neo-divider pb-2">시나리오 개요</h3>
                  <div className="text-sm leading-relaxed font-sans text-foreground space-y-4">
                    {(() => {
                      // scenario가 객체인 경우
                      if (scenario && typeof scenario === 'object') {
                        return (
                          <>
                            {scenario.logline && (
                              <div className="neo-subsection bg-neo-yellow/20 p-4">
                                <p className="text-sm font-black text-foreground mb-2">로그라인</p>
                                <p className="text-sm text-foreground">{scenario.logline}</p>
                              </div>
                            )}
                            {scenario.synopsis && (
                              <div className="neo-subsection bg-neo-cream p-4">
                                <p className="text-sm font-black text-foreground mb-2">시놉시스</p>
                                <p className="text-sm text-foreground">{scenario.synopsis}</p>
                              </div>
                            )}
                            {scenario.treatment && (
                              <div className="space-y-3">
                                <p className="text-sm font-black text-foreground">트리트먼트</p>
                                {(() => {
                                  // treatment를 막 단위로 분리
                                  const treatmentText = scenario.treatment
                                  const parts = treatmentText.split(/(\d+막\s*\([^)]+\):)/)
                                  const elements: React.ReactElement[] = []
                                  let currentText = ''

                                  for (let i = 0; i < parts.length; i++) {
                                    const part = parts[i]

                                    // "X막 (제목):" 패턴인 경우
                                    if (/^\d+막\s*\([^)]+\):$/.test(part)) {
                                      // 이전 텍스트가 있으면 먼저 렌더링
                                      if (currentText.trim()) {
                                        elements.push(
                                          <p key={`text-${i}`} className="text-foreground/90">
                                            {currentText.trim()}
                                          </p>
                                        )
                                        currentText = ''
                                      }

                                      // 다음 부분이 막 내용
                                      const actContent = parts[i + 1]?.trim() || ''
                                      elements.push(
                                        <div key={`act-${i}`} className="neo-subsection bg-neo-cream p-4">
                                          <p className="text-sm font-black text-foreground mb-2">{part}</p>
                                          <p className="text-sm text-foreground">{actContent}</p>
                                        </div>
                                      )
                                      i++ // 다음 부분은 이미 처리했으므로 스킵
                                    } else {
                                      currentText += part
                                    }
                                  }

                                  // 남은 텍스트 처리
                                  if (currentText.trim()) {
                                    elements.push(
                                      <p key="final" className="text-foreground">
                                        {currentText.trim()}
                                      </p>
                                    )
                                  }

                                  return elements.length > 0 ? elements : (
                                    <div className="neo-subsection bg-neo-cream p-4">
                                      <p className="text-sm text-foreground whitespace-pre-wrap">{treatmentText}</p>
                                    </div>
                                  )
                                })()}
                              </div>
                            )}
                          </>
                        )
                      }

                      // scenario가 문자열인 경우 (기존 로직)
                      const scenarioText = typeof scenario === 'string' ? scenario : ''
                      const parts = scenarioText.split(/(\d+막:)/)
                      const elements: React.ReactElement[] = []
                      let currentText = ''

                      for (let i = 0; i < parts.length; i++) {
                        const part = parts[i]

                        // "X막:" 패턴인 경우
                        if (/^\d+막:$/.test(part)) {
                          // 이전 텍스트가 있으면 먼저 렌더링
                          if (currentText.trim()) {
                            elements.push(
                              <p key={`text-${i}`} className="text-foreground">
                                {currentText.trim()}
                              </p>
                            )
                            currentText = ''
                          }

                          // 다음 부분이 막 내용
                          const actContent = parts[i + 1]?.trim() || ''
                          elements.push(
                            <div key={`act-${i}`} className="neo-subsection bg-neo-cream p-4">
                              <p className="text-sm font-black text-foreground mb-2">{part}</p>
                              <p className="text-sm text-foreground">{actContent}</p>
                            </div>
                          )
                          i++ // 다음 부분은 이미 처리했으므로 스킵
                        } else {
                          currentText += part
                        }
                      }

                      // 남은 텍스트 처리
                      if (currentText.trim()) {
                        currentText.split('\n\n').forEach((para, idx) => {
                          if (para.trim()) {
                            elements.push(
                              <p key={`final-${idx}`} className="text-foreground">
                                {para.trim()}
                              </p>
                            )
                          }
                        })
                      }

                      return elements
                    })()}
                  </div>
                </div>

                {/* 대본 섹션 */}
                {script && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-foreground neo-divider pb-2">영상 대본</h3>
                    <div className="neo-subsection bg-neo-cream p-4 text-sm leading-relaxed whitespace-pre-wrap font-sans text-foreground">
                      {script}
                    </div>
                  </div>
                )}

                {/* 씬별 구성 섹션 */}
                {scenes && scenes.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-foreground neo-divider pb-2">씬별 구성</h3>
                    <div className="space-y-3">
                      {scenes.map((scene, index) => {
                        const sceneNum = scene.scene || scene.sceneNumber || index + 1
                        const frames = scene.frames || scene.shots

                        return (
                          <div key={index} className="neo-subsection bg-neo-cream p-4">
                            {/* 씬 헤더 */}
                            <div className="flex items-center gap-3 mb-3">
                              <span className="px-3 py-1 bg-neo-yellow text-foreground text-sm font-bold flex-shrink-0 border-2 border-foreground shadow-[2px_2px_0_hsl(var(--foreground))]">
                                Scene {sceneNum}
                              </span>
                              <div className="flex-1 min-w-0">
                                {scene.title && (
                                  <h4 className="font-bold text-sm text-foreground">{scene.title}</h4>
                                )}
                                {scene.description && (
                                  <p className="text-sm text-foreground/80 leading-relaxed">
                                    {scene.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* 씬 내용 흐름 - 항상 표시 */}
                            {frames && (
                              <div className="pl-3 border-l-3 border-foreground/20">
                                <div className="space-y-3">
                                  {['start', 'middle', 'end'].map((frameType, idx) => {
                                    const frame = frames[frameType as keyof typeof frames]
                                    if (!frame || !frame.description) return null

                                    return (
                                      <div key={frameType} className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 bg-white flex items-center justify-center border-2 border-foreground shadow-[2px_2px_0_hsl(var(--foreground))]">
                                          <span className="text-xs font-bold text-foreground">{idx + 1}</span>
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-sm text-foreground/90 leading-relaxed">
                                            {frame.description}
                                          </p>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
