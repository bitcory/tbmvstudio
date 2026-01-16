import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'ko' | 'en'

interface Translations {
  // Sidebar
  start: string
  storytelling: string
  visualConcept: string
  freeTools: string
  mjDownload: string
  promptGenerator: string

  // Header
  upload: string
  backup: string
  reset: string
  scenario: string
  scenarioOverview: string
  logline: string
  synopsis: string
  treatment: string
  script: string
  sceneBreakdown: string
  copy: string
  copied: string
  download: string

  // Password Modal
  appTitle: string
  enterPassword: string
  passwordPlaceholder: string
  wrongPassword: string
  checking: string
  enter: string
  copyright: string

  // Project Manager
  projectInfo: string
  title: string
  ratio: string
  duration: string
  fullScript: string
  collapse: string
  expand: string
  images: string
  videos: string
  scene: string
  noImages: string
  noVideos: string
  downloadComplete: string
  downloadFailed: string
  success: string
  failed: string

  // Scene Card
  startFrame: string
  middleFrame: string
  endFrame: string
  transition: string
  prompt: string
  description: string
  imageUrl: string
  videoUrl: string
  copyPrompt: string
  editPrompt: string
  cancel: string
  save: string

  // Visual Concept
  visualConceptTitle: string
  addCharacter: string
  noCharacters: string
  characterName: string
  role: string
  characterDescription: string
  visualDescription: string
  characterImage: string
  protagonist: string
  supporting: string

  // Multi Downloader
  mjDownloadTitle: string
  batchDownload: string
  image: string
  video: string
  urlInput: string
  addInput: string
  selectedDownload: string
  downloadAll: string
  imagePreview: string
  videoPreview: string

  // Main Page
  videoProductionAssistant: string
  videoProduction: string
  cfProduction: string
  imageGeneration: string
  videoGeneration: string
  musicGenerator: string

  // Visual Concept Tabs
  characters: string
  locations: string
  props: string
  addProp: string
  noRole: string
  unnamed: string
  generatedPrompt: string
  locationPrompt: string
  propImage: string
  locationImage: string
  noLocations: string
  noProps: string
  addFirstCharacter: string
  addFirstProp: string
  newCharacter: string
  newProp: string
  deleteCharacter: string
  deleteProp: string
  visualPrompt: string
  noImage: string
  keyProp: string
}

