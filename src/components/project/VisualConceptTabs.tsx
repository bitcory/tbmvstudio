import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, User, Copy, Check, MapPin, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { generateBlockPrompt } from '@/lib/promptBuilder'
import type { Library, PromptBlock } from '@/types/schema'
import { useLanguage } from '@/contexts/LanguageContext'

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
  library?: any
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
  const { t } = useLanguage()

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
      blocks
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
      blocks
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
      blocks
    }
  }

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

  const allCharacters: Character[] = [
    ...characters,
    ...v8Characters.filter(v8 => !characters.find(c => c.id === v8.id))
  ]

  const allKeyProps: KeyProp[] = [
    ...keyProps,
    ...v8Props.filter(v8 => !keyProps.find(p => p.id === v8.id))
  ]

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
      const exists = acc.find((l: LocationData) => l.location === curr.location)
      if (!exists) {
        acc.push(curr)
      }
      return acc
    }, [])

  const allLocations: LocationData[] = [
    ...locations,
    ...v8Locations.filter(v8 => !locations.find(l => l.location === v8.location))
  ]

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
      name: t.newCharacter,
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
      name: t.newProp,
      description: '',
      visualDescription: ''
    }
    onUpdateKeyProps([...keyProps, newProp])
    setSelectedId(newProp.id)
    setEditingId(newProp.id)
  }

  const handleDeleteCharacter = (id: string) => {
    if (!onUpdateCharacters) return
    if (confirm(t.deleteCharacter)) {
      onUpdateCharacters(characters.filter(c => c.id !== id))
      localStorage.removeItem(`character_image_${id}`)
      if (selectedId === id) {
        setSelectedId(characters[0]?.id || null)
      }
    }
  }

  const handleDeleteKeyProp = (id: string) => {
    if (!onUpdateKeyProps) return
    if (confirm(t.deleteProp)) {
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t.characterSettingsTitle}</h2>
        {activeTab === 'characters' && (
          <Button onClick={handleAddCharacter} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t.addCharacter}
          </Button>
        )}
        {activeTab === 'keyProps' && (
          <Button onClick={handleAddKeyProp} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t.addProp}
          </Button>
        )}
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <Button
          variant={activeTab === 'characters' ? "default" : "ghost"}
          onClick={() => setActiveTab('characters')}
        >
          <User className="h-4 w-4 mr-2" />
          {t.characters} ({allCharacters.length})
        </Button>
        <Button
          variant={activeTab === 'locations' ? "default" : "ghost"}
          onClick={() => setActiveTab('locations')}
        >
          <MapPin className="h-4 w-4 mr-2" />
          {t.locations} ({allLocations.length})
        </Button>
        <Button
          variant={activeTab === 'keyProps' ? "default" : "ghost"}
          onClick={() => setActiveTab('keyProps')}
        >
          <Package className="h-4 w-4 mr-2" />
          {t.props} ({allKeyProps.length})
        </Button>
      </div>

      {activeTab === 'characters' && (
        <div className="space-y-6">
          {allCharacters.length > 0 ? (
            <>
              {/* Character Sub-tabs */}
              <div className="overflow-x-auto">
                <div className="flex gap-2 min-w-fit">
                  {allCharacters.map((character) => (
                    <Button
                      key={character.id}
                      variant={selectedId === character.id ? "secondary" : "outline"}
                      onClick={() => setSelectedId(character.id)}
                      size="sm"
                    >
                      <User className="h-4 w-4 mr-2" />
                      {character.name || t.unnamed}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedCharacter && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <User className="h-5 w-5" />
                        <div className="flex flex-col">
                          {editingId === selectedCharacter.id ? (
                            <Input
                              value={selectedCharacter.name}
                              onChange={(e) => handleUpdateCharacter(selectedCharacter.id, 'name', e.target.value)}
                              onBlur={() => setEditingId(null)}
                              placeholder={t.characterName}
                              className="h-8 max-w-[160px]"
                              autoFocus
                            />
                          ) : (
                            <CardTitle className="cursor-pointer truncate text-lg" onClick={() => setEditingId(selectedCharacter.id)}>
                              {selectedCharacter.name || t.unnamed}
                            </CardTitle>
                          )}
                          <Badge variant="outline" className="w-fit mt-1">
                            {selectedCharacter.role || t.noRole}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCharacter(selectedCharacter.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(selectedCharacter as any).blocks ? (
                        <>
                          {library && (() => {
                            try {
                              const tempPromptBlock: PromptBlock = {
                                base_character_id: selectedCharacter.id,
                                base_location_id: '',
                                override: {}
                              }
                              const generatedPrompt = generateBlockPrompt(library as Library, tempPromptBlock)

                              return (
                                <div>
                                  <label className="text-sm font-medium mb-2 block">{t.generatedPrompt}</label>
                                  <div className="relative group">
                                    <div className="bg-muted rounded-lg p-4 text-sm font-mono min-h-[200px] max-h-[400px] overflow-y-auto">
                                      {generatedPrompt}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleCopy(generatedPrompt, `char_prompt_${selectedCharacter.id}`)}
                                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      {copiedId === `char_prompt_${selectedCharacter.id}` ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </Button>
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
                          <div className="space-y-2">
                            <label className="text-sm font-medium">{t.role}</label>
                            <Input
                              value={selectedCharacter.role}
                              onChange={(e) => handleUpdateCharacter(selectedCharacter.id, 'role', e.target.value)}
                              placeholder={`${t.protagonist}, ${t.supporting}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">{t.description}</label>
                            <textarea
                              value={selectedCharacter.description}
                              onChange={(e) => handleUpdateCharacter(selectedCharacter.id, 'description', e.target.value)}
                              placeholder={t.characterDescription}
                              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">{t.visualPrompt}</label>
                            <div className="relative group">
                              <textarea
                                value={selectedCharacter.visualDescription}
                                onChange={(e) => handleUpdateCharacter(selectedCharacter.id, 'visualDescription', e.target.value)}
                                placeholder="A young man with silver hair..."
                                className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                                rows={5}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCopy(selectedCharacter.visualDescription, `char_visual_${selectedCharacter.id}`)}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                {copiedId === `char_visual_${selectedCharacter.id}` ? (
                                  <Check className="h-4 w-4 text-green-500" />
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

                  <Card>
                    <CardHeader>
                      <CardTitle>{t.characterImage}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t.imageUrl}</label>
                        <Input
                          value={characterImages[selectedCharacter.id] || ''}
                          onChange={(e) => handleImageUrlChange('character', selectedCharacter.id, e.target.value)}
                          placeholder="https://..."
                          className="font-mono text-sm"
                        />
                      </div>
                      <div className="w-full aspect-square border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                        {characterImages[selectedCharacter.id] ? (
                          <img
                            src={characterImages[selectedCharacter.id]}
                            alt={selectedCharacter.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <User className="w-12 h-12" />
                            <span className="text-sm">{t.noImage}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-4">
              <User className="w-12 h-12" />
              <p>{t.noCharacters}</p>
              <Button onClick={handleAddCharacter}>
                {t.addFirstCharacter}
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'locations' && (
        <div className="space-y-6">
          {allLocations.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <div className="flex gap-2 min-w-fit">
                  {allLocations.map((location) => (
                    <Button
                      key={location.id}
                      variant={selectedId === location.id ? "secondary" : "outline"}
                      onClick={() => setSelectedId(location.id)}
                      size="sm"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {location.title || (location as any).name || `${t.scene} ${location.scene}`}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedLocation && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        {t.scene} {selectedLocation.scene}
                        {selectedLocation.title && `: ${selectedLocation.title}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(selectedLocation as any).blocks ? (
                        <>
                          {library && (() => {
                            try {
                              const tempPromptBlock: PromptBlock = {
                                base_character_id: '',
                                base_location_id: selectedLocation.id,
                                override: {}
                              }
                              const generatedPrompt = generateBlockPrompt(library as Library, tempPromptBlock)

                              return (
                                <div>
                                  <label className="text-sm font-medium mb-2 block">{t.generatedPrompt}</label>
                                  <div className="relative group">
                                    <div className="bg-muted rounded-lg p-4 text-sm font-mono min-h-[200px] max-h-[400px] overflow-y-auto">
                                      {generatedPrompt}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleCopy(generatedPrompt, `loc_prompt_${selectedLocation.id}`)}
                                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      {copiedId === `loc_prompt_${selectedLocation.id}` ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              )
                            } catch (e) {
                              return null
                            }
                          })()}
                        </>
                      ) : (
                        <div>
                          <label className="text-sm font-medium mb-2 block">{t.locationPrompt}</label>
                          <div className="relative group">
                            <div className="bg-muted rounded-lg p-4 text-sm font-mono min-h-[200px] max-h-[400px] overflow-y-auto">
                              {fullPromptOverrides[selectedLocation.id] || `${selectedLocation.location}${selectedLocation.timeOfDay ? `, ${selectedLocation.timeOfDay}` : ''}${selectedLocation.atmosphere ? `, ${selectedLocation.atmosphere}` : ''}`}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopy(
                                fullPromptOverrides[selectedLocation.id] ||
                                `${selectedLocation.location}${selectedLocation.timeOfDay ? `, ${selectedLocation.timeOfDay}` : ''}${selectedLocation.atmosphere ? `, ${selectedLocation.atmosphere}` : ''}`,
                                `loc_prompt_legacy_${selectedLocation.id}`
                              )}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {copiedId === `loc_prompt_legacy_${selectedLocation.id}` ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>{t.locationImage}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t.imageUrl}</label>
                        <Input
                          value={locationImages[selectedLocation.id] || ''}
                          onChange={(e) => handleImageUrlChange('location', selectedLocation.id, e.target.value)}
                          placeholder="https://..."
                          className="font-mono text-sm"
                        />
                      </div>
                      <div className="w-full aspect-video border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
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
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <MapPin className="w-12 h-12" />
                            <span className="text-sm">{t.noImage}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-4">
              <MapPin className="w-12 h-12" />
              <p>{t.noLocations}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'keyProps' && (
        <div className="space-y-6">
          {allKeyProps.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <div className="flex gap-2 min-w-fit">
                  {allKeyProps.map((prop) => (
                    <Button
                      key={prop.id}
                      variant={selectedId === prop.id ? "secondary" : "outline"}
                      onClick={() => setSelectedId(prop.id)}
                      size="sm"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      {prop.name || t.unnamed}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedKeyProp && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Package className="h-5 w-5" />
                        <div className="flex flex-col">
                          {editingId === selectedKeyProp.id ? (
                            <Input
                              value={selectedKeyProp.name}
                              onChange={(e) => handleUpdateKeyProp(selectedKeyProp.id, 'name', e.target.value)}
                              onBlur={() => setEditingId(null)}
                              placeholder={t.newProp}
                              className="h-8 max-w-[160px]"
                              autoFocus
                            />
                          ) : (
                            <CardTitle className="cursor-pointer truncate text-lg" onClick={() => setEditingId(selectedKeyProp.id)}>
                              {selectedKeyProp.name || t.unnamed}
                            </CardTitle>
                          )}
                          <Badge variant="outline" className="w-fit mt-1">{t.keyProp}</Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteKeyProp(selectedKeyProp.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(selectedKeyProp as any).blocks ? (
                        <>
                          {library && (() => {
                            try {
                              return (
                                <div>
                                  <label className="text-sm font-medium mb-2 block">V8 Data</label>
                                  <div className="bg-muted rounded-lg p-4 text-sm font-mono">
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
                          <div className="space-y-2">
                            <label className="text-sm font-medium">{t.description}</label>
                            <textarea
                              value={selectedKeyProp.description}
                              onChange={(e) => handleUpdateKeyProp(selectedKeyProp.id, 'description', e.target.value)}
                              placeholder={t.description}
                              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">{t.visualPrompt}</label>
                            <div className="relative group">
                              <textarea
                                value={selectedKeyProp.visualDescription}
                                onChange={(e) => handleUpdateKeyProp(selectedKeyProp.id, 'visualDescription', e.target.value)}
                                placeholder="A rusty sword with glowing runes..."
                                className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                                rows={5}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCopy(selectedKeyProp.visualDescription, `prop_visual_${selectedKeyProp.id}`)}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                {copiedId === `prop_visual_${selectedKeyProp.id}` ? (
                                  <Check className="h-4 w-4 text-green-500" />
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

                  <Card>
                    <CardHeader>
                      <CardTitle>{t.propImage}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t.imageUrl}</label>
                        <Input
                          value={keyPropImages[selectedKeyProp.id] || ''}
                          onChange={(e) => handleImageUrlChange('keyprop', selectedKeyProp.id, e.target.value)}
                          placeholder="https://..."
                          className="font-mono text-sm"
                        />
                      </div>
                      <div className="w-full aspect-square border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                        {keyPropImages[selectedKeyProp.id] ? (
                          <img
                            src={keyPropImages[selectedKeyProp.id]}
                            alt={selectedKeyProp.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Package className="w-12 h-12" />
                            <span className="text-sm">{t.noImage}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-4">
              <Package className="w-12 h-12" />
              <p>{t.noProps}</p>
              <Button onClick={handleAddKeyProp}>
                {t.addFirstProp}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
