import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, User, Copy, Check, MapPin, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { generateBlockPrompt } from '@/lib/promptBuilder'
import type { Library, PromptBlock } from '@/types/schema'

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

interface KeyProp {
  id: string
  name: string
  description: string
  visualDescription: string
  consistency?: string
  consistency_tr?: string
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
  id?: string
  title?: string
  description?: string
  duration?: number
  setting?: Setting
  [key: string]: any
}

interface VisualConceptTabsProps {
  characters: Character[]
  keyProps?: KeyProp[]
  scenes?: Scene[]
  library?: any  // V8 library 지원
  onUpdateCharacters?: (characters: Character[]) => void
  onUpdateKeyProps?: (keyProps: KeyProp[]) => void
}

type TabType = 'characters' | 'locations' | 'keyProps'

interface LocationData {
  id: string
  scene: number
  title: string
  location: string
  timeOfDay: string
  atmosphere: string
}

export function VisualConceptTabs({
  characters = [],
  keyProps = [],
  scenes = [],
  library,
  onUpdateCharacters,
  onUpdateKeyProps
}: VisualConceptTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('characters')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [characterImages, setCharacterImages] = useState<Record<string, string>>({})
  const [keyPropImages, setKeyPropImages] = useState<Record<string, string>>({})
  const [locationImages, setLocationImages] = useState<Record<string, string>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [locationOverrides, setLocationOverrides] = useState<Record<string, LocationData>>({})
  const [fullPromptOverrides, setFullPromptOverrides] = useState<Record<string, string>>({})

  // V8 데이터를 레거시 포맷으로 변환하는 헬퍼 함수
  const convertV8ToCharacter = (id: string, data: any): Character & { blocks?: any } => {
    const blocks = data.blocks || {}
    return {
      id,
      name: data.name || id,
      role: blocks.genre || '',
      description: blocks.char_desc || '',
      visualDescription: Object.entries(blocks)
        .filter(([key]) => key.startsWith('char_') || key === 'style_main')
        .map(([key, value]) => `${key}: ${value}`)
        .join(', '),
      blocks // V8 blocks 데이터 보존
    }
  }

  const convertV8ToKeyProp = (id: string, data: any): KeyProp & { blocks?: any } => {
    const blocks = data.blocks || {}
    return {
      id,
      name: data.name || id,
      description: blocks.prop_name || blocks.prop_detail || '',
      visualDescription: Object.entries(blocks)
        .filter(([key]) => key.startsWith('prop_'))
        .map(([key, value]) => `${key}: ${value}`)
        .join(', '),
      blocks // V8 blocks 데이터 보존
    }
  }

  const convertV8ToLocation = (id: string, data: any): LocationData & { blocks?: any } => {
    const blocks = data.blocks || {}
    return {
      id,
      scene: 0,
      title: data.name || id,
      location: blocks.loc_main || data.name || id,
      timeOfDay: blocks.loc_light_mood || '',
      atmosphere: blocks.atmosphere || '',
      blocks // V8 blocks 데이터 보존
    }
  }

  // V8 라이브러리에서 캐릭터와 장소 추출
  const v8Characters = library?.characters
    ? Object.entries(library.characters).map(([id, data]: [string, any]) =>
      convertV8ToCharacter(id, data))
    : []

  const v8Locations = library?.locations
    ? Object.entries(library.locations).map(([id, data]: [string, any]) =>
      convertV8ToLocation(id, data))
    : []

  const v8Props = library?.props
    ? Object.entries(library.props).map(([id, data]: [string, any]) =>
      convertV8ToKeyProp(id, data))
    : []

  // 레거시와 V8 캐릭터 병합
  const allCharacters: Character[] = [
    ...characters,
    ...v8Characters.filter(v8 => !characters.find(c => c.id === v8.id))
  ]

  // 레거시와 V8 소품 병합
  const allKeyProps: KeyProp[] = [
    ...keyProps,
    ...v8Props.filter(v8 => !keyProps.find(p => p.id === v8.id))
  ]

  // 장소 정보 추출 (씬에서 중복 제거) - 오버라이드 적용
  const locations: LocationData[] = scenes
    .filter(scene => scene.setting?.location)
    .map(scene => {
      const locId = `loc_${scene.sceneId || scene.id || scene.scene || scene.sceneNumber}`
      const override = locationOverrides[locId]

      return {
        id: locId,
        scene: scene.scene || scene.sceneNumber || 0,
        title: scene.title || '',
        location: override?.location || scene.setting!.location!,
        timeOfDay: override?.timeOfDay || scene.setting?.timeOfDay || '',
        atmosphere: override?.atmosphere || scene.setting?.atmosphere || ''
      }
    })
    .reduce<LocationData[]>((acc, curr) => {
      // 중복된 location 제거
      const exists = acc.find((l: LocationData) => l.location === curr.location)
      if (!exists) {
        acc.push(curr)
      }
      return acc
    }, [])

  // 레거시와 V8 장소 병합
  const allLocations: LocationData[] = [
    ...locations,
    ...v8Locations.filter(v8 => !locations.find(l => l.location === v8.location))
  ]

  // 탭 변경 시 첫 번째 아이템 자동 선택
  useEffect(() => {
    if (activeTab === 'characters') {
      if (allCharacters.length > 0) {
        setSelectedId(allCharacters[0].id)
      }
    } else if (activeTab === 'keyProps') {
      if (allKeyProps.length > 0) {
        setSelectedId(allKeyProps[0].id)
      }
    } else if (activeTab === 'locations') {
      if (allLocations.length > 0) {
        setSelectedId(allLocations[0].id)
      }
    }
  }, [activeTab])

  // localStorage에서 이미지와 장소 데이터 로드
  useEffect(() => {
    const charImages: Record<string, string> = {}
    const propImages: Record<string, string> = {}
    const locImages: Record<string, string> = {}
    const locOverrides: Record<string, LocationData> = {}
    const fullPrompts: Record<string, string> = {}

    characters.forEach(char => {
      const saved = localStorage.getItem(`character_image_${char.id}`)
      if (saved) charImages[char.id] = saved
    })

    keyProps.forEach(prop => {
      const saved = localStorage.getItem(`keyprop_image_${prop.id}`)
      if (saved) propImages[prop.id] = saved
    })

    // 장소 이미지와 오버라이드 데이터 로드
    scenes.forEach(scene => {
      if (scene.setting?.location) {
        const locId = `loc_${scene.sceneId || scene.id || scene.scene || scene.sceneNumber}`
        const savedImage = localStorage.getItem(`location_image_${locId}`)
        if (savedImage) locImages[locId] = savedImage

        const savedData = localStorage.getItem(`location_data_${locId}`)
        if (savedData) {
          try {
            locOverrides[locId] = JSON.parse(savedData)
          } catch (e) {
            console.error('Failed to parse location data:', e)
          }
        }

        const savedFullPrompt = localStorage.getItem(`location_full_prompt_${locId}`)
        if (savedFullPrompt) fullPrompts[locId] = savedFullPrompt
      }
    })

    setCharacterImages(charImages)
    setKeyPropImages(propImages)
    setLocationImages(locImages)
    setLocationOverrides(locOverrides)
    setFullPromptOverrides(fullPrompts)
  }, [characters, keyProps, scenes])

  const handleAddCharacter = () => {
    if (!onUpdateCharacters) return
    const newCharacter: Character = {
      id: `char_${Date.now()}`,
      name: '새 캐릭터',
      role: '',
      description: '',
      visualDescription: ''
    }
    onUpdateCharacters([...characters, newCharacter])
    setSelectedId(newCharacter.id)
    setEditingId(newCharacter.id)
  }

  const handleAddKeyProp = () => {
    if (!onUpdateKeyProps) return
    const newProp: KeyProp = {
      id: `prop_${Date.now()}`,
      name: '새 소품',
      description: '',
      visualDescription: ''
    }
    onUpdateKeyProps([...keyProps, newProp])
    setSelectedId(newProp.id)
    setEditingId(newProp.id)
  }

  const handleDeleteCharacter = (id: string) => {
    if (!onUpdateCharacters) return
    if (confirm('이 캐릭터를 삭제하시겠습니까?')) {
      onUpdateCharacters(characters.filter(c => c.id !== id))
      localStorage.removeItem(`character_image_${id}`)
      if (selectedId === id) {
        setSelectedId(characters[0]?.id || null)
      }
    }
  }

  const handleDeleteKeyProp = (id: string) => {
    if (!onUpdateKeyProps) return
    if (confirm('이 소품을 삭제하시겠습니까?')) {
      onUpdateKeyProps(keyProps.filter(p => p.id !== id))
      localStorage.removeItem(`keyprop_image_${id}`)
      if (selectedId === id) {
        setSelectedId(keyProps[0]?.id || null)
      }
    }
  }

  const handleUpdateCharacter = (id: string, field: string, value: string) => {
    if (!onUpdateCharacters) return
    onUpdateCharacters(characters.map(char =>
      char.id === id ? { ...char, [field]: value } : char
    ))
  }

  const handleUpdateKeyProp = (id: string, field: string, value: string) => {
    if (!onUpdateKeyProps) return
    onUpdateKeyProps(keyProps.map(prop =>
      prop.id === id ? { ...prop, [field]: value } : prop
    ))
  }

  const handleImageUrlChange = (type: 'character' | 'keyprop' | 'location', id: string, url: string) => {
    if (type === 'character') {
      setCharacterImages(prev => ({ ...prev, [id]: url }))
      localStorage.setItem(`character_image_${id}`, url)
    } else if (type === 'keyprop') {
      setKeyPropImages(prev => ({ ...prev, [id]: url }))
      localStorage.setItem(`keyprop_image_${id}`, url)
    } else {
      setLocationImages(prev => ({ ...prev, [id]: url }))
      localStorage.setItem(`location_image_${id}`, url)
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // 현재 탭에 따른 선택된 아이템
  const selectedCharacter = activeTab === 'characters'
    ? allCharacters.find(c => c.id === selectedId)
    : null
  const selectedKeyProp = activeTab === 'keyProps'
    ? allKeyProps.find(p => p.id === selectedId)
    : null
  const selectedLocation = activeTab === 'locations'
    ? allLocations.find(l => l.id === selectedId)
    : null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 border-3 border-foreground shadow-[4px_4px_0_hsl(var(--foreground))] rounded-xl">
        <h2 className="text-2xl font-black flex items-center gap-2">
          <span className="w-4 h-8 bg-neo-purple inline-block border-2 border-foreground rotate-12"></span>
          비주얼 컨셉
        </h2>
        {activeTab === 'characters' && (
          <Button onClick={handleAddCharacter} size="sm" className="bg-neo-green text-foreground border-3 border-foreground hover:bg-neo-green hover:translate-y-[2px] hover:shadow-none shadow-[4px_4px_0_hsl(var(--foreground))] transition-all font-bold rounded-lg h-10 px-4">
            <Plus className="h-5 w-5 mr-2" />
            캐릭터 추가
          </Button>
        )}
        {activeTab === 'keyProps' && (
          <Button onClick={handleAddKeyProp} size="sm" className="bg-neo-green text-foreground border-3 border-foreground hover:bg-neo-green hover:translate-y-[2px] hover:shadow-none shadow-[4px_4px_0_hsl(var(--foreground))] transition-all font-bold rounded-lg h-10 px-4">
            <Plus className="h-5 w-5 mr-2" />
            소품 추가
          </Button>
        )}
      </div>

      {/* Main Tabs */}
      <div className="flex gap-4 border-b-3 border-foreground pb-1 px-2 overflow-x-auto">
        <Button
          variant="ghost"
          onClick={() => setActiveTab('characters')}
          className={cn(
            "rounded-t-xl rounded-b-none border-x-3 border-t-3 border-b-0 h-12 px-6 transition-all text-base",
            activeTab === 'characters'
              ? "bg-neo-yellow border-foreground text-foreground font-black shadow-[4px_-4px_0_hsl(var(--foreground))] -translate-y-1 z-10"
              : "bg-white border-foreground/50 text-muted-foreground hover:bg-neo-yellow/50 hover:text-foreground mt-2"
          )}
        >
          <User className="h-5 w-5 mr-2" />
          캐릭터 ({allCharacters.length})
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveTab('locations')}
          className={cn(
            "rounded-t-xl rounded-b-none border-x-3 border-t-3 border-b-0 h-12 px-6 transition-all text-base",
            activeTab === 'locations'
              ? "bg-neo-blue border-foreground text-foreground font-black shadow-[4px_-4px_0_hsl(var(--foreground))] -translate-y-1 z-10"
              : "bg-white border-foreground/50 text-muted-foreground hover:bg-neo-blue/50 hover:text-foreground mt-2"
          )}
        >
          <MapPin className="h-5 w-5 mr-2" />
          장소 ({allLocations.length})
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveTab('keyProps')}
          className={cn(
            "rounded-t-xl rounded-b-none border-x-3 border-t-3 border-b-0 h-12 px-6 transition-all text-base",
            activeTab === 'keyProps'
              ? "bg-neo-pink border-foreground text-foreground font-black shadow-[4px_-4px_0_hsl(var(--foreground))] -translate-y-1 z-10"
              : "bg-white border-foreground/50 text-muted-foreground hover:bg-neo-pink/50 hover:text-foreground mt-2"
          )}
        >
          <Package className="h-5 w-5 mr-2" />
          소품 ({allKeyProps.length})
        </Button>
      </div>

      {activeTab === 'characters' && (
        <div className="neo-section p-6 rounded-b-xl border-t-0 -mt-1.5 min-h-[500px]">
          {allCharacters.length > 0 ? (
            <>
              {/* Character Sub-tabs */}
              <div className="overflow-x-auto scrollbar-hide mb-6 p-2">
                <div className="flex gap-3 min-w-fit">
                  {allCharacters.map((character) => (
                    <Button
                      key={character.id}
                      variant="ghost"
                      onClick={() => setSelectedId(character.id)}
                      className={cn(
                        "rounded-lg border-2 transition-all whitespace-nowrap px-4 py-2 h-auto text-sm",
                        selectedId === character.id
                          ? "bg-foreground text-white border-foreground font-bold shadow-[3px_3px_0_rgba(255,255,255,0.5)] transform -translate-y-0.5"
                          : "bg-white text-foreground border-foreground hover:bg-foreground hover:text-white hover:shadow-[3px_3px_0_rgba(255,255,255,0.5)]"
                      )}
                    >
                      <User className="h-4 w-4 mr-2" />
                      {character.name || '이름 없음'}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedCharacter && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="bg-white border-3 border-foreground shadow-[8px_8px_0_hsl(var(--foreground))] rounded-xl overflow-hidden">
                    <CardHeader className="bg-neo-yellow border-b-3 border-foreground py-4 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="bg-white p-2 rounded-lg border-2 border-foreground shadow-[2px_2px_0_hsl(var(--foreground))]">
                          <User className="h-5 w-5 text-foreground" />
                        </div>
                        <div className="flex flex-col">
                          {editingId === selectedCharacter.id ? (
                            <Input
                              value={selectedCharacter.name}
                              onChange={(e) => handleUpdateCharacter(selectedCharacter.id, 'name', e.target.value)}
                              onBlur={() => setEditingId(null)}
                              placeholder="캐릭터 이름"
                              className="h-8 max-w-[160px] bg-white border-2 border-foreground shadow-none rounded-md px-2"
                              autoFocus
                            />
                          ) : (
                            <CardTitle className="cursor-pointer truncate text-lg font-black" onClick={() => setEditingId(selectedCharacter.id)}>
                              {selectedCharacter.name || '이름 없음'}
                            </CardTitle>
                          )}
                          <Badge variant="outline" className="bg-white border-2 border-foreground text-xs font-bold w-fit mt-1">
                            {selectedCharacter.role || '역할 없음'}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCharacter(selectedCharacter.id)}
                        className="text-foreground hover:text-red-600 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {/* V8 Blocks 데이터 표시 */}
                      {(selectedCharacter as any).blocks ? (
                        <>
                          {/* V8 프롬프트 표시 */}
                          {library && (() => {
                            try {
                              // 임시 promptBlock 생성 (캐릭터 데이터만 있을 경우)
                              const tempPromptBlock: PromptBlock = {
                                base_character_id: selectedCharacter.id,
                                base_location_id: '', // 빈 장소
                                override: {}
                              }
                              const generatedPrompt = generateBlockPrompt(library as Library, tempPromptBlock)

                              return (
                                <div>
                                  <label className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-neo-yellow rounded-full border border-foreground"></span>
                                    생성된 프롬프트
                                  </label>
                                  <div className="relative group">
                                    <div className="bg-slate-50 border-3 border-foreground rounded-xl p-4 text-sm font-mono min-h-[300px] max-h-[500px] overflow-y-auto shadow-inner">
                                      {generatedPrompt}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCopy(generatedPrompt, `char_prompt_${selectedCharacter.id}`)}
                                      className="absolute top-3 right-3 h-8 w-8 p-0 bg-white border-2 border-foreground rounded-md shadow-[2px_2px_0_hsl(var(--foreground))] hover:translate-y-0.5 hover:shadow-none transition-all z-10 opacity-0 group-hover:opacity-100"
                                    >
                                      {copiedId === `char_prompt_${selectedCharacter.id}` ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              )
                            } catch (e) {
                              console.error('프롬프트 생성 실패:', e)
                              return null
                            }
                          })()}
                        </>
                      ) : (
                        <>
                          <div className="space-y-1">
                            <label className="text-sm font-bold text-foreground">역할</label>
                            <Input
                              value={selectedCharacter.role}
                              onChange={(e) => handleUpdateCharacter(selectedCharacter.id, 'role', e.target.value)}
                              placeholder="주인공, 조연 등"
                              className="bg-white border-2 border-foreground shadow-[3px_3px_0_hsl(var(--foreground))] focus:shadow-[4px_4px_0_hsl(var(--foreground))] focus:-translate-y-0.5 transition-all text-sm rounded-lg"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-bold text-foreground">설명</label>
                            <textarea
                              value={selectedCharacter.description}
                              onChange={(e) => handleUpdateCharacter(selectedCharacter.id, 'description', e.target.value)}
                              placeholder="캐릭터 설명"
                              className="w-full bg-white border-2 border-foreground rounded-lg px-3 py-2 text-sm shadow-[3px_3px_0_hsl(var(--foreground))] focus:shadow-[4px_4px_0_hsl(var(--foreground))] focus:-translate-y-0.5 transition-all resize-none focus:outline-none"
                              rows={3}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-bold text-foreground">비주얼 프롬프트</label>
                            <div className="relative group mt-1">
                              <textarea
                                value={selectedCharacter.visualDescription}
                                onChange={(e) => handleUpdateCharacter(selectedCharacter.id, 'visualDescription', e.target.value)}
                                placeholder="A young man with silver hair..."
                                className="w-full bg-white border-2 border-foreground rounded-lg px-3 py-2 pr-10 text-sm font-mono shadow-[3px_3px_0_hsl(var(--foreground))] focus:shadow-[4px_4px_0_hsl(var(--foreground))] focus:-translate-y-0.5 transition-all resize-none focus:outline-none"
                                rows={6}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(selectedCharacter.visualDescription, `char_visual_${selectedCharacter.id}`)}
                                className="absolute top-3 right-3 h-8 w-8 p-0 bg-white border-2 border-foreground rounded-md shadow-[2px_2px_0_hsl(var(--foreground))] hover:translate-y-0.5 hover:shadow-none transition-all z-10 opacity-0 group-hover:opacity-100"
                              >
                                {copiedId === `char_visual_${selectedCharacter.id}` ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-3 border-foreground shadow-[8px_8px_0_hsl(var(--foreground))] rounded-xl overflow-hidden h-fit">
                    <CardHeader className="bg-neo-yellow border-b-3 border-foreground py-4">
                      <CardTitle className="text-lg font-black">캐릭터 이미지</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground">이미지 URL</label>
                        <Input
                          value={characterImages[selectedCharacter.id] || ''}
                          onChange={(e) => handleImageUrlChange('character', selectedCharacter.id, e.target.value)}
                          placeholder="https://..."
                          className="bg-white border-2 border-foreground shadow-[3px_3px_0_hsl(var(--foreground))] focus:shadow-[4px_4px_0_hsl(var(--foreground))] focus:-translate-y-0.5 transition-all text-sm rounded-lg font-mono"
                        />
                      </div>
                      <div className="w-full aspect-square border-3 border-foreground rounded-xl overflow-hidden bg-white shadow-[4px_4px_0_hsl(var(--foreground))] flex items-center justify-center relative group">
                        {characterImages[selectedCharacter.id] ? (
                          <img
                            src={characterImages[selectedCharacter.id]}
                            alt={selectedCharacter.name}
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-3 text-muted-foreground/50">
                            <User className="w-16 h-16" />
                            <span className="font-bold text-sm">이미지 없음</span>
                          </div>
                        )}
                        {characterImages[selectedCharacter.id] && (
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              className="bg-white border-2 border-foreground text-foreground hover:bg-slate-100 h-8 w-8 shadow-[2px_2px_0_hsl(var(--foreground))]"
                              onClick={() => window.open(characterImages[selectedCharacter.id], '_blank')}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-foreground/50 gap-4">
              <User className="w-16 h-16 opacity-50" />
              <p className="font-bold text-lg">등록된 캐릭터가 없습니다.</p>
              <Button onClick={handleAddCharacter} className="bg-neo-green text-foreground border-3 border-foreground hover:bg-neo-green shadow-[4px_4px_0_hsl(var(--foreground))] hover:shadow-none hover:translate-y-1 transition-all font-bold">
                첫 캐릭터 추가하기
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'locations' && (
        <div className="neo-section p-6 rounded-b-xl border-t-0 -mt-1.5 min-h-[500px]">
          {allLocations.length > 0 ? (
            <>
              <div className="overflow-x-auto scrollbar-hide mb-6 p-2">
                <div className="flex gap-3 min-w-fit">
                  {allLocations.map((location) => (
                    <Button
                      key={location.id}
                      variant="ghost"
                      onClick={() => setSelectedId(location.id)}
                      className={cn(
                        "rounded-lg border-2 transition-all whitespace-nowrap px-4 py-2 h-auto text-sm",
                        selectedId === location.id
                          ? "bg-foreground text-white border-foreground font-bold shadow-[3px_3px_0_rgba(255,255,255,0.5)] transform -translate-y-0.5"
                          : "bg-white text-foreground border-foreground hover:bg-foreground hover:text-white hover:shadow-[3px_3px_0_rgba(255,255,255,0.5)]"
                      )}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {location.title || (location as any).name || `Scene ${location.scene}`}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedLocation && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="bg-white border-3 border-foreground shadow-[8px_8px_0_hsl(var(--foreground))] rounded-xl overflow-hidden">
                    <CardHeader className="bg-neo-blue border-b-3 border-foreground py-4 text-white">
                      <CardTitle className="text-lg font-black flex items-center gap-2">
                        <div className="bg-white p-1.5 rounded-lg border-2 border-foreground text-foreground shadow-[2px_2px_0_hsl(var(--foreground))]">
                          <MapPin className="h-5 w-5" />
                        </div>
                        Scene {selectedLocation.scene}
                        {selectedLocation.title && `: ${selectedLocation.title}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {/* V8 Blocks 데이터 표시 */}
                      {(selectedLocation as any).blocks ? (
                        <>
                          {/* V8 프롬프트 표시 */}
                          {library && (() => {
                            try {
                              // 임시 promptBlock 생성 (장소 데이터만 있을 경우)
                              const tempPromptBlock: PromptBlock = {
                                base_character_id: '', // 빈 캐릭터
                                base_location_id: selectedLocation.id,
                                override: {}
                              }
                              const generatedPrompt = generateBlockPrompt(library as Library, tempPromptBlock)

                              return (
                                <div>
                                  <label className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-neo-blue rounded-full border border-foreground"></span>
                                    생성된 프롬프트
                                  </label>
                                  <div className="relative group">
                                    <div className="bg-slate-50 border-3 border-foreground rounded-xl p-4 text-sm font-mono min-h-[300px] max-h-[500px] overflow-y-auto shadow-inner">
                                      {generatedPrompt}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCopy(generatedPrompt, `loc_prompt_${selectedLocation.id}`)}
                                      className="absolute top-3 right-3 h-8 w-8 p-0 bg-white border-2 border-foreground rounded-md shadow-[2px_2px_0_hsl(var(--foreground))] hover:translate-y-0.5 hover:shadow-none transition-all z-10 opacity-0 group-hover:opacity-100"
                                    >
                                      {copiedId === `loc_prompt_${selectedLocation.id}` ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              )
                            } catch (e) {
                              console.error('프롬프트 생성 실패:', e)
                              return null
                            }
                          })()}
                        </>
                      ) : (
                        <div>
                          <label className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-neo-blue rounded-full border border-foreground"></span>
                            장소 프롬프트
                          </label>
                          <div className="relative group">
                            <div className="bg-slate-50 border-3 border-foreground rounded-xl p-4 text-sm font-mono min-h-[300px] max-h-[500px] overflow-y-auto shadow-inner">
                              {fullPromptOverrides[selectedLocation.id] || `${selectedLocation.location}${selectedLocation.timeOfDay ? `, ${selectedLocation.timeOfDay}` : ''}${selectedLocation.atmosphere ? `, ${selectedLocation.atmosphere}` : ''}`}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(
                                fullPromptOverrides[selectedLocation.id] ||
                                `${selectedLocation.location}${selectedLocation.timeOfDay ? `, ${selectedLocation.timeOfDay}` : ''}${selectedLocation.atmosphere ? `, ${selectedLocation.atmosphere}` : ''}`,
                                `loc_prompt_legacy_${selectedLocation.id}`
                              )}
                              className="absolute top-3 right-3 h-8 w-8 p-0 bg-white border-2 border-foreground rounded-md shadow-[2px_2px_0_hsl(var(--foreground))] hover:translate-y-0.5 hover:shadow-none transition-all z-10 opacity-0 group-hover:opacity-100"
                            >
                              {copiedId === `loc_prompt_legacy_${selectedLocation.id}` ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-3 border-foreground shadow-[8px_8px_0_hsl(var(--foreground))] rounded-xl overflow-hidden h-fit">
                    <CardHeader className="bg-neo-blue border-b-3 border-foreground py-4 text-white">
                      <CardTitle className="text-lg font-black">장소 이미지</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground">이미지 URL</label>
                        <Input
                          value={locationImages[selectedLocation.id] || ''}
                          onChange={(e) => handleImageUrlChange('location', selectedLocation.id, e.target.value)}
                          placeholder="https://..."
                          className="bg-white border-2 border-foreground shadow-[3px_3px_0_hsl(var(--foreground))] focus:shadow-[4px_4px_0_hsl(var(--foreground))] focus:-translate-y-0.5 transition-all text-sm rounded-lg font-mono"
                        />
                      </div>
                      <div className="w-full aspect-video border-3 border-foreground rounded-xl overflow-hidden bg-white shadow-[4px_4px_0_hsl(var(--foreground))] flex items-center justify-center relative group">
                        {locationImages[selectedLocation.id] ? (
                          <img
                            src={locationImages[selectedLocation.id]}
                            alt={`Scene ${selectedLocation.scene}`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-3 text-muted-foreground/50">
                            <MapPin className="w-16 h-16" />
                            <span className="font-bold text-sm">이미지 없음</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-foreground/50 gap-4">
              <MapPin className="w-16 h-16 opacity-50" />
              <p className="font-bold text-lg">등록된 장소가 없습니다. 씬 설정에서 장소를 입력해주세요.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'keyProps' && (
        <div className="neo-section p-6 rounded-b-xl border-t-0 -mt-1.5 min-h-[500px]">
          {allKeyProps.length > 0 ? (
            <>
              <div className="overflow-x-auto scrollbar-hide mb-6 p-2">
                <div className="flex gap-3 min-w-fit">
                  {allKeyProps.map((prop) => (
                    <Button
                      key={prop.id}
                      variant="ghost"
                      onClick={() => setSelectedId(prop.id)}
                      className={cn(
                        "rounded-lg border-2 transition-all whitespace-nowrap px-4 py-2 h-auto text-sm",
                        selectedId === prop.id
                          ? "bg-foreground text-white border-foreground font-bold shadow-[3px_3px_0_rgba(255,255,255,0.5)] transform -translate-y-0.5"
                          : "bg-white text-foreground border-foreground hover:bg-foreground hover:text-white hover:shadow-[3px_3px_0_rgba(255,255,255,0.5)]"
                      )}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      {prop.name || '이름 없음'}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedKeyProp && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="bg-white border-3 border-foreground shadow-[8px_8px_0_hsl(var(--foreground))] rounded-xl overflow-hidden">
                    <CardHeader className="bg-neo-pink border-b-3 border-foreground py-4 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="bg-white p-2 rounded-lg border-2 border-foreground shadow-[2px_2px_0_hsl(var(--foreground))]">
                          <Package className="h-5 w-5 text-foreground" />
                        </div>
                        <div className="flex flex-col">
                          {editingId === selectedKeyProp.id ? (
                            <Input
                              value={selectedKeyProp.name}
                              onChange={(e) => handleUpdateKeyProp(selectedKeyProp.id, 'name', e.target.value)}
                              onBlur={() => setEditingId(null)}
                              placeholder="소품 이름"
                              className="h-8 max-w-[160px] bg-white border-2 border-foreground shadow-none rounded-md px-2"
                              autoFocus
                            />
                          ) : (
                            <CardTitle className="cursor-pointer truncate text-lg font-black" onClick={() => setEditingId(selectedKeyProp.id)}>
                              {selectedKeyProp.name || '이름 없음'}
                            </CardTitle>
                          )}
                          <Badge variant="outline" className="bg-white border-2 border-foreground text-xs font-bold w-fit mt-1">
                            KEY PROP
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteKeyProp(selectedKeyProp.id)}
                        className="text-foreground hover:text-red-600 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {/* V8 Blocks 데이터 표시 */}
                      {(selectedKeyProp as any).blocks ? (
                        <>
                          {/* V8 프롬프트 표시 */}
                          {library && (() => {
                            try {
                              // 임시 promptBlock 생성 (소품 데이터만 있을 경우)


                              // 소품은 별도 처리 로직이 없어 임시로 표시
                              return (
                                <div>
                                  <label className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-neo-pink rounded-full border border-foreground"></span>
                                    V8 데이터
                                  </label>
                                  <div className="bg-slate-50 border-3 border-foreground rounded-xl p-4 text-sm font-mono shadow-inner">
                                    <pre className="whitespace-pre-wrap">{JSON.stringify((selectedKeyProp as any).blocks, null, 2)}</pre>
                                  </div>
                                </div>
                              )
                            } catch (e) {
                              return null
                            }
                          })()}
                        </>
                      ) : (
                        <>
                          <div className="space-y-1">
                            <label className="text-sm font-bold text-foreground">설명</label>
                            <textarea
                              value={selectedKeyProp.description}
                              onChange={(e) => handleUpdateKeyProp(selectedKeyProp.id, 'description', e.target.value)}
                              placeholder="소품 설명"
                              className="w-full bg-white border-2 border-foreground rounded-lg px-3 py-2 text-sm shadow-[3px_3px_0_hsl(var(--foreground))] focus:shadow-[4px_4px_0_hsl(var(--foreground))] focus:-translate-y-0.5 transition-all resize-none focus:outline-none"
                              rows={3}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-bold text-foreground">비주얼 프롬프트</label>
                            <div className="relative group mt-1">
                              <textarea
                                value={selectedKeyProp.visualDescription}
                                onChange={(e) => handleUpdateKeyProp(selectedKeyProp.id, 'visualDescription', e.target.value)}
                                placeholder="A rusty sword with glowing runes..."
                                className="w-full bg-white border-2 border-foreground rounded-lg px-3 py-2 pr-10 text-sm font-mono shadow-[3px_3px_0_hsl(var(--foreground))] focus:shadow-[4px_4px_0_hsl(var(--foreground))] focus:-translate-y-0.5 transition-all resize-none focus:outline-none"
                                rows={6}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(selectedKeyProp.visualDescription, `prop_visual_${selectedKeyProp.id}`)}
                                className="absolute top-3 right-3 h-8 w-8 p-0 bg-white border-2 border-foreground rounded-md shadow-[2px_2px_0_hsl(var(--foreground))] hover:translate-y-0.5 hover:shadow-none transition-all z-10 opacity-0 group-hover:opacity-100"
                              >
                                {copiedId === `prop_visual_${selectedKeyProp.id}` ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-3 border-foreground shadow-[8px_8px_0_hsl(var(--foreground))] rounded-xl overflow-hidden h-fit">
                    <CardHeader className="bg-neo-pink border-b-3 border-foreground py-4">
                      <CardTitle className="text-lg font-black">소품 이미지</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground">이미지 URL</label>
                        <Input
                          value={keyPropImages[selectedKeyProp.id] || ''}
                          onChange={(e) => handleImageUrlChange('keyprop', selectedKeyProp.id, e.target.value)}
                          placeholder="https://..."
                          className="bg-white border-2 border-foreground shadow-[3px_3px_0_hsl(var(--foreground))] focus:shadow-[4px_4px_0_hsl(var(--foreground))] focus:-translate-y-0.5 transition-all text-sm rounded-lg font-mono"
                        />
                      </div>
                      <div className="w-full aspect-square border-3 border-foreground rounded-xl overflow-hidden bg-white shadow-[4px_4px_0_hsl(var(--foreground))] flex items-center justify-center relative group">
                        {keyPropImages[selectedKeyProp.id] ? (
                          <img
                            src={keyPropImages[selectedKeyProp.id]}
                            alt={selectedKeyProp.name}
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-3 text-muted-foreground/50">
                            <Package className="w-16 h-16" />
                            <span className="font-bold text-sm">이미지 없음</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-foreground/50 gap-4">
              <Package className="w-16 h-16 opacity-50" />
              <p className="font-bold text-lg">등록된 소품이 없습니다.</p>
              <Button onClick={handleAddKeyProp} className="bg-neo-green text-foreground border-3 border-foreground hover:bg-neo-green shadow-[4px_4px_0_hsl(var(--foreground))] hover:shadow-none hover:translate-y-1 transition-all font-bold">
                첫 소품 추가하기
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