const translations: Record<Language, Translations> = {
  ko: {
    // Sidebar
    start: 'START',
    storytelling: '스토리보드',
    visualConcept: '비주얼 컨셉',
    freeTools: '무료 도구',
    mjDownload: 'MJ 다운로드',
    promptGenerator: '프롬프트 생성기',

    // Header
    upload: '업로드',
    backup: '백업',
    reset: '초기화',
    scenario: '시나리오',
    scenarioOverview: '시나리오 개요',
    logline: '로그라인',
    synopsis: '시놉시스',
    treatment: '트리트먼트',
    script: '스크립트',
    sceneBreakdown: '장면 분석',
    copy: '복사',
    copied: '복사됨',
    download: '다운로드',

    // Password Modal
    appTitle: 'AI 툴비',
    enterPassword: '비밀번호를 입력해주세요',
    passwordPlaceholder: '비밀번호 입력',
    wrongPassword: '비밀번호가 틀렸습니다.',
    checking: '확인 중...',
    enter: '입장',
    copyright: '© 2026 TB영상제작소. All rights reserved.',

    // Project Manager
    projectInfo: '프로젝트 정보',
    title: '제목',
    ratio: '비율',
    duration: '재생시간',
    fullScript: '전체 스크립트',
    collapse: '접기',
    expand: '펼치기',
    images: '이미지',
    videos: '영상',
    scene: '장면',
    noImages: '다운로드할 이미지가 없습니다.',
    noVideos: '다운로드할 영상이 없습니다.',
    downloadComplete: '다운로드 완료',
    downloadFailed: '다운로드 실패',
    success: '성공',
    failed: '실패',

    // Scene Card
    startFrame: '시작 프레임',
    middleFrame: '중간 프레임',
    endFrame: '종료 프레임',
    transition: '전환',
    prompt: '프롬프트',
    description: '설명',
    imageUrl: '이미지 URL',
    videoUrl: '영상 URL',
    copyPrompt: '프롬프트 복사',
    editPrompt: '프롬프트 편집',
    cancel: '취소',
    save: '저장',

    // Visual Concept
    visualConceptTitle: '비주얼 컨셉',
    addCharacter: '캐릭터 추가',
    noCharacters: '등록된 캐릭터가 없습니다.',
    characterName: '캐릭터 이름',
    role: '역할',
    characterDescription: '캐릭터 설명',
    visualDescription: '비주얼 설명 (프롬프트용)',
    characterImage: '캐릭터 이미지',
    protagonist: '주인공',
    supporting: '조연',

    // Multi Downloader
    mjDownloadTitle: '미드저니 다운',
    batchDownload: '이미지/영상 일괄 다운로드',
    image: '이미지',
    video: '영상',
    urlInput: 'URL 입력',
    addInput: '입력창 추가',
    selectedDownload: '선택 다운로드',
    downloadAll: '전체 다운로드',
    imagePreview: '이미지 미리보기',
    videoPreview: '영상 미리보기',

    // Main Page
    videoProductionAssistant: '영상 제작 어시스턴트',
    videoProduction: '영상 제작',
    cfProduction: 'CF 제작',
    imageGeneration: '이미지 생성',
    videoGeneration: '영상 생성',
    musicGenerator: '음악 생성',

    // Visual Concept Tabs
    characters: '캐릭터',
    locations: '장소',
    props: '소품',
    addProp: '소품 추가',
    noRole: '역할 없음',
    unnamed: '이름 없음',
    generatedPrompt: '생성된 프롬프트',
    locationPrompt: '장소 프롬프트',
    propImage: '소품 이미지',
    locationImage: '장소 이미지',
    noLocations: '등록된 장소가 없습니다. 장면 설정에서 장소를 추가하세요.',
    noProps: '등록된 소품이 없습니다.',
    addFirstCharacter: '첫 캐릭터 추가',
    addFirstProp: '첫 소품 추가',
    newCharacter: '새 캐릭터',
    newProp: '새 소품',
    deleteCharacter: '이 캐릭터를 삭제하시겠습니까?',
    deleteProp: '이 소품을 삭제하시겠습니까?',
    visualPrompt: '비주얼 프롬프트',
    noImage: '이미지 없음',
    keyProp: '핵심 소품',
  },
  en: {
    // Sidebar
    start: 'START',
    storytelling: 'Storyboard',
    visualConcept: 'Visual Concept',
    freeTools: 'Free Tools',
    mjDownload: 'MJ Download',
    promptGenerator: 'Prompt Generator',

    // Header
    upload: 'Upload',
    backup: 'Backup',
    reset: 'Reset',
    scenario: 'Scenario',
    scenarioOverview: 'Scenario Overview',
    logline: 'Logline',
    synopsis: 'Synopsis',
    treatment: 'Treatment',
    script: 'Script',
    sceneBreakdown: 'Scene Breakdown',
    copy: 'Copy',
    copied: 'Copied',
    download: 'Download',

    // Password Modal
    appTitle: 'AI Toolbi',
    enterPassword: 'Please enter password',
    passwordPlaceholder: 'Enter password',
    wrongPassword: 'Incorrect password.',
    checking: 'Checking...',
    enter: 'Enter',
    copyright: '© 2026 TB Video Studio. All rights reserved.',

    // Project Manager
    projectInfo: 'Project Info',
    title: 'Title',
    ratio: 'Ratio',
    duration: 'Duration',
    fullScript: 'Full Script',
    collapse: 'Collapse',
    expand: 'Expand',
    images: 'Images',
    videos: 'Videos',
    scene: 'Scene',
    noImages: 'No images to download.',
    noVideos: 'No videos to download.',
    downloadComplete: 'Download complete',
    downloadFailed: 'Download failed',
    success: 'Success',
    failed: 'Failed',

    // Scene Card
    startFrame: 'Start Frame',
    middleFrame: 'Middle Frame',
    endFrame: 'End Frame',
    transition: 'Transition',
    prompt: 'Prompt',
    description: 'Description',
    imageUrl: 'Image URL',
    videoUrl: 'Video URL',
    copyPrompt: 'Copy Prompt',
    editPrompt: 'Edit Prompt',
    cancel: 'Cancel',
    save: 'Save',

    // Visual Concept
    visualConceptTitle: 'Visual Concept',
    addCharacter: 'Add Character',
    noCharacters: 'No characters registered.',
    characterName: 'Character Name',
    role: 'Role',
    characterDescription: 'Character Description',
    visualDescription: 'Visual Description (for prompt)',
    characterImage: 'Character Image',
    protagonist: 'Protagonist',
    supporting: 'Supporting',

    // Multi Downloader
    mjDownloadTitle: 'Midjourney Download',
    batchDownload: 'Batch download images/videos',
    image: 'Image',
    video: 'Video',
    urlInput: 'URL Input',
    addInput: 'Add Input',
    selectedDownload: 'Download Selected',
    downloadAll: 'Download All',
    imagePreview: 'Image Preview',
    videoPreview: 'Video Preview',

    // Main Page
    videoProductionAssistant: 'Video Production Assistant',
    videoProduction: 'Video Production',
    cfProduction: 'CF Production',
    imageGeneration: 'Image Generation',
    videoGeneration: 'Video Generation',
    musicGenerator: 'Music Generator',

    // Visual Concept Tabs
    characters: 'Characters',
    locations: 'Locations',
    props: 'Props',
    addProp: 'Add Prop',
    noRole: 'No role',
    unnamed: 'Unnamed',
    generatedPrompt: 'Generated Prompt',
    locationPrompt: 'Location Prompt',
    propImage: 'Prop Image',
    locationImage: 'Location Image',
    noLocations: 'No locations registered. Add locations in scene settings.',
    noProps: 'No props registered.',
    addFirstCharacter: 'Add First Character',
    addFirstProp: 'Add First Prop',
    newCharacter: 'New Character',
    newProp: 'New Prop',
    deleteCharacter: 'Delete this character?',
    deleteProp: 'Delete this prop?',
    visualPrompt: 'Visual Prompt',
    noImage: 'No image',
    keyProp: 'Key Prop',
  }
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language')
    return (saved as Language) || 'ko'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const value = {
    language,
    setLanguage,
    t: translations[language]
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
