import { useState, useEffect, useRef } from 'react'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { ProjectManager } from './components/project/ProjectManager'
import { VisualConceptTabs } from './components/project/VisualConceptTabs'
import { MultiDownloader } from './components/project/MultiDownloader'
import { PromptGenerator } from './components/project/PromptGenerator'
import { PasswordModal } from './components/auth/PasswordModal'
import { Button } from './components/ui/button'
import { Video, Image, FileText, Music } from 'lucide-react'
import { useLanguage } from './contexts/LanguageContext'

interface PromptStructure {
  subject?: string
  composition?: string
  style?: string
  details?: string
  parameters?: string
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

interface Character {
  id: string
  name: string
  role?: string
  description: string
  visualDescription: string
  consistency?: string | {
    age: string
    gender: string
    build?: string
    hair: string
    eyes: string
    outfit: string
    equipment?: string
    features: string
  }
  consistency_tr?: string | {
    age: string
    gender: string
    build?: string
    hair: string
    eyes: string
    outfit: string
    equipment?: string
    features: string
  }
}

interface Scenario {
  title?: string
  summary?: string
  script?: string
}

interface KeyProp {
  id: string
  name: string
  description: string
  visualDescription: string
  consistency?: string
  consistency_tr?: string
}

interface ProjectData {
  project: {
    title: string
    style: string
    aspectRatio: string
    totalDuration: string | number
    description?: string
    createdAt?: string
  }
  scenario?: string | Scenario
  script?: string
  characters?: Character[]
  keyProps?: KeyProp[]
  scenes: Scene[]
  definitions?: {
    library?: {
      characters?: Record<string, any>
      locations?: Record<string, any>
      props?: Record<string, any>
    }
  }
}

function convertShotsToFrames(data: ProjectData): ProjectData {
  if (!data || !data.scenes) return data

  const convertedScenes = data.scenes.map(scene => {
    if (scene.shots && !scene.frames) {
      return {
        ...scene,
        sceneNumber: scene.scene || scene.sceneNumber,
        frames: scene.shots,
        shots: undefined
      }
    }
    if (scene.scene && !scene.sceneNumber) {
      return { ...scene, sceneNumber: scene.scene }
    }
    return scene
  })

  return {
    ...data,
    scenes: convertedScenes
  }
}

function App() {
  const [isPasswordAuthenticated, setIsPasswordAuthenticated] = useState(() => {
    return localStorage.getItem('passwordAuthenticated') === 'true'
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [projectData, setProjectData] = useState<ProjectData | null>(null)
  const [showNanoStudio, setShowNanoStudio] = useState(false)
  const [showStart, setShowStart] = useState(true)
  const [showVisualConcept, setShowVisualConcept] = useState(false)
  const [showFrameExtractor, setShowFrameExtractor] = useState(false)
  const [showMultiDownloader, setShowMultiDownloader] = useState(false)
  const [showPromptGenerator, setShowPromptGenerator] = useState(false)
  const [, setNanoStudioError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useLanguage()

  useEffect(() => {
    const saved = localStorage.getItem('currentProject')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setProjectData(data)
      } catch (error) {
        console.error('Failed to load saved data:', error)
        localStorage.removeItem('currentProject')
      }
    }
  }, [])

  useEffect(() => {
    if (projectData) {
      localStorage.setItem('currentProject', JSON.stringify(projectData))
    }
  }, [projectData])

  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string)

          if ((json.scene !== undefined || json.sceneNumber !== undefined) && !json.project) {
            const singleSceneData: ProjectData = {
              project: {
                title: 'Test Project',
                style: 'cinematic',
                aspectRatio: '16:9',
                totalDuration: json.duration || 12,
                description: json.description || ''
              },
              scenes: [json]
            }

            const convertedData = convertShotsToFrames(singleSceneData)
            setProjectData(convertedData)
          }
          else if (json.projectData && json.cachedData) {
            const convertedData = convertShotsToFrames(json.projectData)
            setProjectData(convertedData)

            Object.entries(json.cachedData).forEach(([key, value]) => {
              localStorage.setItem(key, value as string)
            })
          }
          else if (json.properties?.projectData) {
            const projectData = json.properties.projectData
            const convertedData = convertShotsToFrames(projectData)
            setProjectData(convertedData)

            if (json.properties.cachedData) {
              Object.entries(json.properties.cachedData).forEach(([key, value]) => {
                localStorage.setItem(key, value as string)
              })
            }
          } else {
            const convertedData = convertShotsToFrames(json)
            setProjectData(convertedData)
          }

          setShowStart(false)
          setShowNanoStudio(false)
          setShowVisualConcept(false)
          setShowFrameExtractor(false)
          setShowMultiDownloader(false)
          setShowPromptGenerator(false)
        } catch (error) {
          alert('JSON parsing error: ' + (error as Error).message)
        }
      }
      reader.onerror = () => {
        alert('Cannot read file.')
      }
      reader.readAsText(file)
    }
  }

  const handleDownload = () => {
    if (!projectData) return

    const cachedData: Record<string, string> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (
        key.startsWith('frame_image_') ||
        key.startsWith('frame_video_') ||
        key.startsWith('frame_prompt_') ||
        key.startsWith('character_image_')
      )) {
        const value = localStorage.getItem(key)
        if (value) {
          cachedData[key] = value
        }
      }
    }

    const exportData = {
      projectData,
      cachedData,
      exportedAt: new Date().toISOString()
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const projectTitle = projectData.project?.title || 'project'
    const exportFileDefaultName = `${projectTitle}_${timestamp}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const handleFullReset = () => {
    if (confirm('Reset all data including project and visual concepts?\nThis cannot be undone.')) {
      setProjectData(null)

      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (
          key.startsWith('frame_image_') ||
          key.startsWith('frame_video_') ||
          key.startsWith('frame_prompt_') ||
          key.startsWith('character_image_') ||
          key === 'currentProject'
        )) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      setShowStart(true)
      setShowNanoStudio(false)
      setShowVisualConcept(false)
      setShowFrameExtractor(false)
      setShowMultiDownloader(false)
      setShowPromptGenerator(false)
    }
  }

  const handleUpdateCharacters = (characters: Character[]) => {
    if (projectData) {
      const updated = { ...projectData, characters }
      setProjectData(updated)
    }
  }

  const handleUpdateKeyProps = (keyProps: KeyProp[]) => {
    if (projectData) {
      const updated = { ...projectData, keyProps }
      setProjectData(updated)
    }
  }

  if (!isPasswordAuthenticated) {
    return <PasswordModal onSuccess={() => setIsPasswordAuthenticated(true)} />
  }

  return (
    <div className="min-h-screen bg-background">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onUpload={handleUpload}
        onReset={handleFullReset}
        onBackup={handleDownload}
        scenario={projectData?.scenario}
        script={projectData?.script}
        scenes={projectData?.scenes}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNanoStudioToggle={() => setShowNanoStudio(!showNanoStudio)}
        showNanoStudio={showNanoStudio}
        onStartToggle={() => setShowStart(!showStart)}
        showStart={showStart}
        onVisualConceptToggle={() => setShowVisualConcept(!showVisualConcept)}
        showVisualConcept={showVisualConcept}
        onFrameExtractorToggle={() => setShowFrameExtractor(!showFrameExtractor)}
        showFrameExtractor={showFrameExtractor}
        onMultiDownloaderToggle={() => setShowMultiDownloader(!showMultiDownloader)}
        showMultiDownloader={showMultiDownloader}
        onPromptGeneratorToggle={() => setShowPromptGenerator(!showPromptGenerator)}
        showPromptGenerator={showPromptGenerator}
      />

      <main className="pt-16 lg:pl-56 min-h-screen">
        <div className="min-h-[calc(100vh-4rem)]">
        {showStart ? (
          <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-background to-muted">
            <div className="flex flex-col items-center justify-center gap-8 p-8">
              <div className="text-center">
                <h1 className="text-5xl md:text-6xl font-bold mb-2">MOVIE MAKER</h1>
                <p className="text-muted-foreground">{t.videoProductionAssistant}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-md">
                <a
                  href="https://gemini.google.com/gem/1zximT5wRr3zL-y3D_4HKAL909Bzwy8I0?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                    <Video className="h-6 w-6" />
                    <span>{t.videoProduction}</span>
                  </Button>
                </a>

                <a
                  href="https://gemini.google.com/gem/1GP-VmJXjQSl3y9FHfLb6X-WIHKss48_4?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                    <FileText className="h-6 w-6" />
                    <span>{t.cfProduction}</span>
                  </Button>
                </a>

                <a
                  href="https://gemini.google.com/gem/17YwS4g-YuAFYoTyfnO78064pVVYS-lbY?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                    <Image className="h-6 w-6" />
                    <span>{t.imageGeneration}</span>
                  </Button>
                </a>

                <a
                  href="https://gemini.google.com/gem/1GMqeS_7sP_v1RUx5OFcSU0vRvXKYZcrf?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                    <Video className="h-6 w-6" />
                    <span>{t.videoGeneration}</span>
                  </Button>
                </a>
              </div>

              <a
                href="https://gemini.google.com/gem/1s8f2dOr9ZGwCBrOWwbeW-8kZ3_qK-AqP?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="px-8 py-6 text-lg">
                  <Music className="h-5 w-5 mr-2" />
                  {t.musicGenerator}
                </Button>
              </a>
            </div>
          </div>
        ) : showVisualConcept ? (
          <div className="p-4">
            <VisualConceptTabs
              characters={projectData?.characters || []}
              keyProps={projectData?.keyProps || []}
              scenes={projectData?.scenes || []}
              library={projectData?.definitions?.library}
              onUpdateCharacters={handleUpdateCharacters}
              onUpdateKeyProps={handleUpdateKeyProps}
            />
          </div>
        ) : showNanoStudio ? (
          <div className="w-full h-[calc(100vh-4rem)] overflow-hidden">
            <iframe
              src="https://tbstudionew.vercel.app/"
              className="w-full h-full"
              title="Nano Studio"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              onError={() => {
                setNanoStudioError(true)
              }}
            />
          </div>
        ) : showFrameExtractor ? (
          <div className="fixed inset-0 top-16 lg:left-56">
            <iframe
              src="https://tbframe.vercel.app/"
              className="w-full h-full border-0"
              title="Frame Extractor"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        ) : showMultiDownloader ? (
          <div className="w-full h-[calc(100vh-4rem)]">
            <MultiDownloader />
          </div>
        ) : showPromptGenerator ? (
          <div className="w-full h-[calc(100vh-4rem)] overflow-y-auto">
            <PromptGenerator />
          </div>
        ) : (
          <div className="p-4">
            <ProjectManager projectData={projectData} />
          </div>
        )}
        </div>
      </main>
    </div>
  )
}

export default App
