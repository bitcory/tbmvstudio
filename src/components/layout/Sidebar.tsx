import { useState } from 'react'
import { Film, X, Home, Palette, ChevronDown, ChevronUp, Wand2, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onNanoStudioToggle: () => void
  showNanoStudio: boolean
  onStartToggle: () => void
  showStart: boolean
  onVisualConceptToggle: () => void
  showVisualConcept: boolean
  onFrameExtractorToggle: () => void
  showFrameExtractor: boolean
  onMultiDownloaderToggle: () => void
  showMultiDownloader: boolean
  onPromptGeneratorToggle: () => void
  showPromptGenerator: boolean
}

type TabType = 'start' | 'project' | 'visual' | 'nano' | 'frameExtractor' | 'multiDownloader' | 'promptGenerator'

export function Sidebar({ isOpen, onClose, onNanoStudioToggle, showNanoStudio, onStartToggle, showStart, onVisualConceptToggle, showVisualConcept, onFrameExtractorToggle, showFrameExtractor, onMultiDownloaderToggle, showMultiDownloader, onPromptGeneratorToggle, showPromptGenerator }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('start')
  const [freeToolsOpen, setFreeToolsOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 left-0 bottom-0 w-56 border-r bg-background z-40 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Close button for mobile */}
          <div className="lg:hidden p-4 border-b">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="p-4 border-b">
            <div className="space-y-1">
              <Button
                variant={showStart ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab('start')
                  if (!showStart) onStartToggle()
                  if (showNanoStudio) onNanoStudioToggle()
                  if (showVisualConcept) onVisualConceptToggle()
                  if (showFrameExtractor) onFrameExtractorToggle()
                  onClose()
                }}
              >
                <Home className="h-4 w-4 mr-2" />
                {t.start}
              </Button>
              <Button
                variant={activeTab === 'project' && !showStart && !showNanoStudio && !showVisualConcept && !showFrameExtractor ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab('project')
                  if (showStart) onStartToggle()
                  if (showNanoStudio) onNanoStudioToggle()
                  if (showVisualConcept) onVisualConceptToggle()
                  if (showFrameExtractor) onFrameExtractorToggle()
                  onClose()
                }}
              >
                <Film className="h-4 w-4 mr-2" />
                {t.storytelling}
              </Button>
              <Button
                variant={showVisualConcept ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab('visual')
                  if (showStart) onStartToggle()
                  if (showNanoStudio) onNanoStudioToggle()
                  if (showFrameExtractor) onFrameExtractorToggle()
                  if (!showVisualConcept) onVisualConceptToggle()
                  onClose()
                }}
              >
                <Palette className="h-4 w-4 mr-2" />
                {t.visualConcept}
              </Button>

              {/* Free Tools Dropdown */}
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => setFreeToolsOpen(!freeToolsOpen)}
                >
                  <span className="flex items-center">
                    <Wand2 className="h-4 w-4 mr-2" />
                    {t.freeTools}
                  </span>
                  {freeToolsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>

                {freeToolsOpen && (
                  <div className="pl-6 space-y-1">
                    <Button
                      variant={showMultiDownloader ? "secondary" : "ghost"}
                      className="w-full justify-start text-sm"
                      onClick={() => {
                        setActiveTab('multiDownloader')
                        if (showStart) onStartToggle()
                        if (showVisualConcept) onVisualConceptToggle()
                        if (showNanoStudio) onNanoStudioToggle()
                        if (showFrameExtractor) onFrameExtractorToggle()
                        if (showPromptGenerator) onPromptGeneratorToggle()
                        if (!showMultiDownloader) onMultiDownloaderToggle()
                        onClose()
                      }}
                    >
                      {t.mjDownload}
                    </Button>
                    <Button
                      variant={showPromptGenerator ? "secondary" : "ghost"}
                      className="w-full justify-start text-sm"
                      onClick={() => {
                        setActiveTab('promptGenerator')
                        if (showStart) onStartToggle()
                        if (showVisualConcept) onVisualConceptToggle()
                        if (showNanoStudio) onNanoStudioToggle()
                        if (showFrameExtractor) onFrameExtractorToggle()
                        if (showMultiDownloader) onMultiDownloaderToggle()
                        if (!showPromptGenerator) onPromptGeneratorToggle()
                        onClose()
                      }}
                    >
                      {t.promptGenerator}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {/* Additional content can go here */}
          </div>

          {/* Language Toggle */}
          <div className="p-4 border-t">
            <div className="flex items-center justify-center gap-1">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <div className="flex rounded-md border">
                <Button
                  variant={language === 'ko' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-r-none px-3 h-8"
                  onClick={() => setLanguage('ko')}
                >
                  KO
                </Button>
                <Button
                  variant={language === 'en' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-l-none px-3 h-8"
                  onClick={() => setLanguage('en')}
                >
                  EN
                </Button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
