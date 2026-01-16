import { useState } from 'react'
import { Menu, Upload, FileText, X, RefreshCw, Download, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'

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
  const { t } = useLanguage()

  const extractScenarioText = () => {
    let text = ''

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

    if (script) {
      text += script + '\n\n'
    }

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

  const handleCopy = () => {
    const text = extractScenarioText()
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const text = extractScenarioText()
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    let filename = 'scenario.txt'
    if (scenario && typeof scenario === 'object' && scenario.title) {
      filename = `${scenario.title}_scenario.txt`
    }

    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="h-full px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <a href="/" className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="Logo" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg" />
              <div>
                <h1 className="text-sm sm:text-base font-semibold">AI TOOLBOX</h1>
              </div>
            </a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {scenario && (
              <Button
                variant="outline"
                onClick={() => setShowScenario(true)}
                size="sm"
              >
                <FileText className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{t.scenario}</span>
              </Button>
            )}
            <Button
              onClick={onUpload}
              size="sm"
            >
              <Upload className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t.upload}</span>
            </Button>
            <Button
              onClick={onBackup}
              variant="secondary"
              size="sm"
            >
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t.backup}</span>
            </Button>
            <Button
              onClick={onReset}
              variant="destructive"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t.reset}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Scenario Modal */}
      {showScenario && scenario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowScenario(false)}
          />
          <div className="relative bg-background border rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">{t.scenario}</h2>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">{t.copied}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">{t.copy}</span>
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="secondary"
                  size="sm"
                >
                  <Download className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t.download}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowScenario(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-5rem)]">
              <div className="space-y-6">
                {/* Scenario Overview */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold border-b pb-2">{t.scenarioOverview}</h3>
                  <div className="text-sm leading-relaxed space-y-4">
                    {(() => {
                      if (scenario && typeof scenario === 'object') {
                        return (
                          <>
                            {scenario.logline && (
                              <div className="bg-muted p-4 rounded-lg">
                                <p className="text-sm font-medium mb-2">{t.logline}</p>
                                <p className="text-sm text-muted-foreground">{scenario.logline}</p>
                              </div>
                            )}
                            {scenario.synopsis && (
                              <div className="bg-muted p-4 rounded-lg">
                                <p className="text-sm font-medium mb-2">{t.synopsis}</p>
                                <p className="text-sm text-muted-foreground">{scenario.synopsis}</p>
                              </div>
                            )}
                            {scenario.treatment && (
                              <div className="space-y-3">
                                <p className="text-sm font-medium">{t.treatment}</p>
                                <div className="bg-muted p-4 rounded-lg">
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{scenario.treatment}</p>
                                </div>
                              </div>
                            )}
                          </>
                        )
                      }

                      const scenarioText = typeof scenario === 'string' ? scenario : ''
                      return (
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{scenarioText}</p>
                        </div>
                      )
                    })()}
                  </div>
                </div>

                {/* Script */}
                {script && (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold border-b pb-2">{t.script}</h3>
                    <div className="bg-muted p-4 rounded-lg text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                      {script}
                    </div>
                  </div>
                )}

                {/* Scene Breakdown */}
                {scenes && scenes.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold border-b pb-2">{t.sceneBreakdown}</h3>
                    <div className="space-y-3">
                      {scenes.map((scene, index) => {
                        const sceneNum = scene.scene || scene.sceneNumber || index + 1
                        const frames = scene.frames || scene.shots

                        return (
                          <div key={index} className="bg-muted p-4 rounded-lg">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-md">
                                {t.scene} {sceneNum}
                              </span>
                              <div className="flex-1 min-w-0">
                                {scene.title && (
                                  <h4 className="font-medium text-sm">{scene.title}</h4>
                                )}
                                {scene.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {scene.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {frames && (
                              <div className="pl-3 border-l-2 border-border">
                                <div className="space-y-2">
                                  {['start', 'middle', 'end'].map((frameType, idx) => {
                                    const frame = frames[frameType as keyof typeof frames]
                                    if (!frame || !frame.description) return null

                                    return (
                                      <div key={frameType} className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 bg-background flex items-center justify-center rounded-full border">
                                          <span className="text-xs font-medium">{idx + 1}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                          {frame.description}
                                        </p>
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
